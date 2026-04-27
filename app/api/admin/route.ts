'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'produits' | 'promos' | 'clients' | 'rachats' | 'commandes'
interface Produit { id: number; character: string; name: string; price: number; badge: string; sold: boolean; emoji: string; meta1: string; meta2: string }
interface Promo { id: number; code: string; type: 'percent'|'fixed'; value: number; description: string; max_uses: number; uses: number; active: boolean }
interface Contact { id: number; nom: string; email: string; sujet: string; message: string; created_at: string }
interface Rachat { id: number; prenom: string; nom: string; email: string; telephone: string; personnage: string; etat: string; nombre: number; description: string; lien_photos: string; statut: string; reponse_admin: string; montant_offert: number; created_at: string }
interface Commande { id: number; stripe_session_id: string; email: string; prenom: string; articles: {name:string;qty:number;price:number}[]; total: number; statut: string; tracking: string; notes: string; created_at: string }
interface Client { id: number; email: string; prenom: string; nom: string; created_at: string }

const BADGES = ['Très bon état','Bon état','Acceptable','À restaurer']
const EMOJIS = ['🦇','⚡','🐾','🐚','𓂀','💀','🌹','🖤','👑','🌙']
const STATUTS_RACHAT = ['en_attente','contacté','accepté','refusé','reçu']
const STATUTS_COMMANDE = ['payée','en_préparation','expédiée','livrée','remboursée']

const iStyle: React.CSSProperties = { width:'100%', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'0.65rem 0.9rem', color:'#fff', fontSize:'0.85rem', outline:'none', boxSizing:'border-box' }
const btnP: React.CSSProperties = { background:'linear-gradient(135deg,#ff2d78,#c0185a)', color:'#fff', border:'none', borderRadius:'8px', padding:'0.7rem 1.4rem', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }
const btnS = (bg: string, c: string): React.CSSProperties => ({ background:bg, border:'none', borderRadius:'6px', padding:'0.35rem 0.7rem', cursor:'pointer', fontSize:'0.75rem', fontWeight:600, color:c, whiteSpace:'nowrap' })
const card: React.CSSProperties = { background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'1rem', marginBottom:'0.75rem' }

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('produits')
  const [produits, setProduits] = useState<Produit[]>([])
  const [promos, setPromos] = useState<Promo[]>([])
  const [clients, setClients] = useState<Contact[]>([])
  const [clientsComptes, setClientsComptes] = useState<Client[]>([])
  const [rachats, setRachats] = useState<Rachat[]>([])
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [np, setNp] = useState({ character:'', name:'', price:'', badge:'Très bon état', emoji:'🦇', meta1:'', meta2:'' })
  const [npr, setNpr] = useState({ code:'', type:'percent' as 'percent'|'fixed', value:'', description:'', max_uses:'100' })
  const [replyModal, setReplyModal] = useState<Rachat|null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyMontant, setReplyMontant] = useState('')
  const [replyType, setReplyType] = useState('accepté')
  const [replyLoading, setReplyLoading] = useState(false)

  const apiFetch = useCallback(async (type: string) => {
    setLoading(true)
    const res = await fetch(`/api/admin?type=${type}`)
    if (res.status === 401) { router.push('/admin-login'); return [] }
    const d = await res.json()
    setLoading(false)
    return d.data || []
  }, [router])

  const apiPost = async (body: object) => {
    const res = await fetch('/api/admin', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(body) })
    if (res.status === 401) { router.push('/admin-login'); return { success:false } }
    return res.json()
  }

  useEffect(() => {
    if (tab === 'produits') apiFetch('produits').then(setProduits)
    if (tab === 'promos') apiFetch('promos').then(setPromos)
    if (tab === 'clients') {
      apiFetch('clients').then(setClients)
      apiFetch('clients_comptes').then(setClientsComptes)
    }
    if (tab === 'rachats') apiFetch('rachats').then(setRachats)
    if (tab === 'commandes') apiFetch('commandes').then(setCommandes)
  }, [tab, apiFetch])

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000) }

  const handleLogout = async () => {
    await fetch('/api/admin-auth', { method:'DELETE' })
    router.push('/admin-login')
  }

  // Produits
  const addProduit = async () => {
    if (!np.character || !np.name || !np.price) return flash('❌ Personnage, nom et prix obligatoires')
    const d = await apiPost({ type:'produit', action:'create', data:{ ...np, price:Number(np.price), priceNum:Number(np.price), sold:false, char:np.character.toLowerCase().replace(/ /g,''), bg:`bg-${np.character.toLowerCase().split(' ')[0]}`, badgeClass:'badge-tb' } })
    if (d.success) { setProduits(p => [d.data, ...p]); setNp({ character:'', name:'', price:'', badge:'Très bon état', emoji:'🦇', meta1:'', meta2:'' }); flash('✅ Poupée ajoutée !') }
    else flash('❌ Erreur: ' + JSON.stringify(d.error))
  }
  const toggleSold = async (p: Produit) => {
    await apiPost({ type:'produit', action:'update', data:{ id:p.id, sold:!p.sold } })
    setProduits(prev => prev.map(x => x.id===p.id ? {...x,sold:!x.sold} : x))
  }
  const deleteProduit = async (id: number) => {
    if (!confirm('Supprimer ?')) return
    await apiPost({ type:'produit', action:'delete', data:{ id } })
    setProduits(p => p.filter(x => x.id!==id))
    flash('🗑 Supprimée')
  }

  // Promos
  const addPromo = async () => {
    if (!npr.code || !npr.value) return flash('❌ Code et valeur obligatoires')
    const d = await apiPost({ type:'promo', action:'create', data:{ code:npr.code.toUpperCase(), type:npr.type, value:Number(npr.value), description:npr.description, max_uses:Number(npr.max_uses)||100, uses:0, active:true } })
    if (d.success) { setPromos(p => [d.data, ...p]); setNpr({ code:'', type:'percent', value:'', description:'', max_uses:'100' }); flash('✅ Code créé !') }
    else flash('❌ Erreur: ' + JSON.stringify(d.error))
  }
  const togglePromo = async (p: Promo) => {
    await apiPost({ type:'promo', action:'update', data:{ id:p.id, active:!p.active } })
    setPromos(prev => prev.map(x => x.id===p.id ? {...x,active:!x.active} : x))
  }
  const deletePromo = async (id: number) => {
    if (!confirm('Supprimer ?')) return
    await apiPost({ type:'promo', action:'delete', data:{ id } })
    setPromos(p => p.filter(x => x.id!==id))
    flash('🗑 Supprimé')
  }

  // Réponse rachat
  const sendReply = async () => {
    if (!replyModal || !replyText.trim()) return flash('❌ Message obligatoire')
    setReplyLoading(true)
    const res = await fetch('/api/admin-reply', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ rachatId:replyModal.id, email:replyModal.email, prenom:replyModal.prenom, personnage:replyModal.personnage, reponse:replyText, montant:replyMontant, typeReponse:replyType }),
    })
    setReplyLoading(false)
    if (res.ok) {
      setRachats(prev => prev.map(x => x.id===replyModal.id ? {...x, statut:replyType, reponse_admin:replyText, montant_offert:Number(replyMontant)} : x))
      setReplyModal(null); setReplyText(''); setReplyMontant('')
      flash('✅ Réponse envoyée par email !')
    } else flash('❌ Erreur envoi')
  }

  // Commandes
  const updateCommande = async (id: number, field: string, value: string) => {
    await fetch('/api/commandes', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ action:'update', data:{ id, [field]:value } }) })
    setCommandes(prev => prev.map(x => x.id===id ? {...x,[field]:value} : x))
    flash('✅ Commande mise à jour')
  }

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding:'0.55rem 1rem', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.8rem',
    background:tab===t?'#ff2d78':'rgba(255,255,255,0.06)',
    color:tab===t?'#fff':'#888', transition:'all 0.2s',
  })

  const statutColor = (s: string) => {
    const m: Record<string,string> = { payée:'#60a5fa', en_préparation:'#fbbf24', expédiée:'#a78bfa', livrée:'#4ade80', remboursée:'#f87171', en_attente:'#fbbf24', accepté:'#4ade80', refusé:'#f87171', reçu:'#a78bfa' }
    return m[s] || '#888'
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', color:'#fff', fontFamily:'Arial,sans-serif', padding:'1.5rem', maxWidth:'1100px', margin:'0 auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <span style={{ fontSize:'1.8rem' }}>💀</span>
          <div>
            <h1 style={{ margin:0, fontSize:'1.2rem', fontWeight:700 }}>Admin — Ghoul&apos;s Closet</h1>
            <a href="/" style={{ color:'#666', fontSize:'0.75rem', textDecoration:'none' }}>← Retour au site</a>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background:'rgba(255,50,50,0.1)', border:'1px solid rgba(255,50,50,0.2)', borderRadius:'8px', color:'#f87171', cursor:'pointer', padding:'0.5rem 1rem', fontSize:'0.82rem', fontWeight:600 }}>
          Déconnexion
        </button>
      </div>

      {msg && <div style={{ background:msg.startsWith('✅')?'#0f2e1a':'#2e0f0f', border:`1px solid ${msg.startsWith('✅')?'#1a5c34':'#5c1a1a'}`, borderRadius:'8px', padding:'0.75rem 1rem', color:msg.startsWith('✅')?'#4ade80':'#f87171', marginBottom:'1rem', fontSize:'0.9rem' }}>{msg}</div>}

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.4rem', marginBottom:'2rem', flexWrap:'wrap' }}>
        <button style={tabStyle('produits')} onClick={()=>setTab('produits')}>📦 Poupées ({produits.length})</button>
        <button style={tabStyle('promos')} onClick={()=>setTab('promos')}>🏷️ Promos ({promos.filter(p=>p.active).length})</button>
        <button style={tabStyle('commandes')} onClick={()=>setTab('commandes')}>🛒 Commandes ({commandes.length})</button>
        <button style={tabStyle('rachats')} onClick={()=>setTab('rachats')}>💰 Rachats ({rachats.length})</button>
        <button style={tabStyle('clients')} onClick={()=>setTab('clients')}>👥 Clients</button>
      </div>

      {loading && <p style={{ color:'#666' }}>Chargement...</p>}

      {/* ══ PRODUITS ══ */}
      {tab==='produits' && !loading && (
        <div>
          <div style={{ background:'#111', border:'1px solid rgba(255,45,120,0.2)', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem' }}>
            <h3 style={{ color:'#ff2d78', margin:'0 0 1rem', fontSize:'0.95rem' }}>➕ Ajouter une poupée</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))', gap:'0.6rem', marginBottom:'0.75rem' }}>
              <input placeholder="Personnage *" value={np.character} onChange={e=>setNp({...np,character:e.target.value})} style={iStyle} />
              <input placeholder="Nom complet *" value={np.name} onChange={e=>setNp({...np,name:e.target.value})} style={iStyle} />
              <input placeholder="Prix (€) *" type="number" value={np.price} onChange={e=>setNp({...np,price:e.target.value})} style={iStyle} />
              <select value={np.badge} onChange={e=>setNp({...np,badge:e.target.value})} style={iStyle}>{BADGES.map(b=><option key={b}>{b}</option>)}</select>
              <select value={np.emoji} onChange={e=>setNp({...np,emoji:e.target.value})} style={iStyle}>{EMOJIS.map(e=><option key={e}>{e}</option>)}</select>
              <input placeholder="Info 1 (🌙 Complète...)" value={np.meta1} onChange={e=>setNp({...np,meta1:e.target.value})} style={iStyle} />
              <input placeholder="Info 2 (📦 Boîte...)" value={np.meta2} onChange={e=>setNp({...np,meta2:e.target.value})} style={iStyle} />
            </div>
            <button onClick={addProduit} style={btnP}>Ajouter ☠</button>
          </div>
          {produits.length===0 ? <p style={{ color:'#555', textAlign:'center', padding:'2rem' }}>Aucune poupée — ajoutez-en une !</p> :
            produits.map(p=>(
              <div key={p.id} style={{ ...card, opacity:p.sold?0.55:1, border:`1px solid ${p.sold?'rgba(255,255,255,0.04)':'rgba(255,45,120,0.15)'}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <span style={{ fontSize:'2rem' }}>{p.emoji}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ color:'#ff2d78', margin:'0 0 2px', fontSize:'0.72rem', fontWeight:600 }}>{p.character}</p>
                    <p style={{ color:'#fff', margin:'0 0 4px', fontSize:'0.85rem' }}>{p.name}</p>
                    <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                      <span style={{ color:'#ff2d78', fontWeight:700 }}>{p.price}€</span>
                      <span style={{ color:'#666', fontSize:'0.72rem' }}>{p.badge}</span>
                      {p.sold && <span style={{ background:'#222', color:'#666', fontSize:'0.68rem', padding:'2px 8px', borderRadius:'4px' }}>VENDU</span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'0.4rem' }}>
                    <button onClick={()=>toggleSold(p)} style={btnS(p.sold?'rgba(74,222,128,0.12)':'rgba(255,45,120,0.12)',p.sold?'#4ade80':'#ff2d78')}>{p.sold?'↩ Remettre':'✓ Vendu'}</button>
                    <button onClick={()=>deleteProduit(p.id)} style={btnS('rgba(255,50,50,0.1)','#f87171')}>🗑</button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ══ PROMOS ══ */}
      {tab==='promos' && !loading && (
        <div>
          <div style={{ background:'#111', border:'1px solid rgba(255,45,120,0.2)', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem' }}>
            <h3 style={{ color:'#ff2d78', margin:'0 0 1rem', fontSize:'0.95rem' }}>➕ Créer un code promo</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'0.6rem', marginBottom:'0.75rem' }}>
              <input placeholder="Code *" value={npr.code} onChange={e=>setNpr({...npr,code:e.target.value.toUpperCase()})} style={iStyle} />
              <select value={npr.type} onChange={e=>setNpr({...npr,type:e.target.value as 'percent'|'fixed'})} style={iStyle}>
                <option value="percent">% Pourcentage</option>
                <option value="fixed">€ Montant fixe</option>
              </select>
              <input placeholder="Valeur *" type="number" value={npr.value} onChange={e=>setNpr({...npr,value:e.target.value})} style={iStyle} />
              <input placeholder="Description" value={npr.description} onChange={e=>setNpr({...npr,description:e.target.value})} style={iStyle} />
              <input placeholder="Max utilisations" type="number" value={npr.max_uses} onChange={e=>setNpr({...npr,max_uses:e.target.value})} style={iStyle} />
            </div>
            <button onClick={addPromo} style={btnP}>Créer ☠</button>
          </div>
          {promos.length===0 ? <p style={{ color:'#555', textAlign:'center', padding:'2rem' }}>Aucun code promo</p> :
            promos.map(p=>(
              <div key={p.id} style={{ ...card, opacity:p.active?1:0.5 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ background:p.active?'rgba(255,45,120,0.1)':'rgba(255,255,255,0.05)', borderRadius:'8px', padding:'0.4rem 0.8rem', fontFamily:'monospace', fontWeight:700, color:p.active?'#ff2d78':'#555', minWidth:'90px', textAlign:'center', fontSize:'0.9rem' }}>{p.code}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ color:'#fff', margin:'0 0 4px', fontSize:'0.85rem' }}>{p.description||'—'}</p>
                    <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                      <span style={{ color:'#ff2d78', fontWeight:700 }}>{p.type==='percent'?`-${p.value}%`:`-${p.value}€`}</span>
                      <span style={{ color:'#666', fontSize:'0.72rem' }}>{p.uses}/{p.max_uses} utilisations</span>
                      <span style={{ background:p.active?'rgba(74,222,128,0.1)':'rgba(255,255,255,0.04)', color:p.active?'#4ade80':'#555', fontSize:'0.68rem', padding:'2px 8px', borderRadius:'4px' }}>{p.active?'ACTIF':'INACTIF'}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'0.4rem' }}>
                    <button onClick={()=>togglePromo(p)} style={btnS(p.active?'rgba(251,191,36,0.1)':'rgba(74,222,128,0.1)',p.active?'#fbbf24':'#4ade80')}>{p.active?'⏸':'▶'}</button>
                    <button onClick={()=>deletePromo(p.id)} style={btnS('rgba(255,50,50,0.1)','#f87171')}>🗑</button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ══ COMMANDES ══ */}
      {tab==='commandes' && !loading && (
        <div>
          <p style={{ color:'#666', fontSize:'0.85rem', marginBottom:'1rem' }}>🛒 {commandes.length} commande{commandes.length>1?'s':''}</p>
          {commandes.length===0 ? <p style={{ color:'#555', textAlign:'center', padding:'2rem' }}>Aucune commande</p> :
            commandes.map(c=>(
              <div key={c.id} style={card}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.75rem', flexWrap:'wrap', gap:'0.5rem' }}>
                  <div>
                    <p style={{ color:'#fff', margin:'0 0 2px', fontWeight:600 }}>{c.prenom || c.email}</p>
                    <a href={`mailto:${c.email}`} style={{ color:'#ff2d78', fontSize:'0.8rem' }}>{c.email}</a>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ color:'#ff2d78', fontWeight:700, margin:'0 0 2px', fontSize:'1.1rem' }}>{c.total}€</p>
                    <p style={{ color:'#555', fontSize:'0.72rem', margin:0 }}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                {c.articles && (
                  <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'6px', padding:'0.6rem', marginBottom:'0.75rem' }}>
                    {c.articles.map((a,i)=>(
                      <p key={i} style={{ color:'#aaa', margin:'0 0 2px', fontSize:'0.8rem' }}>• {a.name} × {a.qty} — {a.price * a.qty}€</p>
                    ))}
                  </div>
                )}
                <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                    <span style={{ color:'#666', fontSize:'0.78rem' }}>Statut :</span>
                    <select value={c.statut} onChange={e=>updateCommande(c.id,'statut',e.target.value)} style={{ ...iStyle, width:'auto', fontSize:'0.78rem', padding:'0.3rem 0.6rem', color:statutColor(c.statut) }}>
                      {STATUTS_COMMANDE.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', flex:1, minWidth:'200px' }}>
                    <span style={{ color:'#666', fontSize:'0.78rem', whiteSpace:'nowrap' }}>N° suivi :</span>
                    <input placeholder="Ex: 1A23456789FR" value={c.tracking||''} onChange={e=>updateCommande(c.id,'tracking',e.target.value)} style={{ ...iStyle, fontSize:'0.78rem', padding:'0.3rem 0.6rem' }} />
                  </div>
                </div>
                {c.stripe_session_id && <p style={{ color:'#333', fontSize:'0.68rem', margin:'0.5rem 0 0', fontFamily:'monospace' }}>Stripe: {c.stripe_session_id}</p>}
              </div>
            ))
          }
        </div>
      )}

      {/* ══ RACHATS ══ */}
      {tab==='rachats' && !loading && (
        <div>
          {rachats.length===0 ? <p style={{ color:'#555', textAlign:'center', padding:'2rem' }}>Aucune proposition</p> :
            rachats.map(r=>(
              <div key={r.id} style={card}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.5rem' }}>
                  <div>
                    <p style={{ color:'#fff', fontWeight:600, margin:'0 0 2px' }}>{r.prenom} {r.nom}</p>
                    <a href={`mailto:${r.email}`} style={{ color:'#ff2d78', fontSize:'0.8rem' }}>{r.email}{r.telephone&&` — ${r.telephone}`}</a>
                  </div>
                  <span style={{ color:'#555', fontSize:'0.72rem' }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'0.6rem' }}>
                  <span style={{ background:'rgba(255,45,120,0.1)', color:'#ff2d78', fontSize:'0.72rem', padding:'2px 8px', borderRadius:'4px' }}>{r.personnage}</span>
                  <span style={{ background:'rgba(255,255,255,0.06)', color:'#aaa', fontSize:'0.72rem', padding:'2px 8px', borderRadius:'4px' }}>{r.etat}</span>
                  <span style={{ background:'rgba(255,255,255,0.06)', color:'#aaa', fontSize:'0.72rem', padding:'2px 8px', borderRadius:'4px' }}>{r.nombre} poupée{r.nombre>1?'s':''}</span>
                  <span style={{ background:'rgba(255,255,255,0.04)', color:statutColor(r.statut), fontSize:'0.72rem', padding:'2px 8px', borderRadius:'4px', fontWeight:600 }}>{r.statut}</span>
                  {r.montant_offert && <span style={{ background:'rgba(255,45,120,0.08)', color:'#ff2d78', fontSize:'0.72rem', padding:'2px 8px', borderRadius:'4px', fontWeight:700 }}>Offre : {r.montant_offert}€</span>}
                  {r.lien_photos && <a href={r.lien_photos} target="_blank" rel="noreferrer" style={{ background:'rgba(255,255,255,0.04)', color:'#60a5fa', fontSize:'0.72rem', padding:'2px 8px', borderRadius:'4px', textDecoration:'none' }}>📷 Photos</a>}
                </div>
                {r.description && <p style={{ color:'#777', fontSize:'0.8rem', margin:'0 0 0.6rem', lineHeight:1.5 }}>{r.description}</p>}
                {r.reponse_admin && (
                  <div style={{ background:'rgba(255,45,120,0.04)', border:'1px solid rgba(255,45,120,0.1)', borderRadius:'6px', padding:'0.6rem', marginBottom:'0.6rem' }}>
                    <p style={{ color:'#666', fontSize:'0.7rem', margin:'0 0 4px' }}>Réponse envoyée :</p>
                    <p style={{ color:'#ccc', fontSize:'0.8rem', margin:0 }}>{r.reponse_admin}</p>
                  </div>
                )}
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap' }}>
                  <select value={r.statut} onChange={e=>{const v=e.target.value;fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'rachat',action:'update',data:{id:r.id,statut:v}})});setRachats(prev=>prev.map(x=>x.id===r.id?{...x,statut:v}:x))}} style={{ ...iStyle, width:'auto', fontSize:'0.78rem', padding:'0.3rem 0.6rem' }}>
                    {STATUTS_RACHAT.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={()=>{ setReplyModal(r); setReplyText(''); setReplyMontant(''); setReplyType('accepté') }} style={btnS('rgba(255,45,120,0.15)','#ff2d78')}>
                    ✉️ Répondre par email
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ══ CLIENTS ══ */}
      {tab==='clients' && !loading && (
        <div>
          {/* Contacts formulaire */}
          <h3 style={{ color:'#ff2d78', fontSize:'0.95rem', marginBottom:'1rem' }}>📧 Messages ({clients.length})</h3>
          {clients.length===0 ? <p style={{ color:'#555', marginBottom:'2rem' }}>Aucun message</p> :
            clients.map(c=>(
              <div key={c.id} style={card}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                  <span style={{ color:'#fff', fontWeight:600 }}>{c.nom}</span>
                  <span style={{ color:'#555', fontSize:'0.72rem' }}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <a href={`mailto:${c.email}`} style={{ color:'#ff2d78', fontSize:'0.8rem', display:'block', marginBottom:'0.3rem' }}>{c.email}</a>
                <p style={{ color:'#aaa', fontSize:'0.78rem', margin:'0 0 0.3rem', fontWeight:600 }}>{c.sujet}</p>
                <p style={{ color:'#777', fontSize:'0.8rem', margin:0 }}>{c.message}</p>
              </div>
            ))
          }
          {/* Comptes clients */}
          <h3 style={{ color:'#ff2d78', fontSize:'0.95rem', margin:'2rem 0 1rem' }}>👤 Comptes créés ({clientsComptes.length})</h3>
          {clientsComptes.length===0 ? <p style={{ color:'#555' }}>Aucun compte client</p> :
            clientsComptes.map(c=>(
              <div key={c.id} style={{ ...card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ color:'#fff', margin:'0 0 2px', fontWeight:600 }}>{c.prenom} {c.nom}</p>
                  <a href={`mailto:${c.email}`} style={{ color:'#ff2d78', fontSize:'0.8rem' }}>{c.email}</a>
                </div>
                <span style={{ color:'#555', fontSize:'0.72rem' }}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            ))
          }
        </div>
      )}

      {/* ══ MODAL RÉPONSE RACHAT ══ */}
      {replyModal && (
        <>
          <div onClick={()=>setReplyModal(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:2000, backdropFilter:'blur(4px)' }} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#111', border:'1px solid rgba(255,45,120,0.3)', borderRadius:'16px', padding:'2rem', width:'90%', maxWidth:'520px', zIndex:2001, maxHeight:'85vh', overflowY:'auto' }}>
            <h3 style={{ color:'#ff2d78', margin:'0 0 0.4rem' }}>✉️ Répondre à {replyModal.prenom}</h3>
            <p style={{ color:'#666', fontSize:'0.82rem', margin:'0 0 1.5rem' }}>{replyModal.email} — {replyModal.personnage}</p>

            <div style={{ marginBottom:'1rem' }}>
              <label style={{ color:'#888', fontSize:'0.78rem', display:'block', marginBottom:'0.4rem' }}>Type de réponse</label>
              <select value={replyType} onChange={e=>setReplyType(e.target.value)} style={iStyle}>
                <option value="accepté">✅ Offre acceptée</option>
                <option value="contacté">📞 Prise de contact</option>
                <option value="refusé">❌ Refus</option>
              </select>
            </div>

            {replyType==='accepté' && (
              <div style={{ marginBottom:'1rem' }}>
                <label style={{ color:'#888', fontSize:'0.78rem', display:'block', marginBottom:'0.4rem' }}>Montant offert (€)</label>
                <input type="number" placeholder="Ex: 25" value={replyMontant} onChange={e=>setReplyMontant(e.target.value)} style={iStyle} />
              </div>
            )}

            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ color:'#888', fontSize:'0.78rem', display:'block', marginBottom:'0.4rem' }}>Message *</label>
              <textarea
                rows={6}
                placeholder={replyType==='accepté' ? `Bonjour ${replyModal.prenom},\n\nMerci pour votre proposition ! Après examen, nous vous proposons ${replyMontant||'...'}€ pour votre/vos poupée(s).\n\nPour accepter, répondez simplement à cet email.` : `Bonjour ${replyModal.prenom},\n\n...`}
                value={replyText}
                onChange={e=>setReplyText(e.target.value)}
                style={{ ...iStyle, minHeight:'140px', resize:'vertical', lineHeight:1.6 }}
              />
            </div>

            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button onClick={sendReply} disabled={replyLoading} style={{ ...btnP, flex:1, opacity:replyLoading?0.6:1 }}>
                {replyLoading ? 'Envoi...' : '✉️ Envoyer par email'}
              </button>
              <button onClick={()=>setReplyModal(null)} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', color:'#888', cursor:'pointer', padding:'0.7rem 1rem', fontSize:'0.85rem' }}>Annuler</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
