'use client'
import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = 'ghoulscloset2026'

type Tab = 'produits' | 'promos' | 'clients' | 'rachats'

interface Produit {
  id: number
  character: string
  name: string
  price: number
  badge: string
  sold: boolean
  emoji: string
}

interface PromoCode {
  code: string
  type: 'percent' | 'fixed'
  value: number
  description: string
  maxUses: number
  active: boolean
}

const BADGES = ['Très bon état', 'Bon état', 'Acceptable', 'À restaurer']
const EMOJIS = ['🦇', '⚡', '🐾', '🐚', '𓂀', '💀', '🌹', '🖤']

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pwd, setPwd] = useState('')
  const [tab, setTab] = useState<Tab>('produits')
  const [produits, setProduits] = useState<Produit[]>([
    { id: 1, character: 'Draculaura', name: 'Draculaura Sweet 1600 — Edition Anniversaire', price: 18, badge: 'Très bon état', sold: false, emoji: '🦇' },
    { id: 2, character: 'Frankie Stein', name: 'Frankie Stein Electrifying Style — 1ère Gen', price: 12, badge: 'Bon état', sold: false, emoji: '⚡' },
    { id: 3, character: 'Clawdeen Wolf', name: 'Clawdeen Wolf Scaris City of Frights', price: 22, badge: 'Très bon état', sold: false, emoji: '🐾' },
    { id: 4, character: 'Lagoona Blue', name: 'Lagoona Blue Skull Shores — Edition Été', price: 9, badge: 'Acceptable', sold: false, emoji: '🐚' },
    { id: 5, character: 'Cléo de Nile', name: 'Cléo de Nile Gloom Beach — Rare', price: 28, badge: 'Très bon état', sold: false, emoji: '𓂀' },
    { id: 6, character: 'Draculaura', name: 'Draculaura Dead Tired — Pyjama Party', price: 15, badge: 'Bon état', sold: true, emoji: '🦇' },
  ])
  const [promos, setPromos] = useState<PromoCode[]>([
    { code: 'GHOUL10', type: 'percent', value: 10, description: '10% de réduction', maxUses: 100, active: true },
    { code: 'GHOUL20', type: 'percent', value: 20, description: '20% de réduction', maxUses: 50, active: true },
    { code: 'BIENVENUE', type: 'percent', value: 15, description: '15% nouveaux clients', maxUses: 200, active: true },
    { code: 'RACHAT5', type: 'fixed', value: 5, description: '5€ offerts après rachat', maxUses: 50, active: true },
    { code: 'HALLOWEEN', type: 'percent', value: 30, description: '30% Halloween', maxUses: 30, active: false },
    { code: 'VIP2026', type: 'fixed', value: 10, description: '10€ VIP', maxUses: 10, active: true },
  ])
  const [newProduit, setNewProduit] = useState({ character: '', name: '', price: '', badge: 'Très bon état', emoji: '🦇' })
  const [newPromo, setNewPromo] = useState({ code: '', type: 'percent' as 'percent' | 'fixed', value: '', description: '', maxUses: '' })
  const [clients, setClients] = useState<{ nom: string; email: string; sujet: string; created_at: string }[]>([])
  const [rachats, setRachats] = useState<{ prenom: string; nom: string; email: string; personnage: string; etat: string; nombre: number; statut: string; created_at: string }[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (auth && (tab === 'clients' || tab === 'rachats')) {
      setLoadingData(true)
      fetch(`/api/admin/data?type=${tab}`)
        .then(r => r.json())
        .then(d => {
          if (tab === 'clients') setClients(d.data || [])
          if (tab === 'rachats') setRachats(d.data || [])
        })
        .finally(() => setLoadingData(false))
    }
  }, [auth, tab])

  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ background: '#111', border: '1px solid rgba(255,45,120,0.3)', borderRadius: '16px', padding: '2.5rem', width: '340px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💀</div>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Admin — Ghoul's Closet</h1>
            <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem' }}>Accès réservé</p>
          </div>
          <input
            type="password"
            placeholder="Mot de passe"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pwd === ADMIN_PASSWORD && setAuth(true)}
            style={{ width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }}
          />
          <button
            onClick={() => pwd === ADMIN_PASSWORD ? setAuth(true) : alert('Mot de passe incorrect')}
            style={{ width: '100%', background: 'linear-gradient(135deg,#ff2d78,#c0185a)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.8rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
          >
            Entrer ☠
          </button>
        </div>
      </div>
    )
  }

  const addProduit = () => {
    if (!newProduit.character || !newProduit.name || !newProduit.price) return
    const id = Date.now()
    setProduits(prev => [...prev, { id, character: newProduit.character, name: newProduit.name, price: Number(newProduit.price), badge: newProduit.badge, sold: false, emoji: newProduit.emoji }])
    setNewProduit({ character: '', name: '', price: '', badge: 'Très bon état', emoji: '🦇' })
  }

  const toggleSold = (id: number) => setProduits(prev => prev.map(p => p.id === id ? { ...p, sold: !p.sold } : p))
  const deleteProduit = (id: number) => setProduits(prev => prev.filter(p => p.id !== id))

  const addPromo = () => {
    if (!newPromo.code || !newPromo.value) return
    setPromos(prev => [...prev, { code: newPromo.code.toUpperCase(), type: newPromo.type, value: Number(newPromo.value), description: newPromo.description, maxUses: Number(newPromo.maxUses) || 100, active: true }])
    setNewPromo({ code: '', type: 'percent', value: '', description: '', maxUses: '' })
  }

  const togglePromo = (code: string) => setPromos(prev => prev.map(p => p.code === code ? { ...p, active: !p.active } : p))
  const deletePromo = (code: string) => setPromos(prev => prev.filter(p => p.code !== code))

  const tabStyle = (t: Tab) => ({
    padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
    background: tab === t ? '#ff2d78' : 'rgba(255,255,255,0.06)',
    color: tab === t ? '#fff' : '#888',
    transition: 'all 0.2s',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'Arial, sans-serif', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.8rem' }}>💀</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Admin — Ghoul&apos;s Closet</h1>
            <a href="/" style={{ color: '#666', fontSize: '0.75rem', textDecoration: 'none' }}>← Retour au site</a>
          </div>
        </div>
        <button onClick={() => setAuth(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', color: '#888', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          Déconnexion
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button style={tabStyle('produits')} onClick={() => setTab('produits')}>📦 Annonces ({produits.length})</button>
        <button style={tabStyle('promos')} onClick={() => setTab('promos')}>🏷️ Codes promo ({promos.filter(p => p.active).length} actifs)</button>
        <button style={tabStyle('clients')} onClick={() => setTab('clients')}>📧 Contacts</button>
        <button style={tabStyle('rachats')} onClick={() => setTab('rachats')}>💰 Rachats</button>
      </div>

      {/* ── PRODUITS ── */}
      {tab === 'produits' && (
        <div>
          {/* Formulaire ajout */}
          <div style={{ background: '#111', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#ff2d78', margin: '0 0 1rem', fontSize: '0.95rem' }}>➕ Ajouter une annonce</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <input placeholder="Personnage (ex: Draculaura)" value={newProduit.character} onChange={e => setNewProduit({...newProduit, character: e.target.value})} style={inputStyle} />
              <input placeholder="Nom complet" value={newProduit.name} onChange={e => setNewProduit({...newProduit, name: e.target.value})} style={inputStyle} />
              <input placeholder="Prix (€)" type="number" value={newProduit.price} onChange={e => setNewProduit({...newProduit, price: e.target.value})} style={inputStyle} />
              <select value={newProduit.badge} onChange={e => setNewProduit({...newProduit, badge: e.target.value})} style={inputStyle}>
                {BADGES.map(b => <option key={b}>{b}</option>)}
              </select>
              <select value={newProduit.emoji} onChange={e => setNewProduit({...newProduit, emoji: e.target.value})} style={inputStyle}>
                {EMOJIS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <button onClick={addProduit} style={btnPink}>Ajouter l&apos;annonce ☠</button>
          </div>

          {/* Liste produits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {produits.map(p => (
              <div key={p.id} style={{ background: '#111', border: `1px solid ${p.sold ? 'rgba(255,255,255,0.05)' : 'rgba(255,45,120,0.15)'}`, borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: p.sold ? 0.6 : 1 }}>
                <span style={{ fontSize: '1.8rem' }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#ff2d78', margin: '0 0 2px', fontSize: '0.75rem', fontWeight: 600 }}>{p.character}</p>
                  <p style={{ color: '#fff', margin: '0 0 4px', fontSize: '0.9rem' }}>{p.name}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: '#ff2d78', fontWeight: 700 }}>{p.price}€</span>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>{p.badge}</span>
                    {p.sold && <span style={{ background: '#333', color: '#888', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px' }}>VENDU</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => toggleSold(p.id)} style={{ ...btnSmall, background: p.sold ? 'rgba(74,222,128,0.15)' : 'rgba(255,45,120,0.15)', color: p.sold ? '#4ade80' : '#ff2d78' }}>
                    {p.sold ? '↩ Remettre' : '✓ Marquer vendu'}
                  </button>
                  <button onClick={() => deleteProduit(p.id)} style={{ ...btnSmall, background: 'rgba(255,50,50,0.1)', color: '#f87171' }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PROMOS ── */}
      {tab === 'promos' && (
        <div>
          {/* Formulaire ajout */}
          <div style={{ background: '#111', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#ff2d78', margin: '0 0 1rem', fontSize: '0.95rem' }}>➕ Créer un code promo</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <input placeholder="Code (ex: ETE30)" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} style={inputStyle} />
              <select value={newPromo.type} onChange={e => setNewPromo({...newPromo, type: e.target.value as 'percent' | 'fixed'})} style={inputStyle}>
                <option value="percent">% Pourcentage</option>
                <option value="fixed">€ Montant fixe</option>
              </select>
              <input placeholder={newPromo.type === 'percent' ? 'Valeur (ex: 20)' : 'Montant (ex: 5)'} type="number" value={newPromo.value} onChange={e => setNewPromo({...newPromo, value: e.target.value})} style={inputStyle} />
              <input placeholder="Description" value={newPromo.description} onChange={e => setNewPromo({...newPromo, description: e.target.value})} style={inputStyle} />
              <input placeholder="Nb utilisations max" type="number" value={newPromo.maxUses} onChange={e => setNewPromo({...newPromo, maxUses: e.target.value})} style={inputStyle} />
            </div>
            <button onClick={addPromo} style={btnPink}>Créer le code ☠</button>
          </div>

          {/* Liste promos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {promos.map(p => (
              <div key={p.code} style={{ background: '#111', border: `1px solid ${p.active ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: p.active ? 1 : 0.5 }}>
                <div style={{ background: p.active ? 'rgba(255,45,120,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontWeight: 700, color: p.active ? '#ff2d78' : '#555', fontSize: '1rem', minWidth: '120px', textAlign: 'center' }}>
                  {p.code}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', margin: '0 0 4px', fontSize: '0.9rem' }}>{p.description}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#ff2d78', fontWeight: 700, fontSize: '0.9rem' }}>
                      {p.type === 'percent' ? `-${p.value}%` : `-${p.value}€`}
                    </span>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>Max {p.maxUses} utilisations</span>
                    <span style={{ background: p.active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: p.active ? '#4ade80' : '#555', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px' }}>
                      {p.active ? 'ACTIF' : 'INACTIF'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => togglePromo(p.code)} style={{ ...btnSmall, background: p.active ? 'rgba(255,200,0,0.1)' : 'rgba(74,222,128,0.1)', color: p.active ? '#fbbf24' : '#4ade80' }}>
                    {p.active ? '⏸ Désactiver' : '▶ Activer'}
                  </button>
                  <button onClick={() => deletePromo(p.code)} style={{ ...btnSmall, background: 'rgba(255,50,50,0.1)', color: '#f87171' }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CLIENTS ── */}
      {tab === 'clients' && (
        <div>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>Messages reçus via le formulaire de contact</p>
          {loadingData ? (
            <p style={{ color: '#666' }}>Chargement...</p>
          ) : clients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#444' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              <p>Aucun message pour l&apos;instant</p>
              <p style={{ fontSize: '0.8rem', color: '#555' }}>Les données apparaîtront ici quand Supabase sera connecté</p>
            </div>
          ) : clients.map((c, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>{c.nom} — <a href={`mailto:${c.email}`} style={{ color: '#ff2d78' }}>{c.email}</a></span>
                <span style={{ color: '#555', fontSize: '0.75rem' }}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <p style={{ color: '#ff2d78', fontSize: '0.8rem', margin: '0 0 4px' }}>{c.sujet}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── RACHATS ── */}
      {tab === 'rachats' && (
        <div>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>Propositions de rachat reçues</p>
          {loadingData ? (
            <p style={{ color: '#666' }}>Chargement...</p>
          ) : rachats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#444' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
              <p>Aucune proposition pour l&apos;instant</p>
              <p style={{ fontSize: '0.8rem', color: '#555' }}>Les données apparaîtront ici quand Supabase sera connecté</p>
            </div>
          ) : rachats.map((r, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>{r.prenom} {r.nom} — <a href={`mailto:${r.email}`} style={{ color: '#ff2d78' }}>{r.email}</a></span>
                <span style={{ color: '#555', fontSize: '0.75rem' }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,45,120,0.1)', color: '#ff2d78', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>{r.personnage}</span>
                <span style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>{r.etat}</span>
                <span style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>{r.nombre} poupée{r.nombre > 1 ? 's' : ''}</span>
                <span style={{ background: r.statut === 'en_attente' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)', color: r.statut === 'en_attente' ? '#fbbf24' : '#4ade80', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>
                  {r.statut === 'en_attente' ? '⏳ En attente' : '✅ Traité'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
  padding: '0.65rem 0.9rem', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box',
}
const btnPink: React.CSSProperties = {
  background: 'linear-gradient(135deg,#ff2d78,#c0185a)', color: '#fff', border: 'none',
  borderRadius: '8px', padding: '0.7rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
}
const btnSmall: React.CSSProperties = {
  border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
}
