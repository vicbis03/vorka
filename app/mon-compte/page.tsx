'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const iS: React.CSSProperties = { width:'100%', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }
const lS: React.CSSProperties = { color:'#888', fontSize:'0.75rem', display:'block', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.04em' }

export default function MonComptePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({ prenom:'', nom:'', telephone:'', adresse:'', code_postal:'', ville:'' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/inscription'); return }
      setUser(data.user)
      // Charger profil depuis table clients
      supabase.from('clients').select('*').eq('user_id', data.user.id).single().then(({ data: p }) => {
        if (p) { setProfile(p); setForm({ prenom:p.prenom||'', nom:p.nom||'', telephone:p.telephone||'', adresse:p.adresse||'', code_postal:p.code_postal||'', ville:p.ville||'' }) }
        setLoading(false)
      })
    })
  }, [router])

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000) }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('clients').update(form).eq('user_id', user.id)
    setSaving(false)
    if (!error) { setProfile((p: any) => ({...p,...form})); setEditMode(false); flash('✅ Profil mis à jour !') }
    else flash('❌ Erreur lors de la sauvegarde')
  }

  const handleDelete = async () => {
    const res = await fetch('/api/auth/delete', { method:'DELETE' })
    if (res.ok) router.push('/')
    else flash('❌ Erreur lors de la suppression')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    await fetch('/api/auth/logout', { method:'POST' })
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#666' }}>Chargement...</p>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', fontFamily:'Arial,sans-serif', padding:'2rem 1rem' }}>
      <div style={{ maxWidth:'580px', margin:'0 auto' }}>
        <a href="/" style={{ color:'#888', textDecoration:'none', fontSize:'0.82rem', display:'block', marginBottom:'1.5rem' }}>← Retour à la boutique</a>

        {/* Header profil */}
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'2rem' }}>
          <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'linear-gradient(135deg,#ff2d78,#c0185a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:700, color:'#fff', flexShrink:0 }}>
            {(profile?.prenom||user?.email||'?')[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ color:'#fff', margin:0, fontSize:'1.3rem', fontWeight:700 }}>
              {profile?.prenom ? `${profile.prenom} ${profile.nom||''}`.trim() : user?.email}
            </h1>
            <p style={{ color:'#666', margin:'2px 0 0', fontSize:'0.82rem' }}>{user?.email}</p>
          </div>
        </div>

        {msg && <div style={{ background:msg.startsWith('✅')?'#0f2e1a':'#2e0f0f', border:`1px solid ${msg.startsWith('✅')?'#1a5c34':'#5c1a1a'}`, borderRadius:'8px', padding:'0.75rem 1rem', color:msg.startsWith('✅')?'#4ade80':'#f87171', marginBottom:'1.5rem', fontSize:'0.88rem' }}>{msg}</div>}

        {/* Infos / formulaire */}
        <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'1.5rem', marginBottom:'1rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h2 style={{ color:'#fff', margin:0, fontSize:'1rem', fontWeight:700 }}>Mes informations</h2>
            {!editMode && <button onClick={()=>setEditMode(true)} style={{ background:'rgba(255,45,120,0.1)', border:'none', borderRadius:'8px', color:'#ff2d78', cursor:'pointer', padding:'0.4rem 0.9rem', fontSize:'0.82rem', fontWeight:600 }}>✏️ Modifier</button>}
          </div>

          {editMode ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <div><label style={lS}>Prénom</label><input value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})} style={iS} /></div>
                <div><label style={lS}>Nom</label><input value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} style={iS} /></div>
              </div>
              <div><label style={lS}>Téléphone</label><input value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})} style={iS} /></div>
              <div><label style={lS}>Adresse</label><input value={form.adresse} onChange={e=>setForm({...form,adresse:e.target.value})} style={iS} /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'0.75rem' }}>
                <div><label style={lS}>Code postal</label><input value={form.code_postal} onChange={e=>setForm({...form,code_postal:e.target.value})} style={iS} /></div>
                <div><label style={lS}>Ville</label><input value={form.ville} onChange={e=>setForm({...form,ville:e.target.value})} style={iS} /></div>
              </div>
              <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.25rem' }}>
                <button onClick={handleSave} disabled={saving} style={{ flex:1, background:'linear-gradient(135deg,#ff2d78,#c0185a)', color:'#fff', border:'none', borderRadius:'8px', padding:'0.75rem', fontWeight:700, cursor:saving?'not-allowed':'pointer', fontSize:'0.9rem' }}>
                  {saving?'Sauvegarde...':'✅ Enregistrer'}
                </button>
                <button onClick={()=>setEditMode(false)} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', color:'#888', cursor:'pointer', padding:'0.75rem 1rem', fontSize:'0.85rem' }}>Annuler</button>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {[
                ['Prénom', profile?.prenom],
                ['Nom', profile?.nom],
                ['Téléphone', profile?.telephone],
                ['Adresse', profile?.adresse],
                ['Code postal', profile?.code_postal],
                ['Ville', profile?.ville],
                ['Date de naissance', profile?.date_naissance],
              ].map(([label, value]) => value && (
                <div key={label as string} style={{ display:'flex', gap:'0.5rem' }}>
                  <span style={{ color:'#666', fontSize:'0.82rem', minWidth:'120px' }}>{label}</span>
                  <span style={{ color:'#ddd', fontSize:'0.82rem' }}>{value as string}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions compte */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          <button onClick={handleLogout} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', color:'#aaa', cursor:'pointer', padding:'0.85rem', fontSize:'0.9rem', fontWeight:600 }}>
            Déconnexion
          </button>
          <button onClick={()=>setConfirmDelete(true)} style={{ width:'100%', background:'rgba(255,50,50,0.06)', border:'1px solid rgba(255,50,50,0.15)', borderRadius:'10px', color:'#f87171', cursor:'pointer', padding:'0.85rem', fontSize:'0.9rem', fontWeight:600 }}>
            Supprimer mon compte
          </button>
        </div>

        {/* Modal suppression */}
        {confirmDelete && (
          <>
            <div onClick={()=>setConfirmDelete(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000 }} />
            <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#111', border:'1px solid rgba(255,50,50,0.3)', borderRadius:'16px', padding:'2rem', width:'90%', maxWidth:'380px', zIndex:1001, textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>⚠️</div>
              <h3 style={{ color:'#fff', margin:'0 0 0.5rem' }}>Supprimer le compte ?</h3>
              <p style={{ color:'#888', fontSize:'0.85rem', margin:'0 0 1.5rem', lineHeight:1.6 }}>Cette action est irréversible. Toutes tes données seront supprimées définitivement.</p>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button onClick={handleDelete} style={{ flex:1, background:'#dc2626', color:'#fff', border:'none', borderRadius:'8px', padding:'0.75rem', fontWeight:700, cursor:'pointer' }}>Oui, supprimer</button>
                <button onClick={()=>setConfirmDelete(false)} style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', color:'#888', cursor:'pointer', padding:'0.75rem' }}>Annuler</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
