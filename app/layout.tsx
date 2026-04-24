import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Ghoul's Closet — Monster High d'occasion",
  description: "Achetez et vendez des poupées Monster High d'occasion. Collection vintage, éditions rares, envoi soigné.",
  openGraph: {
    title: "Ghoul's Closet",
    description: "Monster High d'occasion — achat, vente, rachat",
    url: 'https://vorka.eu',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Creepster&family=Josefin+Sans:wght@300;400;600;700&family=Special+Elite&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
