import { supabase, Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenue dans notre boutique
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Produits digitaux téléchargeables instantanément · Produits physiques livrés en 7–14 jours
        </p>
      </div>

      {/* Grille produits */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-lg">Aucun produit disponible pour l&apos;instant.</p>
          <p className="text-sm mt-2">Ajoutez des produits dans Supabase → table <code>products</code></p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">
            {products.length} produit{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  );
}
