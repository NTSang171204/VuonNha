'use client';

import Link from 'next/link';
import { Product } from '@/lib/api';

const UNIT_LABELS: Record<string, string> = {
  KG: 'kg',
  BUNDLE: 'bó',
  BOX: 'hộp',
  FRUIT: 'trái',
};

export function ProductCard({ product }: { product: Product }) {
  const isSoldOut = product.stock === 0;
  const unitLabel = UNIT_LABELS[product.unit] || product.unit;

  return (
    <Link
      href={`/san-pham/${product.id}`}
      className="group flex min-w-0 flex-col gap-3 text-ink no-underline"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            Không có ảnh
          </div>
        )}
        {isSoldOut && (
          <span className="absolute left-2 top-2 rounded-sm bg-ink px-2 py-1 text-xs font-medium text-white">
            Hết hàng
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[15px] leading-snug">{product.name}</span>
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span>
            <strong className="font-semibold">
              {product.price.toLocaleString('vi-VN')}₫
            </strong>
            <span className="text-[13px] text-muted"> / {unitLabel}</span>
          </span>
        </span>
      </div>
    </Link>
  );
}
