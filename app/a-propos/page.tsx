export default function AProposPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e8e8e8',
      fontFamily: "'Josefin Sans', sans-serif",
      padding: '4rem 1.5rem',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        <a href="/" style={{
          color: '#888',
          textDecoration: 'none',
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '2.5rem',
        }}>← Retour à la boutique</a>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ color: '#ff2d78', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.8rem', margin: '0 0 0.75rem', textTransform: 'uppercase' }}>
            ☠ Notre histoire
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            margin: '0 0 1.5rem',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #fff 0%, #ff2d78 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            À propos de<br />Ghoul's Closet
          </h1>
          <p style={{ color: '#aaa', lineHeight: 1.8, fontSize: '1rem', margin: 0 }}>
            Ghoul's Closet est une boutique spécialisée dans la vente et le rachat de poupées
            Monster High d'occasion. Basée en France, nous sélectionnons chaque poupée avec soin
            pour vous offrir les meilleures trouvailles de la Ghoul Squad.
          </p>
        </div>

        {/* Valeurs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { icon: '🦇', titre: 'Passion', texte: 'Fans de Monster High avant tout — chaque poupée compte.' },
            { icon: '🔍', titre: 'Sélection', texte: 'Nous sourçons nos poupées par la recherche et le rachat auprès de particuliers.' },
            { icon: '📦', titre: 'Soin', texte: 'Chaque colis est emballé avec amour macabre pour arriver en parfait état.' },
            { icon: '♻️', titre: 'Seconde vie', texte: 'Donner une deuxième chance aux poupées oubliées, c\'est notre mission.' },
          ].map((v, i) => (
            <div key={i} style={{
              background: 'rgba(255,45,120,0.05)',
              border: '1px solid rgba(255,45,120,0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{v.icon}</div>
              <h3 style={{ color: '#ff2d78', fontWeight: 700, margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{v.titre}</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{v.texte}</p>
            </div>
          ))}
        </div>

        {/* Comment ça marche */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ color: '#fff', fontWeight: 700, margin: '0 0 1.5rem', fontSize: '1.2rem' }}>
            ☠ Comment fonctionne notre boutique ?
          </h2>
          {[
            { num: '01', titre: 'Pas de stock fixe', texte: 'Contrairement aux boutiques classiques, nous ne stockons pas des centaines de poupées. Chaque article proposé est unique, sourcé avec soin.' },
            { num: '02', titre: 'Renouvellement constant', texte: 'Notre catalogue se renouvelle grâce à la recherche active et au rachat auprès de particuliers. Revenez souvent, de nouvelles poupées arrivent régulièrement !' },
            { num: '03', titre: 'Rachat flexible', texte: 'Vous avez des poupées à vendre ? Proposez-les nous. Vous choisissez entre un bon d\'achat sur la boutique ou un paiement direct comme une vente classique.' },
            { num: '04', titre: 'Descriptions honnêtes', texte: 'Chaque poupée est décrite avec précision. Photos réelles, état détaillé, accessoires listés. On vous dit tout.' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: i < 3 ? '1.25rem' : 0 }}>
              <span style={{
                color: '#ff2d78',
                fontWeight: 700,
                fontSize: '0.75rem',
                minWidth: '28px',
                marginTop: '2px',
                opacity: 0.7,
              }}>{step.num}</span>
              <div>
                <h4 style={{ color: '#fff', margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>{step.titre}</h4>
                <p style={{ color: '#888', margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>{step.texte}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Une question ? On vous répond sous 48h.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/" style={{
              background: '#ff2d78',
              color: '#fff',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}>Voir la boutique</a>
            <a href="/contact" style={{
              background: 'transparent',
              color: '#fff',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>Nous contacter</a>
          </div>
        </div>

      </div>
    </main>
  )
}
