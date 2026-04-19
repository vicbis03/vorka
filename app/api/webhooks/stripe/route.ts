import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendDigitalProductEmail, sendOrderConfirmationEmail } from '@/lib/email';
import { createCJOrder } from '@/lib/cj';


export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event: Stripe.Event;

  // Vérifier la signature Stripe (sécurité anti-fraude)
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  // On ne traite que les paiements confirmés
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Éviter le traitement en double (idempotence)
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single();

  if (existingOrder) {
    console.log(`Commande déjà traitée: ${session.id}`);
    return NextResponse.json({ received: true });
  }

  const productId = session.metadata?.product_id;
  const productType = session.metadata?.product_type;
  const customerEmail = session.customer_details?.email || '';
  const customerName = session.customer_details?.name || '';

  if (!productId) {
    console.error('product_id manquant dans metadata');
    return NextResponse.json({ error: 'product_id manquant' }, { status: 400 });
  }

  // Récupérer le produit
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    console.error('Produit introuvable:', productId);
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  // Construire l'adresse de livraison si physique
  const shippingDetails = session.shipping_details;
  const shippingAddress = shippingDetails?.address
    ? {
        firstName: customerName.split(' ')[0] || '',
        lastName: customerName.split(' ').slice(1).join(' ') || '',
        address: shippingDetails.address.line1 || '',
        address2: shippingDetails.address.line2 || '',
        city: shippingDetails.address.city || '',
        province: shippingDetails.address.state || '',
        zip: shippingDetails.address.postal_code || '',
        country: shippingDetails.address.country || 'FR',
        phone: session.customer_details?.phone || '',
        email: customerEmail,
      }
    : null;

  // Créer la commande dans Supabase
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      stripe_session_id: session.id,
      customer_email: customerEmail,
      customer_name: customerName,
      shipping_address: shippingAddress,
      total_amount: session.amount_total || product.price,
      status: 'paid',
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Erreur création commande:', orderError);
    return NextResponse.json({ error: 'Erreur BDD' }, { status: 500 });
  }

  // Créer la ligne de commande
  await supabaseAdmin.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    quantity: 1,
    unit_price: product.price,
  });

  // Décrémenter le stock si ce n'est pas illimité
  if (product.stock > 0) {
    await supabaseAdmin
      .from('products')
      .update({ stock: product.stock - 1 })
      .eq('id', product.id);
  }

  // ─── FULFILLMENT AUTOMATIQUE ─────────────────────────────────────────────────

  let fulfillmentRef = '';

  try {
    if (productType === 'digital') {
      // ── Produit DIGITAL : email avec lien de téléchargement ──────────────────
      if (!product.download_url) {
        throw new Error('download_url manquant sur le produit digital');
      }

      const emailResult = await sendDigitalProductEmail({
        to: customerEmail,
        customerName,
        productName: product.name,
        downloadUrl: product.download_url,
        orderId: order.id,
      });

      fulfillmentRef = `resend:${emailResult?.id || 'sent'}`;
      console.log(`✅ Email digital envoyé à ${customerEmail}`);

    } else if (productType === 'physical') {
      // ── Produit PHYSIQUE : commande auto CJ Dropshipping ─────────────────────
      if (!product.cj_product_id) {
        throw new Error('cj_product_id manquant sur le produit physique');
      }

      if (!shippingAddress) {
        throw new Error('Adresse de livraison manquante');
      }

      const { cjOrderId } = await createCJOrder({
        orderNumber: order.id,
        items: [
          {
            vid: product.cj_variant_id || product.cj_product_id,
            quantity: 1,
            shippingName: 'ordinary_shipping', // Livraison standard
          },
        ],
        shippingAddress: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          country: shippingAddress.country,
          province: shippingAddress.province,
          city: shippingAddress.city,
          address: shippingAddress.address,
          zip: shippingAddress.zip,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
        },
      });

      fulfillmentRef = `cj:${cjOrderId}`;
      console.log(`✅ Commande CJ créée: ${cjOrderId}`);

      // Email de confirmation pour le client
      await sendOrderConfirmationEmail({
        to: customerEmail,
        customerName,
        productName: product.name,
        orderId: order.id,
      });
    }

    // Mettre à jour le statut en "fulfilled"
    await supabaseAdmin
      .from('orders')
      .update({ status: 'fulfilled', fulfillment_ref: fulfillmentRef })
      .eq('id', order.id);

  } catch (fulfillmentError: unknown) {
    const errMsg = fulfillmentError instanceof Error
      ? fulfillmentError.message
      : String(fulfillmentError);

    console.error('❌ Fulfillment error:', errMsg);

    // Marquer comme erreur dans la BDD pour traitement manuel
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'error',
        fulfillment_ref: `error:${errMsg.slice(0, 200)}`,
      })
      .eq('id', order.id);

    // On retourne quand même 200 à Stripe pour éviter les rejeux infinis
    return NextResponse.json({
      received: true,
      warning: 'Paiement OK mais erreur fulfillment — intervention manuelle requise',
    });
  }

  return NextResponse.json({ received: true, orderId: order.id });
}
