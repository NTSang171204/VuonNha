'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { ShoppingCart, Search, Leaf } from 'lucide-react';

export function Header() {
  const itemCount = useCartStore((s) => s.itemCount());

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-green-600">
          <Leaf className="h-8 w-8" />
          <span className="text-xl font-bold">Nông Sản Tươi</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-green-600">
            Trang chủ
          </Link>
          <Link href="/tracking" className="text-gray-600 hover:text-green-600">
            Tra cứu đơn
          </Link>
          <Link href="/gio-hang" className="relative text-gray-600 hover:text-green-600">
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
