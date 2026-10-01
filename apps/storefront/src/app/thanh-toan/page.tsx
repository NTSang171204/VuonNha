'use client';

import { CheckoutPage } from '@/components/checkout/CheckoutPage';

export default function Checkout() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-14">
      <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <a href="/" className="hover:text-primary">Giỏ hàng</a>
          </li>
          <li aria-hidden="true">›</li>
          <li className="text-ink">Thông tin giao hàng</li>
          <li aria-hidden="true">›</li>
          <li className="text-muted">Hoàn tất</li>
        </ol>
      </nav>
      <CheckoutPage />
    </div>
  );
}
