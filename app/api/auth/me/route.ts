import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('user_token')?.value
    if (!token) return NextResponse.json({ prenom: null })

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return NextResponse.json({ prenom: null })

    const { data: client } = await supabase.from('clients').select('prenom, nom').eq('user_id', user.id).single()
    return NextResponse.json({ prenom: client?.prenom || user.user_metadata?.prenom || null, nom: client?.nom || '' })
  } catch {
    return NextResponse.json({ prenom: null })
  }
}
