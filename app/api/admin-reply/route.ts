import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function checkAuth(req: NextRequest) {
  return req.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { rachatId, email, prenom, personnage, reponse, montant, typeReponse } = await req.json()

    // Envoyer l'email de réponse
    await resend.emails.send({
      from: "Ghoul's Closet <noreply@vorka.eu>",
      to: [email],
      reply_to: 'contact@vorka.eu',
      subject: `Réponse à votre proposition de rachat — ${personnage}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff;border-radius:8px;">
          <h2 style="color:#ff2d78;margin-top:0;">☠ Réponse à votre proposition</h2>
          <p style="color:#aaa;">Bonjour ${prenom},</p>
          <p style="color:#aaa;line-height:1.7;">Nous avons bien examiné votre proposition de rachat pour <strong style="color:#fff">${personnage}</strong>.</p>
          ${montant ? `<div style="background:#111;border:1px solid rgba(255,45,120,0.3);border-radius:8px;padding:16px;margin:16px 0;text-align:center;"><p style="color:#aaa;margin:0 0 8px;">Notre offre de rachat</p><p style="color:#ff2d78;font-size:2rem;font-weight:700;margin:0;">${montant}€</p></div>` : ''}
          <div style="background:#111;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="color:#ccc;line-height:1.7;margin:0;white-space:pre-wrap;">${reponse}</p>
          </div>
          ${typeReponse === 'accepté' ? `<p style="color:#4ade80;">✅ Pour accepter cette offre, répondez simplement à cet email ou contactez-nous à <a href="mailto:contact@vorka.eu" style="color:#ff2d78;">contact@vorka.eu</a></p>` : ''}
          <hr style="border:none;border-top:1px solid #222;margin:20px 0;"/>
          <p style="color:#555;font-size:12px;">Ghoul's Closet — <a href="https://vorka.eu" style="color:#ff2d78;">vorka.eu</a></p>
        </div>
      `,
    })

    // Mettre à jour le statut dans Supabase
    await supabase.from('rachats').update({ statut: typeReponse, reponse_admin: reponse, montant_offert: montant }).eq('id', rachatId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
