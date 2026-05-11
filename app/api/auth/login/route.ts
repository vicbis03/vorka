import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

    // Créer un client avec la clé anon pour le login
    const { createClient: createAnonClient } = await import('@supabase/supabase-js')
    const anonClient = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await anonClient.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    // Récupérer le prénom depuis la table clients
    const { data: client } = await supabase
      .from('clients')
      .select('prenom, nom')
      .eq('email', email)
      .single()

    const prenom = client?.prenom || data.user.user_metadata?.prenom || email.split('@')[0]

    const res = NextResponse.json({ 
      success: true, 
      user: { email, prenom, nom: client?.nom }
    })

    // Sauvegarder le token dans un cookie sécurisé
    res.cookies.set('user_token', data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })

    // Aussi sauvegarder le prénom pour accès rapide côté client
    res.cookies.set('user_prenom', prenom, {
      httpOnly: false, // lisible côté client
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
