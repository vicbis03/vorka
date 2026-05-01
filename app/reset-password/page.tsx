'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function getStrength(pwd: string) {
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const labels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
  const colors = ['#333', '#ef4444', '#f97316', '#eab308', '#22c55e', '#4ade80']
  return { score, label: labels[score], color: colors[score] }
}

const iStyle: React.CSSProperties = {
  width: '100%', background: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
  padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem',
  outline: 'none', boxSizing: 'border-box',
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)

  const strength = getStrength(password)

  useEffect(() => {
    // Supabase détecte automatiquement le token dans l'URL (hash)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setReady(true)
        setChecking(false)
      }
    })

    // Timeout si aucun event PASSWORD_RECOVERY reçu
    const timer = setTimeout(() => setChecking(false), 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleReset = async () => {
    if (!password) return setError('Mot de passe obligatoire')
    if (password.length < 8) return setError('8 caractères minimum')
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas')
    if (strength.score < 2) return setError('Mot de passe trop faible — ajoute des chiffres ou majuscules')

    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) setError('Erreur : ' + error.message)
    else {
      setSuccess(true)
      setTimeout(() => router.push('/inscription'), 3000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial,sans-serif', padding: '1.5rem' }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,45,120,0.25)', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💀</div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Nouveau mot de passe</h1>
          <p style={{ color: '#555', fontSize: '0.82rem', margin: '0.4rem 0 0' }}>Ghoul&apos;s Closet</p>
        </div>

        {success ? (
          <div style={{ background: '#0f2e1a', border: '1px solid #1a5c34', borderRadius: '10px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <p style={{ color: '#4ade80', fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1rem' }}>Mot de passe mis à jour !</p>
            <p style={{ color: '#888', fontSize: '0.82rem', margin: '0 0 1rem' }}>Redirection vers la connexion...</p>
          </div>

        ) : checking ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Vérification du lien en cours...</p>
          </div>

        ) : !ready ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#2e0f0f', border: '1px solid #5c1a1a', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <p style={{ color: '#f87171', margin: 0, fontSize: '0.88rem', lineHeight: 1.6 }}>
                ❌ Lien invalide ou expiré.<br />
                <span style={{ color: '#888', fontSize: '0.8rem' }}>Les liens de réinitialisation sont valables 1 heure.</span>
              </p>
            </div>
            <button
              onClick={() => router.push('/inscription')}
              style={{ background: 'linear-gradient(135deg,#ff2d78,#c0185a)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Demander un nouveau lien
            </button>
          </div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ color: '#888', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Nouveau mot de passe *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  style={{ ...iStyle, paddingRight: '3rem' }}
                />
                <button onClick={() => setShowPwd(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem' }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength.score ? strength.color : '#333', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  {strength.label && <p style={{ color: strength.color, fontSize: '0.72rem', margin: 0 }}>{strength.label}</p>}
                </div>
              )}
            </div>

            <div>
              <label style={{ color: '#888', fontSize: '0.75rem', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Confirmer *
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError('') }}
                style={{ ...iStyle, border: `1px solid ${confirm && confirm !== password ? '#ef4444' : 'rgba(255,255,255,0.08)'}` }}
              />
              {confirm && confirm !== password && <p style={{ color: '#ef4444', fontSize: '0.72rem', margin: '3px 0 0' }}>Ne correspond pas</p>}
            </div>

            {error && (
              <div style={{ background: '#2e0f0f', border: '1px solid #5c1a1a', borderRadius: '8px', padding: '0.6rem 0.9rem', color: '#f87171', fontSize: '0.82rem' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleReset}
              disabled={loading}
              style={{ background: loading ? '#333' : 'linear-gradient(135deg,#ff2d78,#c0185a)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', marginTop: '0.25rem' }}
            >
              {loading ? 'Mise à jour...' : 'Changer mon mot de passe ☠'}
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: 0 }}>
          <a href="/" style={{ color: '#444', fontSize: '0.78rem', textDecoration: 'none' }}>← Retour à la boutique</a>
        </p>
      </div>
    </div>
  )
}
