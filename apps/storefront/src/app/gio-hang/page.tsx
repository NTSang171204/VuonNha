'use client';

import { CartPage } from '@/components/cart/CartPage';

export default function Cart() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Giỏ hàng</h1>
      <CartPage />
    </div>
  );
}
