'use client'

import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

import { useState, useEffect } from 'react'

type FilterType = 'all' | 'draculaura' | 'frankie' | 'clawdeen' | 'lagoona' | 'cleo' | 'pops' | 'pop'

interface Product {
  id: number
  char: string
  emoji: string
  bg: string
  badge: string
  badgeClass: string
  character: string
  name: string
  meta1: string
  meta2: string
  price: string
  priceNum: number
  sold: boolean
  type: 'poupee' | 'pop'
}

interface CartItem extends Product {
  qty: number
}

const PRODUCTS: Product[] = [
  { id: 1, char: 'draculaura', emoji: '🦇', bg: 'bg-draculaura', badge: 'Très bon état', badgeClass: 'badge-tb', character: 'Draculaura', name: "Draculaura Sweet 1600 — Edition Anniversaire", meta1: '🌙 Complète avec accessoires', meta2: '📦 Boîte incluse', price: '18€', priceNum: 18, sold: false, type: 'poupee' },
  { id: 2, char: 'frankie', emoji: '⚡', bg: 'bg-frankie', badge: 'Bon état', badgeClass: 'badge-b', character: 'Frankie Stein', name: "Frankie Stein Electrifying Style — 1ère Gen", meta1: '🔩 Quelques taches mineures', meta2: '📦 Sans boîte', price: '12€', priceNum: 12, sold: false, type: 'poupee' },
  { id: 3, char: 'clawdeen', emoji: '🐾', bg: 'bg-clawdeen', badge: 'Très bon état', badgeClass: 'badge-tb', character: 'Clawdeen Wolf', name: "Clawdeen Wolf Scaris City of Frights", meta1: '🌟 Complète avec accessoires', meta2: '📦 Boîte incluse', price: '22€', priceNum: 22, sold: false, type: 'poupee' },
  { id: 4, char: 'lagoona', emoji: '🐚', bg: 'bg-lagoona', badge: 'Acceptable', badgeClass: 'badge-ab', character: 'Lagoona Blue', name: "Lagoona Blue Skull Shores — Edition Été", meta1: '💧 Cheveux légèrement emmêlés', meta2: '📦 Sans boîte', price: '9€', priceNum: 9, sold: false, type: 'poupee' },
  { id: 5, char: 'cleo', emoji: '𓂀', bg: 'bg-cleo', badge: 'Très bon état', badgeClass: 'badge-tb', character: 'Cléo de Nile', name: "Cléo de Nile Gloom Beach — Rare", meta1: '👑 Tous les bijoux présents', meta2: '📦 Boîte incluse', price: '28€', priceNum: 28, sold: false, type: 'poupee' },
  { id: 6, char: 'draculaura', emoji: '🦇', bg: 'bg-draculaura', badge: 'Vendu', badgeClass: 'badge-sold', character: 'Draculaura', name: "Draculaura Dead Tired — Pyjama Party", meta1: 'Poupée vendue', meta2: '', price: '15€', priceNum: 15, sold: true, type: 'poupee' },
  { id: 7, char: 'pop', emoji: '🖤', bg: 'bg-draculaura', badge: 'Très bon état', badgeClass: 'badge-tb', character: 'Draculaura', name: "Pop Funko Draculaura — Monster High", meta1: '🎭 Édition limitée', meta2: '📦 Boîte incluse', price: '15€', priceNum: 15, sold: false, type: 'pop' },
  { id: 8, char: 'pop', emoji: '🖤', bg: 'bg-frankie', badge: 'Bon état', badgeClass: 'badge-b', character: 'Frankie Stein', name: "Pop Funko Frankie Stein — Monster High", meta1: '⚡ Série spéciale', meta2: '📦 Sans boîte', price: '12€', priceNum: 12, sold: false, type: 'pop' },
]

const FILTERS: { key: FilterType; label: string; isPop?: boolean }[] = [
  { key: 'all', label: 'Tout voir' },
  { key: 'draculaura', label: 'Draculaura' },
  { key: 'frankie', label: 'Frankie Stein' },
  { key: 'clawdeen', label: 'Clawdeen Wolf' },
  { key: 'lagoona', label: 'Lagoona Blue' },
  { key: 'cleo', label: 'Cléo de Nile' },
  { key: 'pop', label: '🖤 Pops Funko', isPop: true },
]

export default function Home() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [formSent, setFormSent] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [skullHovered, setSkullHovered] = useState(false)
  const [addedId, setAddedId] = useState<number | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const prenom = data.user.user_metadata?.prenom
        setUserName(prenom || data.user.email?.split('@')[0] || 'Mon compte')
      }
    })
  }, [])
  const [currentUser, setCurrentUser] = useState<{ prenom: string } | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState<{ discount: number; description: string; type: string; value: number } | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const totalItems = cart.reduce((acc, i) => acc + i.qty, 0)
  const totalPrice = cart.reduce((acc, i) => acc + i.priceNum * i.qty, 0)
  const discount = promoApplied ? promoApplied.discount : 0
  const totalFinal = Math.max(0, totalPrice - discount)

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 800)
    setSidebarOpen(true)
  }

  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id))
  const updateQty = (id: number, delta: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0))

  const applyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true); setPromoError(null)
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.toUpperCase(), total: totalPrice }),
      })
      const data = await res.json()
      if (data.valid) {
        setPromoApplied({ discount: data.discount, description: data.description, type: data.type, value: data.value })
        setPromoError(null)
      } else {
        setPromoError(data.error || 'Code invalide')
        setPromoApplied(null)
      }
    } catch { setPromoError('Erreur réseau') }
    finally { setPromoLoading(false) }
  }

  const handleCheckout = async () => {
    setCheckoutError(null); setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ id: i.id, name: i.name, price: i.priceNum, qty: i.qty })),
          discount: promoApplied ? { amount: Math.round(discount * 100), code: promoCode } : null,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setCheckoutError(data.error || 'Erreur de paiement')
    } catch { setCheckoutError('Erreur réseau') }
    finally { setCheckoutLoading(false) }
  }

  const handleRachat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setFormLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      await fetch('/api/rachat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: fd.get('prenom'), nom: fd.get('nom'),
          email: fd.get('email'), telephone: fd.get('telephone'),
          personnage: fd.get('personnage'), etat: fd.get('etat'),
          nombre: fd.get('nombre'), description: fd.get('description'),
          lienPhotos: fd.get('lienPhotos'),
        }),
      })
      setFormSent(true)
    } catch { setFormSent(true) }
    finally { setFormLoading(false) }
  }

  const visible = PRODUCTS.filter(p => {
    if (filter === 'all') return true
    if (filter === 'pop') return p.type === 'pop'
    return p.char === filter && p.type === 'poupee'
  })

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes pop { 0% { transform:scale(0.5) } 70% { transform:scale(1.2) } 100% { transform:scale(1) } }
      `}</style>

      {/* SKULL CART */}
      <button
        onClick={() => setSidebarOpen(true)}
        onMouseEnter={() => setSkullHovered(true)}
        onMouseLeave={() => setSkullHovered(false)}
        style={{ position:'fixed', top:'1rem', right:'1.2rem', zIndex:1000, background:skullHovered?'rgba(255,45,120,0.18)':'rgba(20,0,10,0.7)', border:skullHovered?'2px solid #ff2d78':'2px solid rgba(255,45,120,0.3)', borderRadius:'50%', width:'52px', height:'52px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.7rem', transition:'all 0.25s cubic-bezier(.4,0,.2,1)', transform:skullHovered?'scale(1.15) rotate(-8deg)':'scale(1)', boxShadow:skullHovered?'0 0 18px rgba(255,45,120,0.5)':'0 2px 12px rgba(0,0,0,0.4)', backdropFilter:'blur(8px)' }}
        aria-label="Panier"
      >
        💀
        {totalItems > 0 && (
          <span style={{ position:'absolute', top:'-4px', right:'-4px', background:'#ff2d78', color:'#fff', borderRadius:'50%', width:'20px', height:'20px', fontSize:'0.7rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #0a0a0a', animation:'pop 0.3s ease' }}>
            {totalItems}
          </span>
        )}
      </button>

      {/* SIDEBAR */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1001, backdropFilter:'blur(2px)', animation:'fadeIn 0.2s ease' }} />}
      <div style={{ position:'fixed', top:0, right:sidebarOpen?0:'-420px', width:'100%', maxWidth:'400px', height:'100vh', background:'#0f0f0f', borderLeft:'1px solid rgba(255,45,120,0.2)', zIndex:1002, display:'flex', flexDirection:'column', transition:'right 0.35s cubic-bezier(.4,0,.2,1)', boxShadow:'-8px 0 40px rgba(0,0,0,0.6)' }}>
        {/* Header */}
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
            <span style={{ fontSize:'1.4rem' }}>💀</span>
            <div>
              <h2 style={{ color:'#fff', margin:0, fontSize:'1rem', fontWeight:700 }}>Mon panier</h2>
              <p style={{ color:'#666', margin:0, fontSize:'0.75rem' }}>{totalItems === 0 ? 'Vide pour l\'instant' : `${totalItems} article${totalItems > 1 ? 's' : ''}`}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', color:'#aaa', cursor:'pointer', padding:'0.5rem 0.75rem', fontSize:'1rem' }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:'auto', padding:'1rem 1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem 1rem', color:'#444' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem', opacity:0.4 }}>💀</div>
              <p style={{ fontSize:'0.9rem' }}>Ton panier est vide, ghoul...</p>
              <button onClick={() => setSidebarOpen(false)} style={{ marginTop:'1rem', background:'transparent', border:'1px solid rgba(255,45,120,0.4)', color:'#ff2d78', borderRadius:'8px', padding:'0.6rem 1.2rem', cursor:'pointer', fontSize:'0.85rem', fontWeight:600 }}>Continuer les achats</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display:'flex', gap:'1rem', padding:'1rem 0', borderBottom:'1px solid rgba(255,255,255,0.05)', alignItems:'center' }}>
                <div style={{ width:'52px', height:'52px', background:'rgba(255,45,120,0.08)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', flexShrink:0 }}>
                  {item.emoji}
                  {item.type === 'pop' && <span style={{ position:'absolute', fontSize:'0.5rem', background:'#ff2d78', color:'#fff', borderRadius:'4px', padding:'1px 3px', marginTop:'-32px', marginLeft:'24px' }}>POP</span>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', gap:'0.4rem', alignItems:'center', marginBottom:'2px' }}>
                    <p style={{ color:'#ff2d78', fontSize:'0.7rem', fontWeight:600, margin:0, letterSpacing:'0.05em' }}>{item.character}</p>
                    {item.type === 'pop' && <span style={{ background:'rgba(255,45,120,0.2)', color:'#ff2d78', fontSize:'0.6rem', padding:'1px 5px', borderRadius:'4px', fontWeight:700 }}>POP</span>}
                  </div>
                  <p style={{ color:'#fff', fontSize:'0.8rem', margin:'0 0 6px', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <button onClick={() => updateQty(item.id, -1)} style={qtyBtnStyle}>−</button>
                    <span style={{ color:'#fff', fontSize:'0.85rem', minWidth:'16px', textAlign:'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={qtyBtnStyle}>+</button>
                    <button onClick={() => removeFromCart(item.id)} style={{ ...qtyBtnStyle, marginLeft:'0.25rem', color:'#ff4444' }}>🗑</button>
                  </div>
                </div>
                <p style={{ color:'#ff2d78', fontWeight:700, fontSize:'0.95rem', margin:0, flexShrink:0 }}>{item.priceNum * item.qty}€</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding:'1.25rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.06)', background:'#0a0a0a' }}>
            {/* Promo code */}
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <input
                  type="text"
                  placeholder="Code promo"
                  value={promoCode}
                  onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(null) }}
                  onKeyDown={e => e.key === 'Enter' && applyPromo()}
                  style={{ flex:1, background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'0.6rem 0.8rem', color:'#fff', fontSize:'0.85rem', outline:'none' }}
                />
                <button onClick={applyPromo} disabled={promoLoading || !promoCode} style={{ background:'rgba(255,45,120,0.15)', border:'1px solid rgba(255,45,120,0.3)', borderRadius:'8px', color:'#ff2d78', cursor:'pointer', padding:'0.6rem 0.9rem', fontSize:'0.82rem', fontWeight:600, whiteSpace:'nowrap' }}>
                  {promoLoading ? '...' : 'Appliquer'}
                </button>
              </div>
              {promoError && <p style={{ color:'#f87171', fontSize:'0.75rem', margin:'4px 0 0' }}>❌ {promoError}</p>}
              {promoApplied && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'6px', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'6px', padding:'6px 10px' }}>
                  <span style={{ color:'#4ade80', fontSize:'0.78rem' }}>✅ {promoApplied.description}</span>
                  <span style={{ color:'#4ade80', fontWeight:700, fontSize:'0.85rem' }}>-{discount}€</span>
                </div>
              )}
            </div>

            {checkoutError && <div style={{ background:'#2e0f0f', border:'1px solid #5c1a1a', borderRadius:'8px', padding:'0.75rem', color:'#f87171', fontSize:'0.82rem', marginBottom:'0.75rem', textAlign:'center' }}>❌ {checkoutError}</div>}

            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
              <span style={{ color:'#888', fontSize:'0.9rem' }}>Sous-total</span>
              <span style={{ color:'#fff', fontSize:'0.9rem' }}>{totalPrice}€</span>
            </div>
            {promoApplied && (
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                <span style={{ color:'#4ade80', fontSize:'0.9rem' }}>Réduction ({promoApplied.type === 'percent' ? `-${promoApplied.value}%` : `-${promoApplied.value}€`})</span>
                <span style={{ color:'#4ade80', fontSize:'0.9rem' }}>-{discount}€</span>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem', paddingTop:'0.5rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color:'#fff', fontWeight:700 }}>Total</span>
              <span style={{ color:'#ff2d78', fontWeight:700, fontSize:'1.1rem' }}>{totalFinal}€</span>
            </div>

            <button onClick={handleCheckout} disabled={checkoutLoading} style={{ width:'100%', background:checkoutLoading?'#555':'linear-gradient(135deg,#ff2d78,#c0185a)', color:'#fff', border:'none', borderRadius:'10px', padding:'0.9rem', fontSize:'0.95rem', fontWeight:700, cursor:checkoutLoading?'not-allowed':'pointer', marginBottom:'0.75rem', letterSpacing:'0.02em', transition:'opacity 0.2s' }}>
              {checkoutLoading ? 'Chargement...' : `☠ Acheter maintenant — ${totalFinal}€`}
            </button>
            <button onClick={() => setSidebarOpen(false)} style={{ width:'100%', background:'transparent', color:'#888', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'0.75rem', fontSize:'0.85rem', cursor:'pointer' }}>
              Continuer les achats
            </button>
          </div>
        )}
      </div>

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">VORKA — Ghoul&apos;s <span>Closet</span></a>
        <ul>
          <li><a href="#catalog" onClick={e => { e.preventDefault(); scrollTo('catalog') }}>Boutique</a></li>
          <li><a href="#rachat" onClick={e => { e.preventDefault(); scrollTo('rachat') }}>Rachat</a></li>
          <li><a href="/contact">Contact</a></li>
          <li>
            <a href={currentUser ? '/mon-compte' : '/inscription'} style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
              {currentUser ? `👤 ${currentUser.prenom}` : 'Mon compte'}
            </a>
          </li>
        </ul>
        <button className="nav-badge" onClick={() => scrollTo('rachat')} style={{ marginRight:'70px' }}>
          💀 Vendre mes poupées
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="skull-deco left">☠</div>
        <div className="skull-deco right">☠</div>
        <div className="hero-content">
          <p className="hero-eyebrow">☠ Collection exclusive de seconde main ☠</p>
          <h1 className="hero-title">
            <span className="line1">Monster High</span>
            <span className="line2">collection</span>
            <span className="line3">d&apos;occasion</span>
          </h1>
          <p className="hero-sub">Des poupées monstrueusement belles à prix décharnés. Achetez, vendez, — rejoignez la Ghoul Squad !</p>
          <div className="hero-ctas">
            <a href="#catalog" className="btn-primary" onClick={e => { e.preventDefault(); scrollTo('catalog') }}>Voir la boutique</a>
            <a href="#rachat" className="btn-secondary" onClick={e => { e.preventDefault(); scrollTo('rachat') }}>Proposer un rachat</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="num">150+</span><span className="label">Articles disponibles</span></div>
            <div className="hero-stat"><span className="num">72h</span><span className="label">Délai d&apos;expédition</span></div>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="section-header">
            <p className="section-tag">☠ Boutique</p>
            <h2 className="section-title">Salle d&apos;études de la Ghoul Squad</h2>
            <p className="section-sub">Chaque article est vérifié, décrit avec soin et expédié avec amour macabre.</p>
          </div>

          <div className="filters">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`filter-btn${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
                style={f.isPop ? { border: filter === f.key ? undefined : '1px solid rgba(255,45,120,0.3)', borderRadius:'20px' } : {}}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filter === 'pop' && (
            <div style={{ background:'rgba(255,45,120,0.05)', border:'1px solid rgba(255,45,120,0.15)', borderRadius:'12px', padding:'1rem 1.25rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <span style={{ fontSize:'1.5rem' }}>🖤</span>
              <div>
                <p style={{ color:'#ff2d78', fontWeight:700, margin:'0 0 2px', fontSize:'0.9rem' }}>Pops Funko Monster High</p>
                <p style={{ color:'#888', margin:0, fontSize:'0.8rem' }}>Figurines collector Monster High — état occasion vérifié</p>
              </div>
            </div>
          )}

          <div className="products-grid">
            {visible.map(p => (
              <div key={p.id} className="product-card" style={addedId === p.id ? { transform:'scale(0.97)', transition:'transform 0.2s' } : {}}>
                <div className={`doll-placeholder ${p.bg}`} style={p.sold ? { filter:'grayscale(0.7)' } : {}}>
                  <span style={{ fontSize:'5rem', position:'relative', zIndex:1, opacity:p.sold?0.5:1 }}>{p.emoji}</span>
                  {p.type === 'pop' && <span style={{ position:'absolute', top:'0.5rem', left:'0.5rem', background:'#ff2d78', color:'#fff', fontSize:'0.65rem', fontWeight:700, padding:'2px 6px', borderRadius:'4px', letterSpacing:'0.05em', zIndex:2 }}>FUNKO POP</span>}
                  <div className={`badge-etat ${p.badgeClass}`}>{p.badge}</div>
                </div>
                <div className="product-body">
                  <p className="product-character">{p.character}</p>
                  <h3 className="product-name">{p.name}</h3>
                  <div className="product-meta">
                    <span style={p.sold ? { color:'rgba(200,184,216,0.4)' } : {}}>{p.meta1}</span>
                    {p.meta2 && <span>{p.meta2}</span>}
                  </div>
                  <div className="product-footer">
                    <span className="product-price" style={p.sold ? { color:'rgba(255,45,120,0.3)' } : {}}>{p.price}</span>
                    <button className="btn-add" disabled={p.sold} onClick={() => !p.sold && addToCart(p)} style={addedId === p.id ? { background:'#1a5c34', transform:'scale(0.95)' } : {}}>
                      {p.sold ? 'Épuisé' : addedId === p.id ? '✓ Ajouté !' : '+ Panier'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RACHAT */}
      <section id="rachat">
        <div className="rachat-layout">
          <div>
            <div className="section-header">
              <p className="section-tag">☠ Vous vendez ?</p>
              <h2 className="section-title">Proposition de rachat</h2>
              <p className="section-sub">Vos poupées méritent une seconde vie. Proposez-nous votre collection, on étudie tout avec soin.</p>
            </div>
            {[
              { icon:'📸', title:'Comment ça marche', text:'Remplissez le formulaire avec les infos de vos poupées et quelques photos. On vous répond sous 48h avec une estimation de rachat.' },
              { icon:'💰', title:'Prix de rachat', text:'On offre 40 à 70% de la valeur marchande selon l\'état, la rareté et les accessoires inclus. Paiement par virement ou bon d\'achat.' },
              { icon:'📦', title:'Expédition', text:'Vous payez les frais d\'envoi, on les rembourse à réception si le colis correspond à la description. Emballage soigneux obligatoire !' },
              { icon:'✅', title:'Ce qu\'on rachète', text:'Toutes les générations Monster High, Pops Funko, accessoires, meubles, playsets. On n\'accepte pas les articles fortement abîmés 💀' },
            ].map(b => (
              <div key={b.title} className="info-block">
                <h4>{b.icon} {b.title}</h4>
                <p>{b.text}</p>
              </div>
            ))}
          </div>

          <div>
            {!formSent ? (
              <form className="rachat-form" onSubmit={handleRachat}>
                <div className="form-row">
                  <div className="form-group"><label>Prénom</label><input name="prenom" type="text" placeholder="Draculaura" required /></div>
                  <div className="form-group"><label>Nom</label><input name="nom" type="text" placeholder="Von Bat" required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Email</label><input name="email" type="email" placeholder="ghoul@monsterhigh.com" required /></div>
                  <div className="form-group"><label>Téléphone</label><input name="telephone" type="tel" placeholder="06 66 66 66 66" /></div>
                </div>
                <div className="form-group">
                  <label>Type d&apos;article</label>
                  <select name="personnage" required defaultValue="">
                    <option value="" disabled>Sélectionner...</option>
                    <optgroup label="🧟 Poupées Monster High">
                      {['Draculaura','Frankie Stein','Clawdeen Wolf','Lagoona Blue','Cléo de Nile','Ghoulia Yelps','Abbey Bominable','Spectra Vondergeist','Toralei Stripe'].map(o => <option key={o}>{o}</option>)}
                    </optgroup>
                    <optgroup label="🖤 Pops Funko">
                      {['Pop Funko Draculaura','Pop Funko Frankie Stein','Pop Funko Clawdeen','Pop Funko Monster High (autre)'].map(o => <option key={o}>{o}</option>)}
                    </optgroup>
                    <option value="Autre / Plusieurs">Autre / Plusieurs</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>État général</label>
                  <div className="etat-radios">
                    {[
                      { id:'e-tb', val:'Très bon état', dot:'var(--lime)', label:'Très bon état' },
                      { id:'e-b', val:'Bon état', dot:'var(--teal)', label:'Bon état' },
                      { id:'e-ab', val:'Acceptable', dot:'var(--gold)', label:'Acceptable' },
                      { id:'e-mq', val:'À restaurer', dot:'var(--pink)', label:'À restaurer' },
                    ].map(r => (
                      <div key={r.id} className="etat-radio">
                        <input type="radio" name="etat" id={r.id} value={r.val} />
                        <label htmlFor={r.id}><span className="etat-dot" style={{ background:r.dot }} />{r.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group"><label>Nombre d&apos;articles</label><input name="nombre" type="number" min={1} max={100} placeholder="ex. 3" required /></div>
                <div className="form-group"><label>Description détaillée</label><textarea name="description" placeholder="Décrivez vos articles : édition, année, accessoires inclus, défauts éventuels, boîtes présentes..." /></div>
                <div className="form-group"><label>Lien photos (Google Drive, WeTransfer…)</label><input name="lienPhotos" type="url" placeholder="https://drive.google.com/..." /></div>
                <div className="form-group">
                  <div className="checkbox-group">
                    <input type="checkbox" id="consent" required />
                    <label htmlFor="consent">J&apos;accepte que mes données soient utilisées pour traiter ma demande de rachat. 🖤</label>
                  </div>
                </div>
                <div className="submit-row">
                  <span className="submit-note">Réponse sous 48h</span>
                  <button type="submit" className="btn-submit" disabled={formLoading}>
                    {formLoading ? 'Envoi...' : 'Envoyer ma proposition ☠'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="success-msg show">
                <h3>☠ Proposition reçue !</h3>
                <p>Merci ! On examine votre collection avec attention et on revient vers vous très vite. Restez à l&apos;écoute, ghoul ! 🖤</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer">
        <div className="logo">Ghoul&apos;s <span>Closet</span></div>
        <div className="footer-links">
          <a href="/a-propos">À propos</a>
          <a href="#catalog" onClick={e => { e.preventDefault(); scrollTo('catalog') }}>Boutique</a>
          <a href="#rachat" onClick={e => { e.preventDefault(); scrollTo('rachat') }}>Rachat</a>
          <a href="/cgv">CGV</a>
          <a href="/contact">Contact</a>
          <a href="/inscription">Mon compte</a>
        </div>
        <p>☠ 2025 — Ghoul&apos;s Closet — Tous droits réservés ☠</p>
        <p style={{ marginTop:'0.5rem', fontSize:'0.7rem', opacity:0.5 }}>Fan site — Monster High est une marque déposée de Mattel, Inc.</p>
      </footer>
    </>
  )
}

const qtyBtnStyle: React.CSSProperties = {
  background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:'6px', color:'#fff', cursor:'pointer', width:'26px', height:'26px',
  fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center', padding:0,
}
