'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { createOrder } from '@/lib/api';
import { FormField, FormTextarea } from './FormField';
import { ProvinceSelect } from './ProvinceSelect';
import { TimeSlotPicker } from './TimeSlotPicker';
import { OrderSummary } from './OrderSummary';

const FREE_SHIP_PROVINCES = ['TP.Hồ Chí Minh', 'TP.HCM', 'Hồ Chí Minh'];
const FREE_SHIP_THRESHOLD = 300000;
const SHIPPING_FEE = 30000;

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shippingFee: 0,
    total: 0,
  });

  // Tính ngày mặc định: ngày mai + 1
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];
    setForm((prev) => ({ ...prev, deliveryDate: defaultDate }));
  }, []);

  // Cập nhật order summary khi items hoặc province thay đổi
  useEffect(() => {
    const subtotal = total();
    const isFreeShip =
      FREE_SHIP_PROVINCES.includes(form.shippingProvince) && subtotal >= FREE_SHIP_THRESHOLD;
    const shippingFee = isFreeShip ? 0 : SHIPPING_FEE;
    setOrderSummary({
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
    });
  }, [items, form.shippingProvince, total]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.recipientName.trim() || form.recipientName.trim().length < 2) {
      newErrors.recipientName = 'Vui lòng nhập họ và tên';
    }

    if (!/^0\d{9}$/.test(form.recipientPhone)) {
      newErrors.recipientPhone = 'Số điện thoại không hợp lệ';
    }

    if (!form.shippingAddressDetail.trim() || form.shippingAddressDetail.trim().length < 5) {
      newErrors.shippingAddressDetail = 'Vui lòng nhập địa chỉ chi tiết';
    }

    if (!form.shippingProvince) {
      newErrors.shippingProvince = 'Vui lòng chọn tỉnh/thành phố';
    }

    if (!form.deliveryDate) {
      newErrors.deliveryDate = 'Vui lòng chọn ngày giao';
    }

    if (!form.deliveryTimeSlot) {
      newErrors.deliveryTimeSlot = 'Vui lòng chọn khung giờ giao';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const result = await createOrder({
        ...form,
        idempotencyKey:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Math.max(1, Math.round(i.quantity)),
        })),
      });

      clearCart();
      router.push(
        `/thanh-toan/thanh-cong?orderCode=${encodeURIComponent(result.orderCode)}&phone=${encodeURIComponent(form.recipientPhone)}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">Giỏ hàng trống</p>
      </div>
    );
  }

  // Format delivery date display
  const formatDeliveryDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const dayOfWeek = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `Giao ngày mai, ${dayOfWeek} ${day}/${month}`;
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      {/* Left Column: Customer Info */}
      <div className="space-y-6">
        {/* Liên hệ */}
        <div className="rounded-xl border border-line bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-ink">Liên hệ</h2>
          <div className="space-y-4">
            <FormField
              label="Họ và tên"
              required
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              error={errors.recipientName}
            />
            <FormField
              label="Số điện thoại"
              type="tel"
              required
              value={form.recipientPhone}
              onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
              hint="Shipper sẽ gọi số này khi giao. Cửa hàng cũng nhắn số tiền cuối cùng sau khi cân."
              error={errors.recipientPhone}
            />
          </div>
        </div>

        {/* Địa chỉ giao hàng */}
        <div className="rounded-xl border border-line bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-ink">Địa chỉ giao hàng</h2>
          <div className="space-y-4">
            <FormField
              label="Địa chỉ"
              required
              placeholder="Số nhà, tên đường, phường/xã"
              value={form.shippingAddressDetail}
              onChange={(e) => setForm({ ...form, shippingAddressDetail: e.target.value })}
              error={errors.shippingAddressDetail}
            />
            <ProvinceSelect
              value={form.shippingProvince}
              onChange={(value) => setForm({ ...form, shippingProvince: value })}
              error={errors.shippingProvince}
            />
            <FormTextarea
              label="Ghi chú (không bắt buộc)"
              placeholder="Ví dụ: gọi trước khi giao, gửi bảo vệ tòa nhà…"
              value={form.shippingNote}
              onChange={(e) => setForm({ ...form, shippingNote: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {/* Khung giờ giao */}
        <div className="rounded-xl border border-line bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-ink">Khung giờ giao</h2>
          <p className="mb-4 text-sm text-muted">
            {formatDeliveryDate(form.deliveryDate)}
          </p>
          <div className="space-y-4">
            <FormField
              label="Ngày giao"
              type="date"
              required
              value={form.deliveryDate}
              onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
              error={errors.deliveryDate}
            />
            <TimeSlotPicker
              value={form.deliveryTimeSlot}
              onChange={(value) => setForm({ ...form, deliveryTimeSlot: value })}
              error={errors.deliveryTimeSlot}
            />
          </div>
        </div>

        {/* Thanh toán */}
        <div className="rounded-xl border border-line bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-ink">Thanh toán</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 rounded-lg border border-line p-4 cursor-pointer hover:border-primary/50">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={form.paymentMethod === 'COD'}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="h-4 w-4 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-ink">Thanh toán khi nhận hàng (COD)</p>
                <p className="mt-0.5 text-[13px] text-muted">
                  Bạn trả tiền mặt hoặc chuyển khoản cho shipper khi nhận hàng, theo số tiền đã điều chỉnh sau khi cân.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Giá tạm tính */}
        <div className="rounded-xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-ink">Giá tạm tính</span>
            <span className="text-xl font-bold text-ink">
              {orderSummary.total.toLocaleString('vi-VN')}₫
            </span>
          </div>
          <p className="mt-2 text-[13px] text-muted">
            Số tiền cuối cùng sẽ được điều chỉnh theo cân thực tế, chênh lệch tối đa ±10%.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-dark disabled:bg-gray-300"
          >
            {loading ? 'Đang xử lý...' : 'Đặt hàng'}
          </button>
          <button
            type="button"
            onClick={handleBackToHome}
            className="self-start text-sm text-muted transition-colors hover:text-primary"
          >
            ← Quay lại trang chủ
          </button>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Right Column: Order Summary */}
      <div className="h-fit">
        <OrderSummary
          subtotal={orderSummary.subtotal}
          shippingFee={orderSummary.shippingFee}
          total={orderSummary.total}
          shippingProvince={form.shippingProvince}
        />
      </div>
    </form>
  );
}
