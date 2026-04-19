import Link from 'next/link';

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string; type?: string };
}) {
  const isDigital = searchParams.type === 'digital';

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="text-7xl mb-6">{isDigital ? '⚡' : '📦'}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Merci pour votre achat !
        </h1>
        <p className="text-gray-600 leading-relaxed mb-8">
          {isDigital
            ? 'Un email avec votre lien de téléchargement vient d\'être envoyé. Vérifiez votre boîte mail (et les spams si besoin).'
            : 'Votre commande a été transmise. Vous recevrez un email de confirmation avec le suivi de livraison.'}
        </p>
        <Link
          href="/"
          className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200"
        >
          ← Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
