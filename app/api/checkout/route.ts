import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'productId manquant' }, { status: 400 });
    }

    // Récupérer le produit depuis Supabase
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('active', true)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    if (product.stock === 0) {
      return NextResponse.json({ error: 'Produit en rupture de stock' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const isPhysical = product.type === 'physical';

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.image_url ? [product.image_url] : [],
              metadata: {
                product_id: product.id,
                product_type: product.type,
              },
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',

      // Collecter l'adresse de livraison pour les produits physiques
      ...(isPhysical && {
        shipping_address_collection: {
          allowed_countries: [
            'FR', 'BE', 'CH', 'LU', 'DE', 'ES', 'IT', 'NL', 'PT',
            'AT', 'PL', 'SE', 'DK', 'FI', 'NO', 'GB', 'IE', 'US', 'CA',
          ],
        },
      }),

      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=${product.type}`,
      cancel_url: `${siteUrl}/products/${product.id}`,

      metadata: {
        product_id: product.id,
        product_type: product.type,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: unknown) {
    console.error('Checkout error:', err);
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
