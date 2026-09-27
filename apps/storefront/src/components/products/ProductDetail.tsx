'use client';

import Image from 'next/image';
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

export function ProductDetail({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      quantity,
    });
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
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Không có ảnh
          </div>
        )}
      </div>

      <div>
        {product.category && (
          <span className="mb-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
            {product.category.name}
          </span>
        )}
        <h1 className="mb-4 text-3xl font-bold text-gray-800">{product.name}</h1>
        <p className="mb-6 text-3xl font-bold text-green-600">
          {product.price.toLocaleString('vi-VN')}đ / {product.unit}
        </p>
        {product.description && (
          <p className="mb-6 text-gray-600">{product.description}</p>
        )}

        <div className="mb-6 flex items-center gap-4">
          <span className="text-gray-600">Số lượng:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="rounded-lg border p-2 hover:bg-gray-100"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="rounded-lg border p-2 hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-gray-500">
            (Còn {product.stock} {product.unit})
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-700 disabled:bg-gray-300"
        >
          <ShoppingCart className="h-5 w-5" />
          {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
        </button>
      </div>
    </div>
  );
}
