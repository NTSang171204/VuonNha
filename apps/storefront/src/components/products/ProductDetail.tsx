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
  status?: string;
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
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState(1); // kg

  const unitLabel = UNIT_LABELS[product.unit] || product.unit;
  const isWeightBased = product.unit === 'KG';
  const isInactive = product.status === 'INACTIVE';
  const isOutOfStock = product.stock === 0;
  const isDisabled = isInactive || isOutOfStock;

  const displayQuantity = isWeightBased ? weight : quantity;
  const subtotal = product.price * displayQuantity;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      quantity: displayQuantity,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/thanh-toan');
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Không có ảnh
          </div>
        )}
      </div>

      {/* Product Info & Call-to-Action */}
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

        {/* Quantity / Weight Selector */}
        <div className="mb-6">
          <span className="mb-3 block text-sm font-medium text-ink">
            {isWeightBased ? 'Khối lượng' : 'Số lượng'}
          </span>

          {isWeightBased ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-line">
                <button
                  onClick={() => setWeight((w) => Math.max(0.5, w - 0.5))}
                  className="grid h-11 w-11 place-items-center border-0 bg-transparent hover:bg-gray-100"
                  aria-label="Giảm khối lượng"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-16 text-center text-lg font-semibold">
                  {weight} kg
                </span>
                <button
                  onClick={() => setWeight((w) => w + 0.5)}
                  className="grid h-11 w-11 place-items-center border-0 bg-transparent hover:bg-gray-100"
                  aria-label="Tăng khối lượng"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                {[0.5, 1, 2, 3].map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeight(w)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      weight === w
                        ? 'bg-primary text-white'
                        : 'border border-line text-ink hover:bg-gray-50'
                    }`}
                  >
                    {w} kg
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-line">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid h-11 w-11 place-items-center border-0 bg-transparent hover:bg-gray-100"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-lg font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="grid h-11 w-11 place-items-center border-0 bg-transparent hover:bg-gray-100"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-muted">
                (Còn {product.stock} {unitLabel})
              </span>
            </div>
          )}
        </div>

        {/* Subtotal */}
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

        {/* Inactive notice */}
        {isInactive && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <span className="text-sm font-medium text-red-600">
              Sản phẩm tạm ngừng bán
            </span>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="mb-6 flex flex-col gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary py-4 text-lg font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:border-gray-300 disabled:text-gray-300 disabled:hover:bg-transparent"
          >
            <ShoppingCart className="h-5 w-5" />
            {isInactive ? 'Ngừng bán' : isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isDisabled}
            className="w-full rounded-xl bg-primary py-4 text-lg font-semibold text-white transition-colors hover:bg-primary/90 disabled:bg-gray-300"
          >
            Mua ngay
          </button>
        </div>

        {/* Description */}
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
