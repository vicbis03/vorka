import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { code, total } = await req.json()
    if (!code) return NextResponse.json({ valid: false, error: 'Code manquant' }, { status: 400 })

    const { data: promo, error } = await supabase
      .from('promos')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('active', true)
      .single()

    if (error || !promo) return NextResponse.json({ valid: false, error: 'Code invalide ou expiré' }, { status: 400 })
    if (promo.uses >= promo.max_uses) return NextResponse.json({ valid: false, error: 'Ce code a atteint sa limite d\'utilisation' }, { status: 400 })

    const discount = promo.type === 'percent'
      ? Math.round(total * promo.value / 100 * 100) / 100
      : Math.min(promo.value, total)

    // Incrémenter le compteur d'utilisations
    await supabase.from('promos').update({ uses: promo.uses + 1 }).eq('id', promo.id)

    return NextResponse.json({
      valid: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discount,
      description: promo.description,
      newTotal: Math.max(0, total - discount),
    })
  } catch {
    return NextResponse.json({ valid: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
