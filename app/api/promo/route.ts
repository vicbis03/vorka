import { NextRequest, NextResponse } from 'next/server'

const PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number; description: string; maxUses: number; uses: number }> = {
  "GHOUL10":   { type: "percent", value: 10, description: "10% de réduction", maxUses: 100, uses: 0 },
  "GHOUL20":   { type: "percent", value: 20, description: "20% de réduction", maxUses: 50,  uses: 0 },
  "BIENVENUE": { type: "percent", value: 15, description: "15% nouveaux clients", maxUses: 200, uses: 0 },
  "RACHAT5":   { type: "fixed",   value: 5,  description: "5€ offerts après rachat", maxUses: 50, uses: 0 },
  "HALLOWEEN": { type: "percent", value: 30, description: "30% Halloween", maxUses: 30, uses: 0 },
  "VIP2026":   { type: "fixed",   value: 10, description: "10€ VIP", maxUses: 10, uses: 0 },
}

export async function POST(req: NextRequest) {
  try {
    const { code, total } = await req.json()
    const promo = PROMO_CODES[code?.toUpperCase().trim()]

    if (!promo) {
      return NextResponse.json({ valid: false, error: 'Code invalide ou expiré' }, { status: 400 })
    }

    if (promo.uses >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: 'Ce code a atteint sa limite d\'utilisation' }, { status: 400 })
    }

    const discount = promo.type === 'percent'
      ? Math.round(total * promo.value / 100 * 100) / 100
      : Math.min(promo.value, total)

    return NextResponse.json({
      valid: true,
      code: code.toUpperCase(),
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
