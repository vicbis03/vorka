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
    const body = await req.json()
    const { prenom, nom, email, telephone, personnage, etat, nombre, description, lienPhotos } = body

    // 1. Sauvegarde dans Supabase
    await supabase.from('rachats').insert([{
      prenom,
      nom,
      email,
      telephone,
      personnage,
      etat,
      nombre,
      description,
      lien_photos: lienPhotos,
      statut: 'en_attente',
      created_at: new Date().toISOString(),
    }])

    // 2. Email vers contact@vorka.eu
    await resend.emails.send({
      from: "Ghoul's Closet <noreply@vorka.eu>",
      to: ['contact@vorka.eu'],
      reply_to: email,
      subject: `[Rachat] ${personnage} — ${prenom} ${nom}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #1a1a1a;">💰 Nouvelle proposition de rachat</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px; background: #e5e5e5; font-weight: bold;">Nom</td><td style="padding: 8px;">${prenom} ${nom}</td></tr>
            <tr><td style="padding: 8px; background: #e5e5e5; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px; background: #e5e5e5; font-weight: bold;">Téléphone</td><td style="padding: 8px;">${telephone || 'Non renseigné'}</td></tr>
            <tr><td style="padding: 8px; background: #e5e5e5; font-weight: bold;">Personnage</td><td style="padding: 8px;">${personnage}</td></tr>
            <tr><td style="padding: 8px; background: #e5e5e5; font-weight: bold;">État</td><td style="padding: 8px;">${etat}</td></tr>
            <tr><td style="padding: 8px; background: #e5e5e5; font-weight: bold;">Nombre</td><td style="padding: 8px;">${nombre}</td></tr>
            <tr><td style="padding: 8px; background: #e5e5e5; font-weight: bold;">Photos</td><td style="padding: 8px;">${lienPhotos ? `<a href="${lienPhotos}">${lienPhotos}</a>` : 'Aucun lien'}</td></tr>
          </table>
          <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px;">
            <p style="margin: 0; color: #333; line-height: 1.6;">${description}</p>
          </div>
        </div>
      `,
    })

    // 3. Confirmation au vendeur
    await resend.emails.send({
      from: "Ghoul's Closet <noreply@vorka.eu>",
      to: [email],
      subject: "Proposition de rachat reçue — Ghoul's Closet",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #fff; border-radius: 8px;">
          <h2 style="color: #ff2d78;">☠ Proposition reçue, ${prenom} !</h2>
          <p style="color: #aaa; line-height: 1.6;">
            Nous avons bien reçu votre proposition de rachat pour <strong style="color:#fff">${personnage}</strong>.<br>
            On examine tout avec attention et on revient vers vous sous <strong style="color:#fff">48h</strong>. 🖤
          </p>
          <hr style="border: none; border-top: 1px solid #222; margin: 20px 0;" />
          <p style="color: #555; font-size: 12px;">Ghoul's Closet — <a href="https://vorka.eu" style="color: #ff2d78;">vorka.eu</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur rachat:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
