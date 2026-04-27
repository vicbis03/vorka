import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function checkAuth(req: NextRequest) {
  return req.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { data } = await supabase.from('commandes').select('*').order('created_at', { ascending: false })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { action, data } = await req.json()
  if (action === 'update') {
    const { id, ...rest } = data
    const { error } = await supabase.from('commandes').update(rest).eq('id', id)
    return NextResponse.json({ success: !error, error })
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
