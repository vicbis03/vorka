import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page introuvable</h1>
        <p className="text-gray-500 mb-8">Cette page n&apos;existe pas ou a été supprimée.</p>
        <Link
          href="/"
          className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          ← Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
