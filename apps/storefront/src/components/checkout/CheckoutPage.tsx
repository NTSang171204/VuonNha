'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { createOrder } from '@/lib/api';

export function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    recipientName: '',
    recipientPhone: '',
    shippingAddressDetail: '',
    shippingProvince: '',
    shippingNote: '',
    deliveryDate: '',
    deliveryTimeSlot: '',
    paymentMethod: 'COD',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createOrder({
        ...form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      if (result.id) {
        clearCart();
        router.push(`/thanh-toan/thanh-cong?orderId=${result.id}`);
      } else {
        setError(result.message || 'Có lỗi xảy ra khi đặt hàng');
      }
    } catch {
      setError('Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Giỏ hàng trống</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Thông tin giao hàng</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Họ tên người nhận</label>
              <input
                type="text"
                required
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
              <input
                type="tel"
                required
                value={form.recipientPhone}
                onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tỉnh/Thành phố</label>
              <input
                type="text"
                required
                value={form.shippingProvince}
                onChange={(e) => setForm({ ...form, shippingProvince: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Địa chỉ chi tiết</label>
              <input
                type="text"
                required
                value={form.shippingAddressDetail}
                onChange={(e) => setForm({ ...form, shippingAddressDetail: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ghi chú (tùy chọn)</label>
              <textarea
                value={form.shippingNote}
                onChange={(e) => setForm({ ...form, shippingNote: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Thời gian giao hàng</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Ngày giao</label>
              <input
                type="date"
                value={form.deliveryDate}
                onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Khung giờ</label>
              <select
                value={form.deliveryTimeSlot}
                onChange={(e) => setForm({ ...form, deliveryTimeSlot: e.target.value })}
                className="w-full rounded-lg border px-4 py-2"
              >
                <option value="">Chọn khung giờ</option>
                <option value="morning">Sáng (8h - 12h)</option>
                <option value="afternoon">Chiều (14h - 18h)</option>
                <option value="evening">Tối (18h - 21h)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Phương thức thanh toán</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={form.paymentMethod === 'COD'}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              />
              <span>Thanh toán khi nhận hàng (COD)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 h-fit">
        <h2 className="mb-4 text-lg font-bold">Đơn hàng</h2>
        <div className="mb-4 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Tổng</span>
            <span className="text-green-600">{total().toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-300"
        >
          {loading ? 'Đang xử lý...' : 'Đặt hàng'}
        </button>
      </div>
    </form>
  );
}
