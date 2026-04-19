'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase, Product } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .eq('active', true)
        .single();

      if (error || !data) {
        router.push('/');
        return;
      }
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [params.id, router]);

  async function handleBuy() {
    if (!product) return;
    setBuying(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      const { sessionId, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe non chargé');

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) throw new Error(stripeError.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!product) return null;

  const isDigital = product.type === 'digital';
  const outOfStock = product.stock === 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          ← Retour à la boutique
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square bg-gray-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {isDigital ? '📄' : '📦'}
              </div>
            )}
          </div>

          {/* Détails */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  isDigital
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {isDigital ? '⚡ Produit digital' : '📦 Produit physique'}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-gray-600 leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              {/* Infos livraison */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                {isDigital ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>⚡</span>
                      <span>Téléchargement instantané après paiement</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📧</span>
                      <span>Lien envoyé par email automatiquement</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>♾️</span>
                      <span>Accès à vie</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>🚚</span>
                      <span>Livraison estimée : 7–14 jours ouvrés</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📧</span>
                      <span>Email de suivi automatique</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.stock > 0 && product.stock < 10 && (
                  <span className="text-sm text-orange-600 font-medium">
                    Plus que {product.stock} en stock
                  </span>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleBuy}
                disabled={outOfStock || buying}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all duration-200 ${
                  outOfStock
                    ? 'bg-gray-300 cursor-not-allowed'
                    : buying
                    ? 'bg-indigo-400 cursor-wait'
                    : 'bg-indigo-500 hover:bg-indigo-600 active:scale-95'
                }`}
              >
                {outOfStock
                  ? 'Rupture de stock'
                  : buying
                  ? '⏳ Redirection...'
                  : `Acheter — ${formatPrice(product.price)}`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                🔒 Paiement sécurisé par Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
