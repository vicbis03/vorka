import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email manquant' }, { status: 400 })

    // Générer le lien de reset via Supabase
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: 'https://vorka.eu/reset-password' },
    })

    if (error || !data?.properties?.action_link) {
      // On retourne success quand même pour ne pas révéler si l'email existe
      return NextResponse.json({ success: true })
    }

    // Envoyer l'email via Resend (qui fonctionne déjà sur le projet)
    await resend.emails.send({
      from: "Ghoul's Closet <noreply@vorka.eu>",
      to: [email],
      subject: "Réinitialisation de ton mot de passe — Ghoul's Closet",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff;border-radius:8px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:48px;">💀</span>
            <h1 style="color:#ff2d78;margin:8px 0 0;font-size:1.4rem;">Ghoul's Closet</h1>
          </div>
          <h2 style="color:#fff;margin:0 0 12px;">Réinitialisation de ton mot de passe</h2>
          <p style="color:#aaa;line-height:1.7;margin:0 0 24px;">
            Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous pour en choisir un nouveau.
            Ce lien est valable <strong style="color:#fff">1 heure</strong>.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${data.properties.action_link}" style="display:inline-block;background:linear-gradient(135deg,#ff2d78,#c0185a);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:1rem;">
              Réinitialiser mon mot de passe ☠
            </a>
          </div>
          <p style="color:#555;font-size:0.82rem;line-height:1.6;">
            Si tu n'as pas demandé cette réinitialisation, ignore simplement cet email.
          </p>
          <div style="background:#1a1a1a;border:1px solid rgba(255,45,120,0.2);border-radius:8px;padding:12px;margin-top:16px;">
            <p style="color:#888;font-size:0.78rem;margin:0;">
              ⚠️ <strong style="color:#aaa;">Tu ne vois pas cet email ?</strong> Vérifie ton dossier <strong style="color:#ff2d78;">Spam / Courrier indésirable</strong> et ajoute <strong>noreply@vorka.eu</strong> à tes contacts.
            </p>
          </div>
          <hr style="border:none;border-top:1px solid #222;margin:20px 0;"/>
          <p style="color:#444;font-size:0.75rem;text-align:center;">Ghoul's Closet — <a href="https://vorka.eu" style="color:#ff2d78;">vorka.eu</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ success: true }) // toujours success pour sécurité
  }
}
