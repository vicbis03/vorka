'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!pwd.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      router.push('/admin')
    } else {
      setError('Mot de passe incorrect ☠')
      setPwd('')
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Arial,sans-serif' }}>
      <div style={{ background:'#111', border:'1px solid rgba(255,45,120,0.3)', borderRadius:'16px', padding:'2.5rem', width:'340px' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'3.5rem', marginBottom:'0.75rem' }}>💀</div>
          <h1 style={{ color:'#fff', margin:0, fontSize:'1.3rem', fontWeight:700, letterSpacing:'-0.02em' }}>
            Ghoul&apos;s Closet
          </h1>
          <p style={{ color:'#555', fontSize:'0.82rem', margin:'0.4rem 0 0' }}>Accès administrateur</p>
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <input
            type="password"
            placeholder="Mot de passe"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width:'100%', background:'#1a1a1a', border:`1px solid ${error ? '#5c1a1a' : 'rgba(255,255,255,0.08)'}`,
              borderRadius:'8px', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.95rem',
              outline:'none', boxSizing:'border-box', transition:'border-color 0.2s',
            }}
          />
        </div>

        {error && (
          <div style={{ background:'#2e0f0f', border:'1px solid #5c1a1a', borderRadius:'8px', padding:'0.6rem 0.9rem', color:'#f87171', fontSize:'0.82rem', marginBottom:'1rem', textAlign:'center' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width:'100%', background: loading ? '#333' : 'linear-gradient(135deg,#ff2d78,#c0185a)',
            color:'#fff', border:'none', borderRadius:'8px', padding:'0.85rem',
            fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontSize:'0.95rem',
            transition:'opacity 0.2s',
          }}
        >
          {loading ? 'Vérification...' : 'Entrer ☠'}
        </button>

        <p style={{ textAlign:'center', marginTop:'1.5rem' }}>
          <a href="/" style={{ color:'#444', fontSize:'0.78rem', textDecoration:'none' }}>← Retour au site</a>
        </p>
      </div>
    </div>
  )
}
