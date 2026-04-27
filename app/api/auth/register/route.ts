import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, password, prenom, nom } = await req.json()
    if (!email || !password || !prenom) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Mot de passe trop court (6 caractères min)' }, { status: 400 })

    const { data, error } = await supabase.auth.admin.createUser({
      email, password,
      user_metadata: { prenom, nom },
      email_confirm: true,
    })

    if (error) {
      if (error.message.includes('already')) return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Sauvegarder dans table clients
    await supabase.from('clients').insert([{ email, prenom, nom, user_id: data.user.id }])

    // Email de bienvenue
    await resend.emails.send({
      from: "Ghoul's Closet <noreply@vorka.eu>",
      to: [email],
      subject: "Bienvenue chez Ghoul's Closet ! 🖤",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff;border-radius:8px;">
          <h2 style="color:#ff2d78;">Bienvenue ${prenom} ! ☠</h2>
          <p style="color:#aaa;line-height:1.7;">Ton compte Ghoul's Closet est créé. Tu peux maintenant accéder à ton historique de commandes et tes propositions de rachat.</p>
          <a href="https://vorka.eu" style="display:inline-block;background:#ff2d78;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;margin-top:16px;">Visiter la boutique</a>
          <hr style="border:none;border-top:1px solid #222;margin:20px 0;"/>
          <p style="color:#555;font-size:12px;">Ghoul's Closet — <a href="https://vorka.eu" style="color:#ff2d78;">vorka.eu</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
