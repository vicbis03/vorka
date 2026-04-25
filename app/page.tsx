'use client'

import { useState } from 'react'

type FilterType = 'all' | 'draculaura' | 'frankie' | 'clawdeen' | 'lagoona' | 'cleo'

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
}

interface CartItem extends Product {
  qty: number
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    char: 'draculaura',
    emoji: '🦇',
    bg: 'bg-draculaura',
    badge: 'Très bon état',
    badgeClass: 'badge-tb',
    character: 'Draculaura',
    name: "Draculaura Sweet 1600 — Edition Anniversaire",
    meta1: '🌙 Complète avec accessoires',
    meta2: '📦 Boîte incluse',
    price: '18€',
    priceNum: 18,
    sold: false,
  },
  {
    id: 2,
    char: 'frankie',
    emoji: '⚡',
    bg: 'bg-frankie',
    badge: 'Bon état',
    badgeClass: 'badge-b',
    character: 'Frankie Stein',
    name: "Frankie Stein Electrifying Style — 1ère Gen",
    meta1: '🔩 Quelques taches mineures',
    meta2: '📦 Sans boîte',
    price: '12€',
    priceNum: 12,
    sold: false,
  },
  {
    id: 3,
    char: 'clawdeen',
    emoji: '🐾',
    bg: 'bg-clawdeen',
    badge: 'Très bon état',
    badgeClass: 'badge-tb',
    character: 'Clawdeen Wolf',
    name: "Clawdeen Wolf Scaris City of Frights",
    meta1: '🌟 Complète avec accessoires',
    meta2: '📦 Boîte incluse',
    price: '22€',
    priceNum: 22,
    sold: false,
  },
  {
    id: 4,
    char: 'lagoona',
    emoji: '🐚',
    bg: 'bg-lagoona',
    badge: 'Acceptable',
    badgeClass: 'badge-ab',
    character: 'Lagoona Blue',
    name: "Lagoona Blue Skull Shores — Edition Été",
    meta1: '💧 Cheveux légèrement emmêlés',
    meta2: '📦 Sans boîte',
    price: '9€',
    priceNum: 9,
    sold: false,
  },
  {
    id: 5,
    char: 'cleo',
    emoji: '𓂀',
    bg: 'bg-cleo',
    badge: 'Très bon état',
    badgeClass: 'badge-tb',
    character: 'Cléo de Nile',
    name: "Cléo de Nile Gloom Beach — Rare",
    meta1: '👑 Tous les bijoux présents',
    meta2: '📦 Boîte incluse',
    price: '28€',
    priceNum: 28,
    sold: false,
  },
  {
    id: 6,
    char: 'draculaura',
    emoji: '🦇',
    bg: 'bg-draculaura',
    badge: 'Vendu',
    badgeClass: 'badge-sold',
    character: 'Draculaura',
    name: "Draculaura Dead Tired — Pyjama Party",
    meta1: 'Poupée vendue',
    meta2: '',
    price: '15€',
    priceNum: 15,
    sold: true,
  },
]

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Tout voir' },
  { key: 'draculaura', label: 'Draculaura' },
  { key: 'frankie', label: 'Frankie Stein' },
  { key: 'clawdeen', label: 'Clawdeen Wolf' },
  { key: 'lagoona', label: 'Lagoona Blue' },
  { key: 'cleo', label: 'Cléo de Nile' },
]

export default function Home() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [formSent, setFormSent] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [skullHovered, setSkullHovered] = useState(false)
  const [addedId, setAddedId] = useState<number | null>(null)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSent(true)
  }

  const totalItems = cart.reduce((acc, i) => acc + i.qty, 0)
  const totalPrice = cart.reduce((acc, i) => acc + i.priceNum * i.qty, 0)

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

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    )
  }

  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart.map(i => ({ id: i.id, name: i.name, price: i.priceNum, qty: i.qty })) }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  const visible = PRODUCTS.filter(p => filter === 'all' || p.char === filter)

  return (
    <>
      {/* ── SKULL CART BUTTON ── */}
      <button
        onClick={() => setSidebarOpen(true)}
        onMouseEnter={() => setSkullHovered(true)}
        onMouseLeave={() => setSkullHovered(false)}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1.2rem',
          zIndex: 1000,
          background: skullHovered ? 'rgba(255,45,120,0.18)' : 'rgba(20,0,10,0.7)',
          border: skullHovered ? '2px solid #ff2d78' : '2px solid rgba(255,45,120,0.3)',
          borderRadius: '50%',
          width: '52px',
          height: '52px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.7rem',
          transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
          transform: skullHovered ? 'scale(1.15) rotate(-8deg)' : 'scale(1)',
          boxShadow: skullHovered ? '0 0 18px rgba(255,45,120,0.5)' : '0 2px 12px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Panier"
      >
        <span style={{ fontSize: '1.7rem', lineHeight: 1 }}>💀</span>
        {totalItems > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ff2d78',
            color: '#fff',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '0.7rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #0a0a0a',
            animation: 'pop 0.3s ease',
          }}>
            {totalItems}
          </span>
        )}
      </button>

      {/* ── SIDEBAR PANIER ── */}
      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            zIndex: 1001, backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: sidebarOpen ? 0 : '-420px',
        width: '100%',
        maxWidth: '400px',
        height: '100vh',
        background: '#0f0f0f',
        borderLeft: '1px solid rgba(255,45,120,0.2)',
        zIndex: 1002,
        display: 'flex',
        flexDirection: 'column',
        transition: 'right 0.35s cubic-bezier(.4,0,.2,1)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
      }}>
        {/* Header sidebar */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>💀</span>
            <div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontWeight: 700 }}>Mon panier</h2>
              <p style={{ color: '#666', margin: 0, fontSize: '0.75rem' }}>
                {totalItems === 0 ? 'Vide pour l\'instant' : `${totalItems} article${totalItems > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '8px',
              color: '#aaa',
              cursor: 'pointer',
              padding: '0.5rem 0.75rem',
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#444' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>💀</div>
              <p style={{ fontSize: '0.9rem' }}>Ton panier est vide, ghoul...</p>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  marginTop: '1rem',
                  background: 'transparent',
                  border: '1px solid rgba(255,45,120,0.4)',
                  color: '#ff2d78',
                  borderRadius: '8px',
                  padding: '0.6rem 1.2rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >Continuer les achats</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                alignItems: 'center',
              }}>
                {/* Emoji produit */}
                <div style={{
                  width: '52px', height: '52px',
                  background: 'rgba(255,45,120,0.08)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', flexShrink: 0,
                }}>
                  {item.emoji}
                </div>
                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#ff2d78', fontSize: '0.7rem', fontWeight: 600, margin: '0 0 2px', letterSpacing: '0.05em' }}>
                    {item.character}
                  </p>
                  <p style={{ color: '#fff', fontSize: '0.8rem', margin: '0 0 6px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </p>
                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => updateQty(item.id, -1)} style={qtyBtnStyle}>−</button>
                    <span style={{ color: '#fff', fontSize: '0.85rem', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={qtyBtnStyle}>+</button>
                    <button onClick={() => removeFromCart(item.id)} style={{ ...qtyBtnStyle, marginLeft: '0.25rem', color: '#ff4444' }}>🗑</button>
                  </div>
                </div>
                {/* Prix */}
                <p style={{ color: '#ff2d78', fontWeight: 700, fontSize: '0.95rem', margin: 0, flexShrink: 0 }}>
                  {item.priceNum * item.qty}€
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer sidebar */}
        {cart.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: '#0a0a0a',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>Total</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{totalPrice}€</span>
            </div>
            <button
              onClick={handleCheckout}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ff2d78, #c0185a)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.9rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '0.75rem',
                letterSpacing: '0.02em',
                transition: 'opacity 0.2s',
              }}
            >
              ☠ Acheter maintenant — {totalPrice}€
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                width: '100%',
                background: 'transparent',
                color: '#888',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '0.75rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Continuer les achats
            </button>
          </div>
        )}
      </div>

      {/* ── STYLES ANIMATION ── */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pop { 0% { transform: scale(0.5) } 70% { transform: scale(1.2) } 100% { transform: scale(1) } }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">VORKA — Ghoul&apos;s <span>Closet</span></a>
        <ul>
          <li><a href="#catalog" onClick={e => { e.preventDefault(); scrollTo('catalog') }}>Boutique</a></li>
          <li><a href="#rachat" onClick={e => { e.preventDefault(); scrollTo('rachat') }}>Rachat</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
        <button className="nav-badge" onClick={() => scrollTo('rachat')}>💀 Vendre mes poupées</button>
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
            <div className="hero-stat"><span className="num">150+</span><span className="label">Poupées disponibles</span></div>
            <div className="hero-stat"><span className="num">72h</span><span className="label">Délai d&apos;expédition</span></div>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-header">
            <p className="section-tag">☠ Boutique</p>
            <h2 className="section-title">Salle d&apos;études de la Ghoul Squad</h2>
            <p className="section-sub">Chaque poupée est vérifiée, décrite avec soin et expédiée avec amour macabre.</p>
          </div>

          <div className="filters">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`filter-btn${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {visible.map(p => (
              <div key={p.id} className="product-card" style={addedId === p.id ? { transform: 'scale(0.97)', transition: 'transform 0.2s' } : {}}>
                <div className={`doll-placeholder ${p.bg}`} style={p.sold ? { filter: 'grayscale(0.7)' } : {}}>
                  <span style={{ fontSize: '5rem', position: 'relative', zIndex: 1, opacity: p.sold ? 0.5 : 1 }}>{p.emoji}</span>
                  <div className={`badge-etat ${p.badgeClass}`}>{p.badge}</div>
                </div>
                <div className="product-body">
                  <p className="product-character">{p.character}</p>
                  <h3 className="product-name">{p.name}</h3>
                  <div className="product-meta">
                    <span style={p.sold ? { color: 'rgba(200,184,216,0.4)' } : {}}>{p.meta1}</span>
                    {p.meta2 && <span>{p.meta2}</span>}
                  </div>
                  <div className="product-footer">
                    <span className="product-price" style={p.sold ? { color: 'rgba(255,45,120,0.3)' } : {}}>{p.price}</span>
                    <button
                      className="btn-add"
                      disabled={p.sold}
                      onClick={() => !p.sold && addToCart(p)}
                      style={addedId === p.id ? { background: '#1a5c34', transform: 'scale(0.95)' } : {}}
                    >
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
              { icon: '📸', title: 'Comment ça marche', text: 'Remplissez le formulaire avec les infos de vos poupées et quelques photos. On vous répond sous 48h avec une estimation de rachat.' },
              { icon: '💰', title: 'Prix de rachat', text: 'On offre 40 à 70% de la valeur marchande selon l\'état, la rareté et les accessoires inclus. Paiement par virement ou bon d\'achat.' },
              { icon: '📦', title: 'Expédition', text: 'Vous payez les frais d\'envoi, on les rembourse à réception si le colis correspond à la description. Emballage soigneux obligatoire !' },
              { icon: '✅', title: 'Ce qu\'on rachète', text: 'Toutes les générations Monster High, accessoires, meubles, playsets. On n\'accepte pas les poupées fortement abîmées ou sans têtes 💀' },
            ].map(b => (
              <div key={b.title} className="info-block">
                <h4>{b.icon} {b.title}</h4>
                <p>{b.text}</p>
              </div>
            ))}
          </div>

          <div>
            {!formSent ? (
              <form className="rachat-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group"><label>Prénom</label><input type="text" placeholder="Draculaura" required /></div>
                  <div className="form-group"><label>Nom</label><input type="text" placeholder="Von Bat" required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Email</label><input type="email" placeholder="ghoul@monsterhigh.com" required /></div>
                  <div className="form-group"><label>Téléphone</label><input type="tel" placeholder="06 66 66 66 66" /></div>
                </div>
                <div className="form-group">
                  <label>Personnage(s) concerné(s)</label>
                  <select required defaultValue="">
                    <option value="" disabled>Sélectionner un personnage</option>
                    {['Draculaura','Frankie Stein','Clawdeen Wolf','Lagoona Blue','Cléo de Nile','Ghoulia Yelps','Abbey Bominable','Spectra Vondergeist','Toralei Stripe','Autre / Plusieurs'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>État général</label>
                  <div className="etat-radios">
                    {[
                      { id: 'e-tb', val: 'tres_bon', dot: 'var(--lime)', label: 'Très bon état' },
                      { id: 'e-b', val: 'bon', dot: 'var(--teal)', label: 'Bon état' },
                      { id: 'e-ab', val: 'acceptable', dot: 'var(--gold)', label: 'Acceptable' },
                      { id: 'e-mq', val: 'mauvais', dot: 'var(--pink)', label: 'À restaurer' },
                    ].map(r => (
                      <div key={r.id} className="etat-radio">
                        <input type="radio" name="etat" id={r.id} value={r.val} />
                        <label htmlFor={r.id}><span className="etat-dot" style={{ background: r.dot }} />{r.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Nombre de poupées</label>
                  <input type="number" min={1} max={100} placeholder="ex. 3" required />
                </div>
                <div className="form-group">
                  <label>Description détaillée</label>
                  <textarea placeholder="Décrivez vos poupées : édition, année, accessoires inclus, défauts éventuels, boîtes présentes..." />
                </div>
                <div className="form-group">
                  <label>Lien photos (Google Drive, WeTransfer…)</label>
                  <input type="url" placeholder="https://drive.google.com/..." />
                </div>
                <div className="form-group">
                  <div className="checkbox-group">
                    <input type="checkbox" id="consent" required />
                    <label htmlFor="consent">J&apos;accepte que mes données soient utilisées pour traiter ma demande de rachat. Aucune donnée ne sera partagée avec des tiers. 🖤</label>
                  </div>
                </div>
                <div className="submit-row">
                  <span className="submit-note">Réponse sous 48h</span>
                  <button type="submit" className="btn-submit">Envoyer ma proposition ☠</button>
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
        </div>
        <p>☠ 2025 — Ghoul&apos;s Closet — Tous droits réservés ☠</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', opacity: 0.5 }}>Fan site — Monster High est une marque déposée de Mattel, Inc.</p>
      </footer>
    </>
  )
}

const qtyBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color: '#fff',
  cursor: 'pointer',
  width: '26px',
  height: '26px',
  fontSize: '0.9rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
}
