'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Section = 'profil' | 'commandes' | 'rachats' | 'messages'

interface Profile {
  prenom: string; nom: string; email: string; telephone: string
  adresse: string; code_postal: string; ville: string; date_naissance: string
}

const iStyle: React.CSSProperties = {
  width:'100%', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:'8px', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.9rem',
  outline:'none', boxSizing:'border-box',
}
const lblStyle: React.CSSProperties = {
  color:'#888', fontSize:'0.72rem', display:'block', marginBottom:'0.3rem',
  letterSpacing:'0.06em', textTransform:'uppercase',
}
const sColor = (s: string) => ({
  payée:'#60a5fa', en_préparation:'#fbbf24', expédiée:'#a78bfa',
  livrée:'#4ade80', remboursée:'#f87171', en_attente:'#fbbf24',
  accepté:'#4ade80', refusé:'#f87171', reçu:'#a78bfa', répondu:'#4ade80',
} as Record<string,string>)[s] || '#888'

export default function MonComptePage() {
  const router = useRouter()
  const [section, setSection] = useState<Section>('profil')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<Profile>({ prenom:'', nom:'', email:'', telephone:'', adresse:'', code_postal:'', ville:'', date_naissance:'' })
  const [commandes, setCommandes] = useState<any[]>([])
  const [rachats, setRachats] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/inscription'); return }

      // Charger profil
      const r = await fetch('/api/auth/profile')
      const d = await r.json()
      if (d.profile) { setProfile(d.profile); setForm(d.profile) }

      // Charger commandes, rachats, messages
      const email = session.user.email || ''
      const [cmd, rch, msg] = await Promise.all([
        supabase.from('commandes').select('*').eq('email', email).order('created_at', { ascending: false }),
        supabase.from('rachats').select('*').eq('email', email).order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').eq('email', email).order('created_at', { ascending: false }),
      ])
      setCommandes(cmd.data || [])
      setRachats(rch.data || [])
      setMessages(msg.data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000) }
  const set = (k: keyof Profile, v: string) => setForm(f => ({...f,[k]:v}))

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/auth/profile', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify(form),
    })
    const d = await res.json()
    setSaving(false)
    if (d.success) { setProfile(form); flash('✅ Profil mis à jour !') }
    else flash('❌ ' + d.error)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    await fetch('/api/auth/logout', { method:'POST' })
    router.push('/')
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    const res = await fetch('/api/auth/delete', { method:'DELETE' })
    const d = await res.json()
    if (d.success) { await supabase.auth.signOut(); router.push('/') }
    else { flash('❌ ' + d.error); setDeleteLoading(false) }
  }

  const secStyle = (s: Section): React.CSSProperties => ({
    padding:'0.65rem 1.2rem', border:'none', borderRadius:'8px', cursor:'pointer',
    fontWeight:600, fontSize:'0.82rem', transition:'all 0.2s',
    background: section===s ? '#ff2d78' : 'rgba(255,255,255,0.06)',
    color: section===s ? '#fff' : '#888',
  })

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Arial,sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:'1rem', opacity:0.3 }}>💀</div>
        <p style={{ color:'#666' }}>Chargement de ton espace...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', color:'#fff', fontFamily:'Arial,sans-serif', padding:'0' }}>

      {/* Header */}
      <div style={{ background:'#0f0f0f', borderBottom:'1px solid rgba(255,45,120,0.15)', padding:'1.25rem 1.5rem' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <a href="/" style={{ color:'#555', fontSize:'0.75rem', textDecoration:'none' }}>← Retour à la boutique</a>
            <h1 style={{ margin:'4px 0 0', fontSize:'1.3rem', fontWeight:700 }}>
              Bonjour <span style={{ color:'#ff2d78' }}>{profile?.prenom || '👤'}</span> ☠
            </h1>
            <p style={{ color:'#555', margin:0, fontSize:'0.8rem' }}>{form.email}</p>
          </div>
          <button onClick={handleLogout} style={{ background:'rgba(255,50,50,0.1)', border:'1px solid rgba(255,50,50,0.2)', borderRadius:'8px', color:'#f87171', cursor:'pointer', padding:'0.5rem 1rem', fontSize:'0.82rem', fontWeight:600 }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'1.5rem' }}>

        {/* Flash msg */}
        {msg && <div style={{ background:msg.startsWith('✅')?'#0f2e1a':'#2e0f0f', border:`1px solid ${msg.startsWith('✅')?'#1a5c34':'#5c1a1a'}`, borderRadius:'8px', padding:'0.75rem 1rem', color:msg.startsWith('✅')?'#4ade80':'#f87171', marginBottom:'1rem', fontSize:'0.9rem' }}>{msg}</div>}

        {/* Tabs */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.75rem', flexWrap:'wrap' }}>
          <button style={secStyle('profil')} onClick={()=>setSection('profil')}>👤 Mon profil</button>
          <button style={secStyle('commandes')} onClick={()=>setSection('commandes')}>🛒 Commandes ({commandes.length})</button>
          <button style={secStyle('rachats')} onClick={()=>setSection('rachats')}>💰 Rachats ({rachats.length})</button>
          <button style={secStyle('messages')} onClick={()=>setSection('messages')}>📧 Messages ({messages.length})</button>
        </div>

        {/* ── PROFIL ── */}
        {section==='profil' && (
          <div>
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'1.75rem', marginBottom:'1rem' }}>
              <h2 style={{ color:'#ff2d78', margin:'0 0 1.5rem', fontSize:'1rem' }}>Mes informations</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                  <div><label style={lblStyle}>Prénom</label><input value={form.prenom} onChange={e=>set('prenom',e.target.value)} style={iStyle} /></div>
                  <div><label style={lblStyle}>Nom</label><input value={form.nom} onChange={e=>set('nom',e.target.value)} style={iStyle} /></div>
                </div>
                <div>
                  <label style={lblStyle}>Email</label>
                  <input value={form.email} disabled style={{ ...iStyle, opacity:0.4, cursor:'not-allowed' }} />
                  <p style={{ color:'#444', fontSize:'0.7rem', margin:'3px 0 0' }}>L&apos;email ne peut pas être modifié</p>
                </div>
                <div><label style={lblStyle}>Téléphone</label><input type="tel" placeholder="06 66 66 66 66" value={form.telephone||''} onChange={e=>set('telephone',e.target.value)} style={iStyle} /></div>
                <div><label style={lblStyle}>Date de naissance</label><input type="date" value={form.date_naissance||''} onChange={e=>set('date_naissance',e.target.value)} style={{ ...iStyle, colorScheme:'dark' }} /></div>
                <div><label style={lblStyle}>Adresse</label><input placeholder="123 rue des Goules" value={form.adresse||''} onChange={e=>set('adresse',e.target.value)} style={iStyle} /></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'0.75rem' }}>
                  <div><label style={lblStyle}>Code postal</label><input placeholder="75001" value={form.code_postal||''} onChange={e=>set('code_postal',e.target.value)} style={iStyle} /></div>
                  <div><label style={lblStyle}>Ville</label><input placeholder="Paris" value={form.ville||''} onChange={e=>set('ville',e.target.value)} style={iStyle} /></div>
                </div>
                <button onClick={handleSave} disabled={saving} style={{ background:saving?'#333':'linear-gradient(135deg,#ff2d78,#c0185a)', color:'#fff', border:'none', borderRadius:'8px', padding:'0.85rem', fontWeight:700, cursor:saving?'not-allowed':'pointer', fontSize:'0.9rem', marginTop:'0.5rem' }}>
                  {saving?'Enregistrement...':'Enregistrer ☠'}
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'16px', padding:'1.5rem' }}>
              <h3 style={{ color:'#f87171', margin:'0 0 0.5rem', fontSize:'0.95rem' }}>⚠️ Supprimer mon compte</h3>
              <p style={{ color:'#666', fontSize:'0.82rem', margin:'0 0 1rem', lineHeight:1.6 }}>Action <strong style={{ color:'#f87171' }}>définitive et irréversible</strong>. Toutes tes données seront effacées.</p>
              {!showDelete ? (
                <button onClick={()=>setShowDelete(true)} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', borderRadius:'8px', padding:'0.6rem 1.2rem', cursor:'pointer', fontWeight:600, fontSize:'0.82rem' }}>Supprimer mon compte</button>
              ) : (
                <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                  <button onClick={handleDelete} disabled={deleteLoading} style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'0.6rem 1.2rem', cursor:'pointer', fontWeight:700, fontSize:'0.82rem' }}>
                    {deleteLoading?'Suppression...':'Oui, supprimer définitivement'}
                  </button>
                  <button onClick={()=>setShowDelete(false)} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', color:'#888', cursor:'pointer', padding:'0.6rem 1.2rem', fontSize:'0.82rem' }}>Annuler</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COMMANDES ── */}
        {section==='commandes' && (
          <div>
            {commandes.length===0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'#555' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem', opacity:0.3 }}>🛒</div>
                <p>Aucune commande pour l&apos;instant.</p>
                <a href="/#catalog" style={{ color:'#ff2d78', fontSize:'0.9rem' }}>Voir la boutique →</a>
              </div>
            ) : commandes.map((c: any) => (
              <div key={c.id} style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'1.25rem', marginBottom:'0.75rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.75rem', flexWrap:'wrap', gap:'0.5rem' }}>
                  <div>
                    <p style={{ color:'#fff', fontWeight:700, margin:'0 0 2px', fontSize:'0.95rem' }}>Commande #{c.id}</p>
                    <p style={{ color:'#555', margin:0, fontSize:'0.75rem' }}>{new Date(c.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ color:'#ff2d78', fontWeight:700, margin:'0 0 4px', fontSize:'1.2rem' }}>{c.total}€</p>
                    <span style={{ background:'rgba(255,255,255,0.06)', color:sColor(c.statut), fontSize:'0.72rem', padding:'3px 10px', borderRadius:'20px', fontWeight:600 }}>{c.statut}</span>
                  </div>
                </div>
                {c.articles && (
                  <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'0.75rem', marginBottom:'0.5rem' }}>
                    {c.articles.map((a: any, i: number) => (
                      <p key={i} style={{ color:'#aaa', margin:'0 0 2px', fontSize:'0.82rem' }}>• {a.name} × {a.qty} — {a.price * a.qty}€</p>
                    ))}
                  </div>
                )}
                {c.tracking && (
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <span style={{ color:'#666', fontSize:'0.75rem' }}>N° suivi :</span>
                    <span style={{ color:'#60a5fa', fontFamily:'monospace', fontSize:'0.82rem' }}>{c.tracking}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── RACHATS ── */}
        {section==='rachats' && (
          <div>
            {rachats.length===0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'#555' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem', opacity:0.3 }}>💰</div>
                <p>Aucune proposition de rachat.</p>
                <a href="/#rachat" style={{ color:'#ff2d78', fontSize:'0.9rem' }}>Proposer un rachat →</a>
              </div>
            ) : rachats.map((r: any) => (
              <div key={r.id} style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'1.25rem', marginBottom:'0.75rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.5rem' }}>
                  <div>
                    <p style={{ color:'#fff', fontWeight:700, margin:'0 0 2px' }}>{r.personnage}</p>
                    <p style={{ color:'#555', margin:0, fontSize:'0.75rem' }}>{new Date(r.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</p>
                  </div>
                  <div style={{ display:'flex', gap:'0.4rem', alignItems:'flex-start', flexWrap:'wrap' }}>
                    <span style={{ background:'rgba(255,255,255,0.06)', color:sColor(r.statut), fontSize:'0.72rem', padding:'3px 10px', borderRadius:'20px', fontWeight:600 }}>{r.statut}</span>
                    {r.montant_offert && <span style={{ background:'rgba(255,45,120,0.1)', color:'#ff2d78', fontSize:'0.72rem', padding:'3px 10px', borderRadius:'20px', fontWeight:700 }}>Offre : {r.montant_offert}€</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'0.5rem' }}>
                  <span style={{ color:'#666', fontSize:'0.75rem', background:'rgba(255,255,255,0.04)', padding:'2px 8px', borderRadius:'4px' }}>{r.etat}</span>
                  <span style={{ color:'#666', fontSize:'0.75rem', background:'rgba(255,255,255,0.04)', padding:'2px 8px', borderRadius:'4px' }}>{r.nombre} poupée{r.nombre>1?'s':''}</span>
                </div>
                {r.reponse_admin && (
                  <div style={{ background:'rgba(255,45,120,0.05)', border:'1px solid rgba(255,45,120,0.1)', borderRadius:'8px', padding:'0.75rem', marginTop:'0.5rem' }}>
                    <p style={{ color:'#888', fontSize:'0.72rem', margin:'0 0 4px' }}>Réponse de Ghoul&apos;s Closet :</p>
                    <p style={{ color:'#ddd', fontSize:'0.85rem', margin:0, lineHeight:1.6 }}>{r.reponse_admin}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {section==='messages' && (
          <div>
            {messages.length===0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'#555' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem', opacity:0.3 }}>📧</div>
                <p>Aucun message envoyé.</p>
                <a href="/contact" style={{ color:'#ff2d78', fontSize:'0.9rem' }}>Nous contacter →</a>
              </div>
            ) : messages.map((m: any) => (
              <div key={m.id} style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'1.25rem', marginBottom:'0.75rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem', flexWrap:'wrap', gap:'0.5rem' }}>
                  <p style={{ color:'#ff2d78', fontWeight:600, margin:0, fontSize:'0.85rem' }}>Sujet : {m.sujet}</p>
                  <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                    <span style={{ color:sColor(m.statut||'nouveau'), fontSize:'0.72rem', background:'rgba(255,255,255,0.05)', padding:'2px 8px', borderRadius:'20px' }}>{m.statut||'nouveau'}</span>
                    <span style={{ color:'#555', fontSize:'0.75rem' }}>{new Date(m.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <p style={{ color:'#777', fontSize:'0.82rem', margin:'0 0 0.5rem', lineHeight:1.5 }}>{m.message}</p>
                {m.reponse_admin && (
                  <div style={{ background:'rgba(255,45,120,0.05)', border:'1px solid rgba(255,45,120,0.1)', borderRadius:'8px', padding:'0.75rem' }}>
                    <p style={{ color:'#888', fontSize:'0.72rem', margin:'0 0 4px' }}>Réponse de Ghoul&apos;s Closet :</p>
                    <p style={{ color:'#ddd', fontSize:'0.85rem', margin:0, lineHeight:1.6 }}>{m.reponse_admin}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}