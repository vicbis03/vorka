import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { nom, email, sujet, message } = await req.json()

    if (!nom || !email || !sujet || !message) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    // 1. Sauvegarde dans Supabase (base de données clients)
    await supabase.from('contacts').insert([{
      nom,
      email,
      sujet,
      message,
      source: 'formulaire_contact',
      created_at: new Date().toISOString(),
    }])

    // 2. Email vers contact@vorka.eu
    await resend.emails.send({
      from: 'Vorka Contact <noreply@vorka.eu>',
      to: ['contact@vorka.eu'],
      reply_to: email,
      subject: `[Contact Vorka] ${sujet} — de ${nom}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #1a1a1a; margin-top: 0;">📬 Nouveau message — Ghoul's Closet</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 12px; background: #e5e5e5; font-weight: bold; width: 120px;">Nom</td><td style="padding: 8px 12px;">${nom}</td></tr>
            <tr><td style="padding: 8px 12px; background: #e5e5e5; font-weight: bold;">Email</td><td style="padding: 8px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 12px; background: #e5e5e5; font-weight: bold;">Sujet</td><td style="padding: 8px 12px;">${sujet}</td></tr>
          </table>
          <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px;">
            <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">💡 Clique "Répondre" pour répondre directement à ${email}</p>
        </div>
      `,
    })

    // 3. Email de confirmation au client
    await resend.emails.send({
      from: "Ghoul's Closet <noreply@vorka.eu>",
      to: [email],
      subject: "Votre message a bien été reçu — Ghoul's Closet",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #fff; border-radius: 8px;">
          <h2 style="color: #ff2d78;">Merci ${nom} ! 🖤</h2>
          <p style="color: #aaa; line-height: 1.6;">
            Nous avons bien reçu votre message concernant <strong style="color:#fff">${sujet}</strong>.<br>
            Notre équipe vous répondra sous <strong style="color:#fff">48h</strong>.
          </p>
          <hr style="border: none; border-top: 1px solid #222; margin: 20px 0;" />
          <p style="color: #555; font-size: 12px;">Ghoul's Closet — <a href="https://vorka.eu" style="color: #ff2d78;">vorka.eu</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur contact:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
