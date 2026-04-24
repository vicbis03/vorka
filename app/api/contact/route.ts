import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { nom, email, sujet, message } = await req.json()

    if (!nom || !email || !sujet || !message) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'Vorka Contact <noreply@vorka.eu>',
      // 👇 Remplace par ton adresse Gmail pour recevoir les messages
      to: ['contact@vorka.eu'],
      replyTo: email,
      subject: `[Vorka Contact] ${sujet} — de ${nom}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #1a1a1a; margin-top: 0;">📬 Nouveau message de contact — Vorka</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 12px; background: #e5e5e5; font-weight: bold; width: 120px; border-radius: 4px;">Nom</td>
              <td style="padding: 8px 12px;">${nom}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #e5e5e5; font-weight: bold; border-radius: 4px;">Email</td>
              <td style="padding: 8px 12px;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #e5e5e5; font-weight: bold; border-radius: 4px;">Sujet</td>
              <td style="padding: 8px 12px;">${sujet}</td>
            </tr>
          </table>
          <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px;">
            <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            💡 Pour répondre, cliquez sur "Répondre" — l'email ira directement à ${email}
          </p>
        </div>
      `,
    })

    // Email de confirmation au client
    await resend.emails.send({
      from: 'Vorka <noreply@vorka.eu>',
      to: [email],
      subject: 'Nous avons bien reçu votre message — Vorka',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1a1a1a;">Merci pour votre message, ${nom} !</h2>
          <p style="color: #444; line-height: 1.6;">
            Nous avons bien reçu votre demande concernant <strong>${sujet}</strong>.<br>
            Notre équipe vous répondra dans un délai de <strong>48h</strong>.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">
            Vorka — La boutique en ligne<br>
            <a href="https://vorka.eu" style="color: #888;">vorka.eu</a>
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact email error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
