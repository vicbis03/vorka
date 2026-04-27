import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })

    const res = NextResponse.json({ success: true, user: { email: data.user.email, prenom: data.user.user_metadata?.prenom } })
    res.cookies.set('user_token', data.session.access_token, {
      httpOnly: true, secure: true, sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
