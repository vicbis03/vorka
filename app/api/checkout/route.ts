import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Stock réel — 1 exemplaire par poupée (occasion)
const STOCK: Record<number, number> = {
  1: 1, // Draculaura Sweet 1600
  2: 1, // Frankie Stein
  3: 1, // Clawdeen Wolf
  4: 1, // Lagoona Blue
  5: 1, // Cléo de Nile
  6: 0, // Draculaura Dead Tired — vendue
}

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
    }

    // Vérification du stock
    for (const item of items) {
      const stock = STOCK[item.id] ?? 0
      if (item.qty > stock) {
        return NextResponse.json({
          error: `Stock insuffisant pour "${item.name}". Stock disponible : ${stock}`,
          outOfStock: true,
          productId: item.id,
        }, { status: 400 })
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'fr',
      line_items: items.map((item: { name: string; price: number; qty: number }) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            description: "Poupée Monster High d'occasion — Ghoul's Closet",
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      success_url: `${process.env.NEXT_PUBLIC_URL || 'https://vorka.eu'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'https://vorka.eu'}`,
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE'],
      },
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
            display_name: 'Lettre suivie (petits articles)',
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
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 })
  }
}
