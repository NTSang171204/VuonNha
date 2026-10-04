'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  price: number;
  unit: string;
  stock: number;
  category?: { name: string };
}

const UNIT_LABELS: Record<string, string> = {
  KG: 'kg',
  FRUIT: 'trái',
  BOX: 'hộp',
  BUNDLE: 'bó',
};

const HARDCODED_ORIGIN = 'Cái Bè, Đồng Tháp';
const HARDCODED_HARVEST = 'Thu hoạch ngày 25/09';

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  const unitLabel = UNIT_LABELS[product.unit] || product.unit;
  const isWeightBased = product.unit === 'KG';
  const maxQty = Math.max(1, product.stock);
  const safeQty = Math.min(quantity, maxQty);
  const subtotal = product.price * safeQty;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      quantity: safeQty,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/thanh-toan');
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Không có ảnh
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {product.category && (
          <span className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
            {product.category.name}
          </span>
        )}

        <h1 className="mb-4 text-3xl font-bold text-ink">{product.name}</h1>

        <div className="mb-6 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
          <span className="text-lg text-muted">/ {unitLabel}</span>
        </div>

        <div className="mb-6 space-y-2 border-b border-line pb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Nơi trồng</span>
            <span className="text-ink">{HARDCODED_ORIGIN}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Thu hoạch</span>
            <span className="text-ink">{HARDCODED_HARVEST}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Đơn vị bán</span>
            <span className="text-ink">{unitLabel}</span>
          </div>
        </div>

        <div className="mb-6">
          <span className="mb-3 block text-sm font-medium text-ink">
            {isWeightBased ? 'Khối lượng (kg nguyên)' : 'Số lượng'}
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-line">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center border-0 bg-transparent hover:bg-gray-100"
                aria-label="Giảm số lượng"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-16 text-center text-lg font-semibold">
                {safeQty}
                {isWeightBased ? ' kg' : ''}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                className="grid h-11 w-11 place-items-center border-0 bg-transparent hover:bg-gray-100"
                aria-label="Tăng số lượng"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {isWeightBased ? (
              <div className="flex gap-2">
                {[1, 2, 3, 5].filter((w) => w <= maxQty).map((w) => (
                  <button
                    key={w}
                    onClick={() => setQuantity(w)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      safeQty === w
                        ? 'bg-primary text-white'
                        : 'border border-line text-ink hover:bg-gray-50'
                    }`}
                  >
                    {w} kg
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted">
                (Còn {product.stock} {unitLabel})
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Tạm tính</span>
            <span className="text-xl font-bold text-ink">
              {subtotal.toLocaleString('vi-VN')}₫
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Giá tạm tính. Số tiền cuối cùng sẽ được điều chỉnh theo cân thực tế, chênh lệch tối đa ±10%.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary py-4 text-lg font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:border-gray-300 disabled:text-gray-300 disabled:hover:bg-transparent"
          >
            <ShoppingCart className="h-5 w-5" />
            {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="w-full rounded-xl bg-primary py-4 text-lg font-semibold text-white transition-colors hover:bg-primary/90 disabled:bg-gray-300"
          >
            Mua ngay
          </button>
        </div>

        {product.description && (
          <div className="border-t border-line pt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Mô tả sản phẩm
            </h3>
            <p className="text-gray-600">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
