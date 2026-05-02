import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
  const { data } = await supabase.from('clients').select('*').eq('user_id', id).single()
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { id, prenom, nom, telephone, adresse, code_postal, ville, date_naissance } = body
  const { error } = await supabase.from('clients').update({ prenom, nom, telephone, adresse, code_postal, ville, date_naissance }).eq('user_id', id)
  return NextResponse.json({ success: !error, error })
}
