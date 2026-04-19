import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME || 'Ma Boutique',
  description: 'Boutique en ligne — livraison automatique',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 mt-16 py-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_STORE_NAME || 'Ma Boutique'}
        </footer>
      </body>
    </html>
  );
}
