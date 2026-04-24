'use client'

import { useState } from 'react'

type FilterType = 'all' | 'draculaura' | 'frankie' | 'clawdeen' | 'lagoona' | 'cleo'

const PRODUCTS = [
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSent(true)
  }

  const visible = PRODUCTS.filter(p => filter === 'all' || p.char === filter)

  return (
    <>
      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">VORKA — Ghoul&apos;s <span>Closet</span></a>
        <ul>
          <li><a href="#catalog" onClick={e => { e.preventDefault(); scrollTo('catalog') }}>Boutique</a></li>
          <li><a href="#rachat" onClick={e => { e.preventDefault(); scrollTo('rachat') }}>Rachat</a></li>
          <li><a href="#footer" onClick={e => { e.preventDefault(); scrollTo('footer') }}>Contact</a></li>
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
            <span className="line2">d&apos;occasion</span>
            <span className="line3">Réservoir</span>
          </h1>
          <p className="hero-sub">Des poupées monstrueusement belles à prix décharnés. Achetez, vendez, échangez — rejoignez la Ghoul Squad !</p>
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
              <div key={p.id} className="product-card">
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
                    <button className="btn-add" disabled={p.sold}>
                      {p.sold ? 'Épuisé' : '+ Panier'}
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
          {/* Info */}
          <div>
            <div className="section-header">
              <p className="section-tag">☠ Vous vendez ?</p>
              <h2 className="section-title">Proposition de rachat</h2>
              <p className="section-sub">Vos poupées méritent une seconde vie. Proposez-nous votre collection, on étudie tout avec soin.</p>
            </div>
            {[
              { icon: '📸', title: 'Comment ça marche', text: 'Remplissez le formulaire avec les infos de vos poupées et quelques photos. On vous répond sous 48h avec une estimation de rachat.' },
              { icon: '💰', title: 'Prix de rachat', text: 'On offre 40 à 70% de la valeur marchande selon l\'état, la rareté et les accessoires inclus. Paiement par virement ou PayPal.' },
              { icon: '📦', title: 'Expédition', text: 'Vous payez les frais d\'envoi, on les rembourse à réception si le colis correspond à la description. Emballage soigneux obligatoire !' },
              { icon: '✅', title: 'Ce qu\'on rachète', text: 'Toutes les générations Monster High, accessoires, meubles, playsets. On n\'accepte pas les poupées fortement abîmées ou sans têtes 💀' },
            ].map(b => (
              <div key={b.title} className="info-block">
                <h4>{b.icon} {b.title}</h4>
                <p>{b.text}</p>
              </div>
            ))}
          </div>

          {/* Form */}
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
          {['À propos', 'Boutique', 'Rachat', 'CGV', 'Contact'].map(l => <a key={l} href="#">{l}</a>)}
        </div>
        <p>☠ 2025 — Ghoul&apos;s Closet — Tous droits réservés ☠</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', opacity: 0.5 }}>Fan site — Monster High est une marque déposée de Mattel, Inc.</p>
      </footer>
    </>
  )
}
