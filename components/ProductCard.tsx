'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/supabase';
import { formatPrice } from '@/lib/stripe';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isDigital = product.type === 'digital';
  const outOfStock = product.stock === 0;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {isDigital ? '📄' : '📦'}
            </div>
          )}

          {/* Badge type */}
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isDigital
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isDigital ? '⚡ Digital' : '📦 Physique'}
            </span>
          </div>

          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 font-semibold text-sm px-3 py-1 rounded-full">
                Rupture de stock
              </span>
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {!outOfStock && (
              <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-lg">
                Acheter →
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
