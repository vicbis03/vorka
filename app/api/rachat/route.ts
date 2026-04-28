import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SPAM_WARNING = `
  <div style="background:#1a1a1a;border:1px solid rgba(255,45,120,0.2);border-radius:8px;padding:12px;margin-top:16px;">
    <p style="color:#888;font-size:0.78rem;margin:0;">
      ⚠️ <strong style="color:#aaa;">Vous ne voyez pas cet email ?</strong> Vérifiez votre dossier <strong style="color:#ff2d78;">Spam / Courrier indésirable</strong> et ajoutez <strong>noreply@vorka.eu</strong> à vos contacts.
    </p>
  </div>
`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prenom, nom, email, telephone, personnage, etat, nombre, description, lienPhotos } = body

    await supabase.from('rachats').insert([{ prenom, nom, email, telephone, personnage, etat, nombre, description, lien_photos: lienPhotos, statut: 'en_attente' }])

    await resend.emails.send({
      from: "Ghoul's Closet <noreply@vorka.eu>",
      to: ['contact@vorka.eu'],
      reply_to: email,
      subject: `[Rachat] ${personnage} — ${prenom} ${nom}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px;">
        <h2 style="color:#1a1a1a;">💰 Nouvelle proposition de rachat</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:8px;background:#e5e5e5;font-weight:bold;">Nom</td><td style="padding:8px;">${prenom} ${nom}</td></tr>
          <tr><td style="padding:8px;background:#e5e5e5;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px;background:#e5e5e5;font-weight:bold;">Téléphone</td><td style="padding:8px;">${telephone || 'Non renseigné'}</td></tr>
          <tr><td style="padding:8px;background:#e5e5e5;font-weight:bold;">Personnage</td><td style="padding:8px;">${personnage}</td></tr>
          <tr><td style="padding:8px;background:#e5e5e5;font-weight:bold;">État</td><td style="padding:8px;">${etat}</td></tr>
          <tr><td style="padding:8px;background:#e5e5e5;font-weight:bold;">Nombre</td><td style="padding:8px;">${nombre}</td></tr>
          ${lienPhotos ? `<tr><td style="padding:8px;background:#e5e5e5;font-weight:bold;">Photos</td><td style="padding:8px;"><a href="${lienPhotos}">${lienPhotos}</a></td></tr>` : ''}
        </table>
        <div style="background:#fff;border:1px solid #ddd;border-radius:8px;padding:16px;">
          <p style="margin:0;color:#333;line-height:1.6;">${description || 'Aucune description'}</p>
        </div>
      </div>`,
    })

    await resend.emails.send({
      from: "Ghoul's Closet <noreply@vorka.eu>",
      to: [email],
      subject: "Proposition de rachat reçue — Ghoul's Closet",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff;border-radius:8px;">
        <div style="text-align:center;margin-bottom:16px;"><span style="font-size:40px;">💀</span><h1 style="color:#ff2d78;margin:8px 0 0;font-size:1.3rem;">Ghoul's Closet</h1></div>
        <h2 style="color:#fff;">☠ Proposition reçue, ${prenom} !</h2>
        <p style="color:#aaa;line-height:1.7;">Nous avons bien reçu votre proposition de rachat pour <strong style="color:#fff">${personnage}</strong>.<br>On examine tout avec attention et on revient vers vous sous <strong style="color:#fff">48h</strong>. 🖤</p>
        ${SPAM_WARNING}
        <hr style="border:none;border-top:1px solid #222;margin:20px 0;"/>
        <p style="color:#444;font-size:0.75rem;text-align:center;">Ghoul's Closet — <a href="https://vorka.eu" style="color:#ff2d78;">vorka.eu</a></p>
      </div>`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
