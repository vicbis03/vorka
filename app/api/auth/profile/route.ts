import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getUser(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value
  if (!token) return null
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).single()
  return NextResponse.json({ profile: { ...data, email: user.email } })
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  const body = await req.json()
  const { prenom, nom, telephone, adresse, code_postal, ville, date_naissance } = body
  const { error } = await supabase.from('clients').update({ prenom, nom, telephone, adresse, code_postal, ville, date_naissance }).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
