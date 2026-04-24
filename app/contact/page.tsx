'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ nom: '', email: '', sujet: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <a href="/" style={{
            color: '#888',
            textDecoration: 'none',
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '1.5rem',
          }}>
            ← Retour à la boutique
          </a>
          <h1 style={{
            color: '#fff',
            fontSize: '2rem',
            fontWeight: 700,
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
          }}>
            Nous contacter
          </h1>
          <p style={{ color: '#666', margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
            Une question sur votre commande ? Nous répondons sous <strong style={{ color: '#aaa' }}>48h</strong>.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nom</label>
                <input
                  type="text"
                  required
                  placeholder="Votre nom"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  style={inputStyle}
                  onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.target.style, inputStyle)}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                  onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.target.style, inputStyle)}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Sujet</label>
              <select
                required
                value={form.sujet}
                onChange={e => setForm({ ...form, sujet: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Choisir un sujet...</option>
                <option value="Suivi de commande">Suivi de commande</option>
                <option value="Problème de livraison">Problème de livraison</option>
                <option value="Retour / Remboursement">Retour / Remboursement</option>
                <option value="Question produit">Question produit</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Message</label>
              <textarea
                required
                rows={5}
                placeholder="Décrivez votre demande..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                onFocus={e => Object.assign(e.target.style, { ...inputFocusStyle, resize: 'vertical' })}
                onBlur={e => Object.assign(e.target.style, { ...inputStyle, resize: 'vertical' })}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                background: status === 'loading' ? '#333' : '#fff',
                color: status === 'loading' ? '#666' : '#000',
                border: 'none',
                borderRadius: '8px',
                padding: '0.9rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.01em',
                marginTop: '0.5rem',
              }}
            >
              {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>

            {/* Feedback */}
            {status === 'success' && (
              <div style={{
                background: '#0f2e1a',
                border: '1px solid #1a5c34',
                borderRadius: '8px',
                padding: '1rem',
                color: '#4ade80',
                fontSize: '0.9rem',
                textAlign: 'center',
              }}>
                ✅ Message envoyé ! Nous vous répondrons sous 48h.
              </div>
            )}
            {status === 'error' && (
              <div style={{
                background: '#2e0f0f',
                border: '1px solid #5c1a1a',
                borderRadius: '8px',
                padding: '1rem',
                color: '#f87171',
                fontSize: '0.9rem',
                textAlign: 'center',
              }}>
                ❌ Une erreur est survenue. Réessayez ou contactez-nous par email.
              </div>
            )}

          </div>
        </form>

        {/* Footer info */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #1a1a1a',
          display: 'flex',
          gap: '1.5rem',
          color: '#555',
          fontSize: '0.8rem',
        }}>
          <span>📦 Réponse sous 48h</span>
          <span>🔒 Données sécurisées</span>
          <span>🇫🇷 Support en français</span>
        </div>
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#888',
  fontSize: '0.8rem',
  fontWeight: 500,
  marginBottom: '0.4rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#111',
  border: '1px solid #222',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  color: '#fff',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: '#444',
}
