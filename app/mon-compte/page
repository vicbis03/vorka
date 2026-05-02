import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('user_token')?.value
    if (!token) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    await supabase.from('clients').delete().eq('user_id', user.id)
    await supabase.auth.admin.deleteUser(user.id)

    const res = NextResponse.json({ success: true })
    res.cookies.delete('user_token')
    return res
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
