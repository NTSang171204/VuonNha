'use client';

import Image from 'next/image';
import { useCartStore } from '@/store/cart';
import { Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
  unit: string;
  stock: number;
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      quantity: 1,
    });
  };

  return (
    <div className="group rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Không có ảnh
          </div>
        )}
      </div>
      <h3 className="mb-1 font-semibold text-gray-800">{product.name}</h3>
      <p className="mb-3 text-lg font-bold text-green-600">
        {product.price.toLocaleString('vi-VN')}đ / {product.unit}
      </p>
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-white transition-colors hover:bg-green-700 disabled:bg-gray-300"
      >
        <Plus className="h-4 w-4" />
        {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
      </button>
    </div>
  );
}
