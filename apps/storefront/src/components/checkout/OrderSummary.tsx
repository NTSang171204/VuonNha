'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';

interface Props {
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingProvince: string;
  discountAmount?: number;
  appliedCoupon?: string | null;
  discountLabel?: string | null;
  couponLoading?: boolean;
  couponError?: string;
  onApplyCoupon: (code: string) => void;
  onClearCoupon: () => void;
}

const UNIT_LABELS: Record<string, string> = {
  KG: 'kg',
  FRUIT: 'trái',
  BOX: 'hộp',
  BUNDLE: 'bó',
};

export function OrderSummary({
  subtotal,
  shippingFee,
  total,
  discountAmount = 0,
  appliedCoupon,
  discountLabel,
  couponLoading,
  couponError,
  onApplyCoupon,
  onClearCoupon,
}: Props) {
  const items = useCartStore((s) => s.items);
  const [couponCode, setCouponCode] = useState('');

  return (
    <div className="rounded-xl border border-line bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-ink">Đơn hàng của bạn</h2>

      <div className="mb-4 space-y-4">
        {items.map((item) => {
          const unitLabel = UNIT_LABELS[item.unit] || item.unit;
          return (
            <div key={item.productId} className="flex gap-4">
              <div className="relative h-[72px] w-[72px] flex-none overflow-hidden rounded-lg border border-line bg-surface">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-base font-semibold text-muted">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-medium text-ink">{item.name}</p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {item.quantity} {unitLabel} · {item.price.toLocaleString('vi-VN')}₫/
                      {unitLabel}
                    </p>
                  </div>
                  <p className="flex-none text-[15px] font-medium text-ink">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Mã giảm giá"
          value={appliedCoupon || couponCode}
          disabled={!!appliedCoupon || couponLoading}
          onChange={(e) => setCouponCode(e.target.value)}
          className="flex-1 rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary disabled:bg-surface"
        />
        {appliedCoupon ? (
          <button
            type="button"
            onClick={() => {
              setCouponCode('');
              onClearCoupon();
            }}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-gray-50"
          >
            Gỡ
          </button>
        ) : (
          <button
            type="button"
            disabled={couponLoading || !couponCode.trim()}
            onClick={() => onApplyCoupon(couponCode.trim())}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-gray-50 disabled:opacity-50"
          >
            {couponLoading ? '...' : 'Áp dụng'}
          </button>
        )}
      </div>
      {couponError && (
        <p className="mb-3 text-sm text-red-600">{couponError}</p>
      )}
      {appliedCoupon && discountLabel && (
        <p className="mb-3 text-sm text-primary">{discountLabel}</p>
      )}

      <div className="space-y-2 border-t border-line pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Tạm tính</span>
          <span className="text-ink">
            {(subtotal + discountAmount).toLocaleString('vi-VN')}₫
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">Giảm giá ({appliedCoupon})</span>
            <span className="text-primary">
              -{discountAmount.toLocaleString('vi-VN')}₫
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted">Phí giao hàng</span>
          <span className="text-ink">
            {shippingFee === 0 ? (
              <span className="text-primary">Miễn phí</span>
            ) : (
              `${shippingFee.toLocaleString('vi-VN')}₫`
            )}
          </span>
        </div>
        <div className="flex justify-between border-t border-line pt-3">
          <span className="text-base font-bold text-ink">Tổng cộng</span>
          <span className="text-xl font-bold text-ink">
            {total.toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>

      <p className="mt-4 text-[13px] text-muted">
        Giá tạm tính. Số tiền cuối cùng sẽ được điều chỉnh theo cân thực tế, chênh lệch tối đa ±10%.
      </p>
    </div>
  );
}
