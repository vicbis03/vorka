'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InscriptionPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'register'|'login'>('register')
  const [form, setForm] = useState({ prenom:'', nom:'', email:'', password:'', confirm:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    if (!form.prenom || !form.email || !form.password) return setError('Remplis tous les champs obligatoires')
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas')
    if (form.password.length < 6) return setError('Mot de passe trop court (6 caractères min)')
    setLoading(true); setError('')
    const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ prenom:form.prenom, nom:form.nom, email:form.email, password:form.password }) })
    const d = await res.json()
    setLoading(false)
    if (d.success) setSuccess(true)
    else setError(d.error || 'Erreur lors de l\'inscription')
  }

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError('Email et mot de passe obligatoires')
    setLoading(true); setError('')
    const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:form.email, password:form.password }) })
    const d = await res.json()
    setLoading(false)
    if (d.success) router.push('/')
    else setError(d.error || 'Identifiants incorrects')
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Arial,sans-serif', padding:'1.5rem' }}>
      <div style={{ background:'#111', border:'1px solid rgba(255,45,120,0.25)', borderRadius:'16px', padding:'2.5rem', width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>💀</div>
          <h1 style={{ color:'#fff', margin:0, fontSize:'1.4rem', fontWeight:700 }}>Ghoul&apos;s Closet</h1>
        </div>

        {/* Toggle */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'4px', marginBottom:'1.5rem' }}>
          {(['register','login'] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);setError('');setSuccess(false)}} style={{ flex:1, padding:'0.6rem', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600, fontSize:'0.85rem', background:mode===m?'#ff2d78':'transparent', color:mode===m?'#fff':'#888', transition:'all 0.2s' }}>
              {m==='register'?'Créer un compte':'Se connecter'}
            </button>
          ))}
        </div>

        {success ? (
          <div style={{ background:'#0f2e1a', border:'1px solid #1a5c34', borderRadius:'10px', padding:'1.5rem', textAlign:'center' }}>
            <p style={{ color:'#4ade80', fontWeight:700, margin:'0 0 0.5rem' }}>✅ Compte créé !</p>
            <p style={{ color:'#aaa', fontSize:'0.85rem', margin:'0 0 1rem' }}>Un email de confirmation t&apos;a été envoyé.</p>
            <button onClick={()=>{setMode('login');setSuccess(false)}} style={{ background:'#ff2d78', color:'#fff', border:'none', borderRadius:'8px', padding:'0.6rem 1.2rem', cursor:'pointer', fontWeight:600 }}>Se connecter</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {mode==='register' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <input placeholder="Prénom *" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})} style={iStyle} />
                <input placeholder="Nom" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} style={iStyle} />
              </div>
            )}
            <input placeholder="Email *" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={iStyle} />
            <input placeholder="Mot de passe *" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={iStyle} />
            {mode==='register' && <input placeholder="Confirmer le mot de passe *" type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} style={iStyle} />}

            {error && <div style={{ background:'#2e0f0f', border:'1px solid #5c1a1a', borderRadius:'8px', padding:'0.6rem 0.9rem', color:'#f87171', fontSize:'0.82rem' }}>{error}</div>}

            <button onClick={mode==='register'?handleRegister:handleLogin} disabled={loading} style={{ background:loading?'#333':'linear-gradient(135deg,#ff2d78,#c0185a)', color:'#fff', border:'none', borderRadius:'8px', padding:'0.85rem', fontWeight:700, cursor:loading?'not-allowed':'pointer', fontSize:'0.95rem', marginTop:'0.25rem' }}>
              {loading ? 'Chargement...' : mode==='register' ? 'Créer mon compte ☠' : 'Se connecter ☠'}
            </button>
          </div>
        )}

        <p style={{ textAlign:'center', marginTop:'1.5rem' }}>
          <a href="/" style={{ color:'#444', fontSize:'0.78rem', textDecoration:'none' }}>← Retour à la boutique</a>
        </p>
      </div>
    </div>
  )
}

const iStyle: React.CSSProperties = { width:'100%', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }
