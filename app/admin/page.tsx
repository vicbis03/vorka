import { supabaseAdmin } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';

async function getOrders() {
  const { data } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (
        quantity,
        unit_price,
        products (name, type)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return data || [];
}

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  paid:      'bg-blue-100 text-blue-700',
  fulfilled: 'bg-green-100 text-green-700',
  error:     'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending:   '⏳ En attente',
  paid:      '💳 Payé',
  fulfilled: '✅ Traité',
  error:     '❌ Erreur',
};

export default async function AdminPage() {
  const orders = await getOrders();

  const stats = {
    total: orders.length,
    fulfilled: orders.filter(o => o.status === 'fulfilled').length,
    errors: orders.filter(o => o.status === 'error').length,
    revenue: orders
      .filter(o => ['paid', 'fulfilled'].includes(o.status))
      .reduce((sum, o) => sum + o.total_amount, 0),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        🗂️ Administration des commandes
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Commandes</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{stats.fulfilled}</div>
          <div className="text-sm text-gray-500">Traitées</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
          <div className="text-sm text-gray-500">Erreurs</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {formatPrice(stats.revenue)}
          </div>
          <div className="text-sm text-gray-500">CA total</div>
        </div>
      </div>

      {/* Tableau */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
          <div className="text-5xl mb-3">📭</div>
          <p>Aucune commande pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Produit</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Montant</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Réf. fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order: Record<string, unknown>) => {
                  const items = (order.order_items as Array<{
                    quantity: number;
                    unit_price: number;
                    products: { name: string; type: string } | null;
                  }>) || [];
                  const firstItem = items[0];
                  const productName = firstItem?.products?.name || '—';
                  const productType = firstItem?.products?.type;
                  const date = new Date(order.created_at as string).toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  });

                  return (
                    <tr key={order.id as string} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{date}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 truncate max-w-[180px]">
                          {order.customer_name as string || '—'}
                        </div>
                        <div className="text-gray-400 text-xs truncate max-w-[180px]">
                          {order.customer_email as string}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="truncate max-w-[160px]">{productName}</div>
                        {productType && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            productType === 'digital'
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {productType === 'digital' ? 'Digital' : 'Physique'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatPrice(order.total_amount as number)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          statusColors[order.status as string] || 'bg-gray-100 text-gray-600'
                        }`}>
                          {statusLabels[order.status as string] || order.status as string}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[160px]">
                        {(order.fulfillment_ref as string) || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">
        ⚠️ Cette page n&apos;est pas protégée par un mot de passe. 
        Ajoutez une authentification avant de mettre en production.
      </p>
    </div>
  );
}
