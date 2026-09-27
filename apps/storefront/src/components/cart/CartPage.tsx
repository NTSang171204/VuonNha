'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { Trash2, Minus, Plus, ArrowLeft } from 'lucide-react';

export function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-500">Giỏ hàng trống</p>
        <Link href="/" className="text-green-600 hover:underline">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-xl border bg-white p-4"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-green-600">
                  {item.price.toLocaleString('vi-VN')}đ / {item.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="rounded border p-1 hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="rounded border p-1 hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="w-24 text-right font-semibold">
                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
              </p>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Tổng cộng</h2>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Tạm tính</span>
            <span>{total().toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Phí vận chuyển</span>
            <span className="text-green-600">Miễn phí</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng</span>
              <span className="text-green-600">{total().toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
        <Link
          href="/thanh-toan"
          className="block rounded-xl bg-green-600 py-3 text-center font-semibold text-white hover:bg-green-700"
        >
          Thanh toán
        </Link>
        <Link
          href="/"
          className="mt-3 flex items-center justify-center gap-2 text-gray-600 hover:text-green-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
