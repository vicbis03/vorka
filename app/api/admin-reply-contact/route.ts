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
    const { contactId, email, nom, sujet, reponse } = await req.json()

    await resend.emails.send({
      from: "Ghoul's Closet <noreply@vorka.eu>",
      to: [email],
      reply_to: 'contact@vorka.eu',
      subject: `Re: ${sujet} — Ghoul's Closet`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff;border-radius:8px;">
          <div style="text-align:center;margin-bottom:20px;">
            <span style="font-size:40px;">💀</span>
            <h1 style="color:#ff2d78;margin:8px 0 0;font-size:1.2rem;">Ghoul's Closet</h1>
          </div>
          <h2 style="color:#fff;margin:0 0 12px;">Réponse à votre message</h2>
          <p style="color:#aaa;margin:0 0 8px;">Bonjour ${nom},</p>
          <div style="background:#111;border:1px solid rgba(255,45,120,0.2);border-radius:8px;padding:16px;margin:16px 0;">
            <p style="color:#ddd;line-height:1.7;margin:0;white-space:pre-wrap;">${reponse}</p>
          </div>
          <div style="background:#1a1a1a;border:1px solid rgba(255,45,120,0.15);border-radius:8px;padding:12px;margin-top:16px;">
            <p style="color:#888;font-size:0.78rem;margin:0;">
              ⚠️ <strong style="color:#aaa;">Vous ne voyez pas cet email ?</strong> Vérifiez votre dossier <strong style="color:#ff2d78;">Spam</strong> et ajoutez <strong>noreply@vorka.eu</strong> à vos contacts.
            </p>
          </div>
          <hr style="border:none;border-top:1px solid #222;margin:20px 0;"/>
          <p style="color:#444;font-size:0.75rem;text-align:center;">Ghoul's Closet — <a href="https://vorka.eu" style="color:#ff2d78;">vorka.eu</a></p>
        </div>
      `,
    })

    // Marquer comme répondu dans Supabase
    await supabase.from('contacts').update({ 
      statut: 'répondu',
      reponse_admin: reponse 
    }).eq('id', contactId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
