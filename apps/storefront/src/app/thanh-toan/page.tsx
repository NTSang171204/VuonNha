'use client';

import { CheckoutPage } from '@/components/checkout/CheckoutPage';

export default function Checkout() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Thanh toán</h1>
      <CheckoutPage />
    </div>
  );
}
