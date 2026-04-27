import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function checkAuth(req: NextRequest) {
  return req.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  const tableMap: Record<string, string> = {
    produits: 'produits', promos: 'promos',
    clients: 'contacts', rachats: 'rachats', commandes: 'commandes',
  }

  if (type === 'clients_comptes') {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    return NextResponse.json({ data })
  }

  if (type && tableMap[type]) {
    const { data } = await supabase.from(tableMap[type]).select('*').order('created_at', { ascending: false })
    return NextResponse.json({ data })
  }

  return NextResponse.json({ error: 'Type inconnu' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await req.json()
  const { type, action, data } = body

  const tableMap: Record<string, string> = {
    produit: 'produits', promo: 'promos', rachat: 'rachats', commande: 'commandes',
  }

  const table = tableMap[type]
  if (!table) return NextResponse.json({ error: 'Type inconnu' }, { status: 400 })

  if (action === 'create') {
    const { data: row, error } = await supabase.from(table).insert([data]).select().single()
    return NextResponse.json({ success: !error, data: row, error })
  }
  if (action === 'update') {
    const { id, ...rest } = data
    const { error } = await supabase.from(table).update(rest).eq('id', id)
    return NextResponse.json({ success: !error, error })
  }
  if (action === 'delete') {
    const { error } = await supabase.from(table).delete().eq('id', data.id)
    return NextResponse.json({ success: !error, error })
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
  )
}
