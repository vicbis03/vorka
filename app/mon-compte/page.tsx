'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const iStyle: React.CSSProperties = { width:'100%', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }
const lblStyle: React.CSSProperties = { color:'#888', fontSize:'0.75rem', display:'block', marginBottom:'0.3rem', letterSpacing:'0.04em', textTransform:'uppercase' }

interface Profile {
  prenom: string; nom: string; email: string; telephone: string
  adresse: string; code_postal: string; ville: string; date_naissance: string
}

export default function MonComptePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<Profile>({ prenom:'', nom:'', email:'', telephone:'', adresse:'', code_postal:'', ville:'', date_naissance:'' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/inscription'); return }

      const res = await fetch('/api/auth/profile')
      const d = await res.json()
      if (d.profile) {
        setProfile(d.profile)
        setForm(d.profile)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000) }
  const set = (k: keyof Profile, v: string) => setForm(f => ({...f, [k]: v}))

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    setSaving(false)
    if (d.success) { setProfile(form); flash('✅ Profil mis à jour !') }
    else flash('❌ Erreur: ' + d.error)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    const res = await fetch('/api/auth/delete', { method: 'DELETE' })
    const d = await res.json()
    setDeleteLoading(false)
    if (d.success) {
      await supabase.auth.signOut()
      router.push('/')
    } else flash('❌ Erreur: ' + d.error)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#666' }}>Chargement...</p>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', color:'#fff', fontFamily:'Arial,sans-serif', padding:'2rem 1rem' }}>
      <div style={{ maxWidth:'600px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' }}>
          <div>
            <a href="/" style={{ color:'#666', fontSize:'0.78rem', textDecoration:'none', display:'block', marginBottom:'0.5rem' }}>← Retour à la boutique</a>
            <h1 style={{ margin:0, fontSize:'1.5rem', fontWeight:700 }}>
              Mon compte <span style={{ color:'#ff2d78' }}>☠</span>
            </h1>
            {profile && <p style={{ color:'#666', margin:'4px 0 0', fontSize:'0.85rem' }}>{profile.email}</p>}
          </div>
          <button onClick={handleLogout} style={{ background:'rgba(255,50,50,0.1)', border:'1px solid rgba(255,50,50,0.2)', borderRadius:'8px', color:'#f87171', cursor:'pointer', padding:'0.5rem 1rem', fontSize:'0.82rem', fontWeight:600 }}>
            Déconnexion
          </button>
        </div>

        {msg && <div style={{ background:msg.startsWith('✅')?'#0f2e1a':'#2e0f0f', border:`1px solid ${msg.startsWith('✅')?'#1a5c34':'#5c1a1a'}`, borderRadius:'8px', padding:'0.75rem 1rem', color:msg.startsWith('✅')?'#4ade80':'#f87171', marginBottom:'1rem', fontSize:'0.9rem' }}>{msg}</div>}

        {/* Formulaire */}
        <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'1.75rem', marginBottom:'1rem' }}>
          <h2 style={{ color:'#ff2d78', margin:'0 0 1.5rem', fontSize:'1rem', fontWeight:700 }}>Mes informations</h2>

          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <div>
                <label style={lblStyle}>Prénom</label>
                <input value={form.prenom} onChange={e=>set('prenom',e.target.value)} style={iStyle} />
              </div>
              <div>
                <label style={lblStyle}>Nom</label>
                <input value={form.nom} onChange={e=>set('nom',e.target.value)} style={iStyle} />
              </div>
            </div>
            <div>
              <label style={lblStyle}>Email</label>
              <input value={form.email} disabled style={{ ...iStyle, opacity:0.5, cursor:'not-allowed' }} />
              <p style={{ color:'#555', fontSize:'0.72rem', margin:'4px 0 0' }}>L'email ne peut pas être modifié</p>
            </div>
            <div>
              <label style={lblStyle}>Téléphone</label>
              <input type="tel" placeholder="06 66 66 66 66" value={form.telephone||''} onChange={e=>set('telephone',e.target.value)} style={iStyle} />
            </div>
            <div>
              <label style={lblStyle}>Date de naissance</label>
              <input type="date" value={form.date_naissance||''} onChange={e=>set('date_naissance',e.target.value)} style={{ ...iStyle, colorScheme:'dark' }} />
            </div>
            <div>
              <label style={lblStyle}>Adresse</label>
              <input placeholder="123 rue des Goules" value={form.adresse||''} onChange={e=>set('adresse',e.target.value)} style={iStyle} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'0.75rem' }}>
              <div>
                <label style={lblStyle}>Code postal</label>
                <input placeholder="75001" value={form.code_postal||''} onChange={e=>set('code_postal',e.target.value)} style={iStyle} />
              </div>
              <div>
                <label style={lblStyle}>Ville</label>
                <input placeholder="Paris" value={form.ville||''} onChange={e=>set('ville',e.target.value)} style={iStyle} />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} style={{ background:saving?'#333':'linear-gradient(135deg,#ff2d78,#c0185a)', color:'#fff', border:'none', borderRadius:'8px', padding:'0.85rem', fontWeight:700, cursor:saving?'not-allowed':'pointer', fontSize:'0.95rem', marginTop:'0.5rem' }}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications ☠'}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'16px', padding:'1.5rem' }}>
          <h2 style={{ color:'#f87171', margin:'0 0 0.75rem', fontSize:'1rem', fontWeight:700 }}>⚠️ Zone dangereuse</h2>
          <p style={{ color:'#888', fontSize:'0.85rem', margin:'0 0 1rem', lineHeight:1.6 }}>
            La suppression de ton compte est <strong style={{ color:'#f87171' }}>définitive et irréversible</strong>. Toutes tes données seront effacées.
          </p>
          {!showDelete ? (
            <button onClick={()=>setShowDelete(true)} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'8px', padding:'0.65rem 1.2rem', cursor:'pointer', fontWeight:600, fontSize:'0.85rem' }}>
              Supprimer mon compte
            </button>
          ) : (
            <div style={{ background:'rgba(239,68,68,0.08)', borderRadius:'10px', padding:'1rem' }}>
              <p style={{ color:'#f87171', fontWeight:600, margin:'0 0 0.75rem', fontSize:'0.9rem' }}>Tu es sûr(e) ? Cette action est irréversible.</p>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button onClick={handleDelete} disabled={deleteLoading} style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'0.65rem 1.2rem', cursor:deleteLoading?'not-allowed':'pointer', fontWeight:700, fontSize:'0.85rem' }}>
                  {deleteLoading?'Suppression...':'Oui, supprimer définitivement'}
                </button>
                <button onClick={()=>setShowDelete(false)} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', color:'#888', cursor:'pointer', padding:'0.65rem 1.2rem', fontSize:'0.85rem' }}>
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
