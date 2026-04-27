'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Mode = 'register' | 'login' | 'forgot'

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const levels = [
    { label: '', color: '#333' },
    { label: 'Très faible', color: '#ef4444' },
    { label: 'Faible', color: '#f97316' },
    { label: 'Moyen', color: '#eab308' },
    { label: 'Fort', color: '#22c55e' },
    { label: 'Très fort', color: '#4ade80' },
  ]
  return { score, ...levels[score] }
}

const iStyle: React.CSSProperties = { width:'100%', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }
const lblStyle: React.CSSProperties = { color:'#888', fontSize:'0.75rem', display:'block', marginBottom:'0.3rem', letterSpacing:'0.04em', textTransform:'uppercase' }

export default function InscriptionPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('register')
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', password: '', confirm: '',
    telephone: '', adresse: '', codePostal: '', ville: '', dateNaissance: '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')

  const pwdStrength = getPasswordStrength(form.password)

  const set = (k: string, v: string) => { setForm(f => ({...f,[k]:v})); setError('') }

  const handleRegister = async () => {
    if (!form.prenom || !form.email || !form.password) return setError('Prénom, email et mot de passe obligatoires')
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas')
    if (form.password.length < 8) return setError('Mot de passe trop court (8 caractères min)')
    if (pwdStrength.score < 2) return setError('Mot de passe trop faible — ajoute des chiffres ou majuscules')
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: form.prenom, nom: form.nom, email: form.email,
          password: form.password, telephone: form.telephone,
          adresse: form.adresse, code_postal: form.codePostal,
          ville: form.ville, date_naissance: form.dateNaissance,
        }),
      })
      const d = await res.json()
      if (d.success) setSuccess('✅ Compte créé ! Vérifie ton email pour confirmer.')
      else setError(d.error || 'Erreur lors de l\'inscription')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError('Email et mot de passe obligatoires')
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const d = await res.json()
      if (d.success) router.push('/')
      else setError(d.error || 'Identifiants incorrects')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const handleForgot = async () => {
    if (!forgotEmail) return setError('Entre ton adresse email')
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const d = await res.json()
      if (d.success) setSuccess('📧 Email de réinitialisation envoyé ! Vérifie ta boîte.')
      else setError(d.error || 'Email introuvable')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const switchMode = (m: Mode) => { setMode(m); setError(''); setSuccess('') }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Arial,sans-serif', padding:'2rem 1rem' }}>
      <div style={{ background:'#111', border:'1px solid rgba(255,45,120,0.25)', borderRadius:'16px', padding:'2.5rem', width:'100%', maxWidth:'480px' }}>

        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>💀</div>
          <h1 style={{ color:'#fff', margin:0, fontSize:'1.4rem', fontWeight:700, letterSpacing:'-0.02em' }}>Ghoul&apos;s Closet</h1>
          <p style={{ color:'#555', fontSize:'0.82rem', margin:'0.25rem 0 0' }}>La boutique Monster High</p>
        </div>

        {/* Tabs */}
        {mode !== 'forgot' && (
          <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'4px', marginBottom:'1.75rem' }}>
            {(['register','login'] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{ flex:1, padding:'0.6rem', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600, fontSize:'0.85rem', background:mode===m?'#ff2d78':'transparent', color:mode===m?'#fff':'#888', transition:'all 0.2s' }}>
                {m === 'register' ? '✨ Créer un compte' : '🔑 Se connecter'}
              </button>
            ))}
          </div>
        )}

        {success ? (
          <div style={{ background:'#0f2e1a', border:'1px solid #1a5c34', borderRadius:'10px', padding:'1.5rem', textAlign:'center' }}>
            <p style={{ color:'#4ade80', fontWeight:700, margin:'0 0 0.75rem', fontSize:'1rem' }}>{success}</p>
            <button onClick={() => { setSuccess(''); switchMode('login') }} style={{ background:'#ff2d78', color:'#fff', border:'none', borderRadius:'8px', padding:'0.6rem 1.2rem', cursor:'pointer', fontWeight:600 }}>
              Se connecter
            </button>
          </div>

        ) : mode === 'forgot' ? (
          <div>
            <button onClick={() => switchMode('login')} style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:'0.82rem', marginBottom:'1.5rem', padding:0 }}>← Retour</button>
            <h2 style={{ color:'#fff', margin:'0 0 0.5rem', fontSize:'1.1rem' }}>Mot de passe oublié</h2>
            <p style={{ color:'#666', fontSize:'0.85rem', margin:'0 0 1.5rem' }}>Entre ton email, on t&apos;envoie un lien de réinitialisation.</p>
            <div style={{ marginBottom:'1rem' }}>
              <label style={lblStyle}>Email</label>
              <input type="email" placeholder="ton@email.com" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setError('') }} style={iStyle} />
            </div>
            {error && <div style={{ background:'#2e0f0f', border:'1px solid #5c1a1a', borderRadius:'8px', padding:'0.6rem', color:'#f87171', fontSize:'0.82rem', marginBottom:'0.75rem' }}>{error}</div>}
            <button onClick={handleForgot} disabled={loading} style={{ width:'100%', background:loading?'#333':'linear-gradient(135deg,#ff2d78,#c0185a)', color:'#fff', border:'none', borderRadius:'8px', padding:'0.85rem', fontWeight:700, cursor:loading?'not-allowed':'pointer' }}>
              {loading ? 'Envoi...' : 'Envoyer le lien ☠'}
            </button>
          </div>

        ) : mode === 'login' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label style={lblStyle}>Email</label>
              <input type="email" placeholder="ton@email.com" value={form.email} onChange={e => set('email', e.target.value)} style={iStyle} />
            </div>
            <div>
              <label style={lblStyle}>Mot de passe</label>
              <div style={{ position:'relative' }}>
                <input type={showPwd?'text':'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()} style={{ ...iStyle, paddingRight:'3rem' }} />
                <button onClick={() => setShowPwd(p => !p)} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:'1rem' }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button onClick={() => switchMode('forgot')} style={{ background:'none', border:'none', color:'#ff2d78', cursor:'pointer', fontSize:'0.8rem', textAlign:'right', padding:0, marginTop:'-0.5rem' }}>
              Mot de passe oublié ?
            </button>
            {error && <div style={{ background:'#2e0f0f', border:'1px solid #5c1a1a', borderRadius:'8px', padding:'0.6rem', color:'#f87171', fontSize:'0.82rem' }}>{error}</div>}
            <button onClick={handleLogin} disabled={loading} style={{ background:loading?'#333':'linear-gradient(135deg,#ff2d78,#c0185a)', color:'#fff', border:'none', borderRadius:'8px', padding:'0.85rem', fontWeight:700, cursor:loading?'not-allowed':'pointer', fontSize:'0.95rem' }}>
              {loading ? 'Connexion...' : 'Se connecter ☠'}
            </button>
          </div>

        ) : (
          /* REGISTER */
          <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <div>
                <label style={lblStyle}>Prénom *</label>
                <input placeholder="Draculaura" value={form.prenom} onChange={e => set('prenom', e.target.value)} style={iStyle} />
              </div>
              <div>
                <label style={lblStyle}>Nom</label>
                <input placeholder="Von Bat" value={form.nom} onChange={e => set('nom', e.target.value)} style={iStyle} />
              </div>
            </div>
            <div>
              <label style={lblStyle}>Email *</label>
              <input type="email" placeholder="ghoul@monsterhigh.com" value={form.email} onChange={e => set('email', e.target.value)} style={iStyle} />
            </div>
            <div>
              <label style={lblStyle}>Téléphone</label>
              <input type="tel" placeholder="06 66 66 66 66" value={form.telephone} onChange={e => set('telephone', e.target.value)} style={iStyle} />
            </div>
            <div>
              <label style={lblStyle}>Date de naissance</label>
              <input type="date" value={form.dateNaissance} onChange={e => set('dateNaissance', e.target.value)} style={{ ...iStyle, colorScheme:'dark' }} />
            </div>
            <div>
              <label style={lblStyle}>Adresse</label>
              <input placeholder="123 rue des Goules" value={form.adresse} onChange={e => set('adresse', e.target.value)} style={iStyle} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'0.75rem' }}>
              <div>
                <label style={lblStyle}>Code postal</label>
                <input placeholder="75001" value={form.codePostal} onChange={e => set('codePostal', e.target.value)} style={iStyle} />
              </div>
              <div>
                <label style={lblStyle}>Ville</label>
                <input placeholder="Paris" value={form.ville} onChange={e => set('ville', e.target.value)} style={iStyle} />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label style={lblStyle}>Mot de passe * (8 caractères min)</label>
              <div style={{ position:'relative' }}>
                <input type={showPwd?'text':'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} style={{ ...iStyle, paddingRight:'3rem' }} />
                <button onClick={() => setShowPwd(p => !p)} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:'1rem' }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop:'0.4rem' }}>
                  <div style={{ display:'flex', gap:'3px', marginBottom:'3px' }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background: i <= pwdStrength.score ? pwdStrength.color : '#333', transition:'background 0.2s' }} />
                    ))}
                  </div>
                  {pwdStrength.label && <p style={{ color:pwdStrength.color, fontSize:'0.72rem', margin:0 }}>{pwdStrength.label}</p>}
                </div>
              )}
            </div>
            <div>
              <label style={lblStyle}>Confirmer le mot de passe *</label>
              <input type={showPwd?'text':'password'} placeholder="••••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} style={{ ...iStyle, border:`1px solid ${form.confirm && form.confirm !== form.password ? '#ef4444' : 'rgba(255,255,255,0.08)'}` }} />
              {form.confirm && form.confirm !== form.password && <p style={{ color:'#ef4444', fontSize:'0.72rem', margin:'3px 0 0' }}>Les mots de passe ne correspondent pas</p>}
            </div>

            {error && <div style={{ background:'#2e0f0f', border:'1px solid #5c1a1a', borderRadius:'8px', padding:'0.6rem', color:'#f87171', fontSize:'0.82rem' }}>{error}</div>}

            <button onClick={handleRegister} disabled={loading} style={{ background:loading?'#333':'linear-gradient(135deg,#ff2d78,#c0185a)', color:'#fff', border:'none', borderRadius:'8px', padding:'0.9rem', fontWeight:700, cursor:loading?'not-allowed':'pointer', fontSize:'0.95rem', marginTop:'0.25rem' }}>
              {loading ? 'Création...' : 'Créer mon compte ☠'}
            </button>
            <p style={{ color:'#555', fontSize:'0.75rem', textAlign:'center', margin:0 }}>
              En créant un compte, tu acceptes nos <a href="/cgv" style={{ color:'#ff2d78' }}>CGV</a>
            </p>
          </div>
        )}

        <p style={{ textAlign:'center', marginTop:'1.5rem', marginBottom:0 }}>
          <a href="/" style={{ color:'#444', fontSize:'0.78rem', textDecoration:'none' }}>← Retour à la boutique</a>
        </p>
      </div>
    </div>
  )
}
