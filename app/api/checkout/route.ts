import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

const STOCK: Record<number, number> = { 1:1, 2:1, 3:1, 4:1, 5:1, 6:0 }

export async function POST(req: NextRequest) {
  try {
    const { items, promoCode, discountAmount } = await req.json()

    if (!items || items.length === 0) return NextResponse.json({ error: 'Panier vide' }, { status: 400 })

    for (const item of items) {
      const stock = STOCK[item.id] ?? 0
      if (item.qty > stock) return NextResponse.json({ error: `Stock insuffisant pour "${item.name}"`, outOfStock: true }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://vorka.eu'

    // Créer les line_items normalement
    const lineItems = items.map((item: { name: string; price: number; qty: number }) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: "Poupée Monster High d'occasion — Ghoul's Closet",
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }))

    // Si code promo → créer un coupon Stripe à la volée
    let discounts: { coupon: string }[] = []
    if (promoCode && discountAmount > 0) {
      const total = items.reduce((acc: number, i: { price: number; qty: number }) => acc + i.price * i.qty, 0)
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100), // en centimes
        currency: 'eur',
        duration: 'once',
        name: `Code ${promoCode}`,
        max_redemptions: 1,
      })
      discounts = [{ coupon: coupon.id }]
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'fr',
      line_items: lineItems,
      discounts: discounts.length > 0 ? discounts : undefined,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: baseUrl,
      shipping_address_collection: { allowed_countries: ['FR', 'BE', 'LU', 'CH'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 490, currency: 'eur' },
            display_name: 'Colissimo Standard',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'eur' },
            display_name: 'Lettre suivie',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erreur lors du paiement' }, { status: 500 })
  }
}
