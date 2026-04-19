'use client';

import Link from 'next/link';

export default function Navbar() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Ma Boutique';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-lg text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {storeName}
        </Link>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Boutique
          </Link>
        </div>
      </div>
    </nav>
  );
}
