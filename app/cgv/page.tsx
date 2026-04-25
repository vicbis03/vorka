export default function CGVPage() {
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

        <div style={{ marginBottom: '3rem' }}>
          <p style={{ color: '#ff2d78', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.8rem', margin: '0 0 0.75rem', textTransform: 'uppercase' }}>
            ☠ Documents légaux
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #fff 0%, #ff2d78 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Conditions Générales de Vente
          </h1>
        </div>

        {[
          {
            icon: '🏚️',
            titre: 'Notre boutique',
            contenu: `Ghoul's Closet ne dispose pas de stock fixe. Chaque poupée proposée à la vente est sourcée grâce à des recherches actives et au rachat auprès de particuliers. Le catalogue évolue donc régulièrement en fonction des acquisitions. Nous nous engageons à décrire chaque article avec la plus grande précision.`,
          },
          {
            icon: '💳',
            titre: 'Paiements',
            contenu: `Paiement sécurisé par carte bancaire via Stripe. Le paiement est exigé à la commande. Aucune commande n'est réservée sans paiement confirmé. Toutes les transactions sont chiffrées et sécurisées.`,
          },
          {
            icon: '📦',
            titre: 'Livraison',
            contenu: `Expédition sous 72h en France et Belgique. Les frais de port sont calculés à la commande selon le poids et la destination. Chaque colis est soigneusement emballé pour protéger les poupées pendant le transport. Un numéro de suivi vous est communiqué par email dès l'expédition.`,
          },
          {
            icon: '🔄',
            titre: 'Retours',
            contenu: `Retour accepté sous 14 jours si la poupée ne correspond pas à la description. Les frais de retour sont à la charge du client. Le remboursement est effectué après réception et vérification du colis. Les articles retournés endommagés ou incomplets ne pourront pas être remboursés.`,
          },
          {
            icon: '🔍',
            titre: 'État des produits',
            contenu: `Chaque poupée est décrite avec précision : état général, accessoires inclus, présence ou non de la boîte d'origine, défauts éventuels. Les photos sont contractuelles. Nous utilisons les mentions suivantes : Très bon état, Bon état, Acceptable et À restaurer.`,
          },
          {
            icon: '💰',
            titre: 'Rachat de poupées',
            contenu: `Ghoul's Closet propose le rachat de poupées Monster High auprès de particuliers. À l'issue du rachat, le vendeur peut choisir entre :\n\n• Un bon d'achat utilisable sur la boutique\n• Un paiement en espèces par virement bancaire ou PayPal, comme une vente classique\n\nLe montant proposé est basé sur l'état de la poupée, sa rareté, et les accessoires présents. Toutes les générations Monster High sont acceptées. Nous n'acceptons pas les poupées fortement abîmées ou incomplètes.`,
          },
          {
            icon: '⚖️',
            titre: 'Responsabilité',
            contenu: `Ghoul's Closet est un service de revente de poupées d'occasion. Monster High est une marque déposée de Mattel, Inc. Nous ne sommes pas affiliés à Mattel. Les prix sont fixés librement en fonction du marché de l'occasion.`,
          },
          {
            icon: '📧',
            titre: 'Contact',
            contenu: `Pour toute question relative à une commande, un retour ou un rachat :\n\ncontact@vorka.eu\nRéponse garantie sous 48h.`,
          },
        ].map((section, i) => (
          <div key={i} style={{
            marginBottom: '2rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '1.5rem',
          }}>
            <h2 style={{
              color: '#ff2d78',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              margin: '0 0 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>{section.icon}</span> {section.titre}
            </h2>
            <p style={{
              color: '#aaa',
              lineHeight: 1.8,
              margin: 0,
              fontSize: '0.9rem',
              whiteSpace: 'pre-line',
              overflow: 'visible',
              display: 'block',
              WebkitLineClamp: 'unset',
              WebkitBoxOrient: 'unset',
              maxHeight: 'none',
            } as React.CSSProperties}>
              {section.contenu}
            </p>
          </div>
        ))}

        <p style={{ color: '#555', fontSize: '0.75rem', textAlign: 'center', marginTop: '3rem' }}>
          ☠ Dernière mise à jour : Avril 2026 — Ghoul's Closet
        </p>

      </div>
    </main>
  )
}
