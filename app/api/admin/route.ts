import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const pwd = req.headers.get('x-admin-password')
  if (pwd !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  if (type === 'produits') {
    const { data } = await supabase.from('produits').select('*').order('created_at', { ascending: false })
    return NextResponse.json({ data })
  }
  if (type === 'promos') {
    const { data } = await supabase.from('promos').select('*').order('created_at', { ascending: false })
    return NextResponse.json({ data })
  }
  if (type === 'clients') {
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
    return NextResponse.json({ data })
  }
  if (type === 'rachats') {
    const { data } = await supabase.from('rachats').select('*').order('created_at', { ascending: false })
    return NextResponse.json({ data })
  }
  return NextResponse.json({ error: 'Type inconnu' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const pwd = req.headers.get('x-admin-password')
  if (pwd !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await req.json()
  const { type, action, data } = body

  if (type === 'produit') {
    if (action === 'create') {
      const { data: row, error } = await supabase.from('produits').insert([data]).select().single()
      return NextResponse.json({ success: !error, data: row, error })
    }
    if (action === 'update') {
      const { id, ...rest } = data
      const { error } = await supabase.from('produits').update(rest).eq('id', id)
      return NextResponse.json({ success: !error, error })
    }
    if (action === 'delete') {
      const { error } = await supabase.from('produits').delete().eq('id', data.id)
      return NextResponse.json({ success: !error, error })
    }
  }

  if (type === 'promo') {
    if (action === 'create') {
      const { data: row, error } = await supabase.from('promos').insert([data]).select().single()
      return NextResponse.json({ success: !error, data: row, error })
    }
    if (action === 'update') {
      const { id, ...rest } = data
      const { error } = await supabase.from('promos').update(rest).eq('id', id)
      return NextResponse.json({ success: !error, error })
    }
    if (action === 'delete') {
      const { error } = await supabase.from('promos').delete().eq('id', data.id)
      return NextResponse.json({ success: !error, error })
    }
  }

  if (type === 'rachat' && action === 'update') {
    const { id, ...rest } = data
    const { error } = await supabase.from('rachats').update(rest).eq('id', id)
    return NextResponse.json({ success: !error, error })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
