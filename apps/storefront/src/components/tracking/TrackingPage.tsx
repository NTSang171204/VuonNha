'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackOrder, Order } from '@/lib/api';
import { useOrderHistoryStore } from '@/store/order-history';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  PENDING: { icon: <Clock className="h-5 w-5" />, color: 'text-yellow-500', label: 'Chờ xác nhận' },
  CONFIRMED: { icon: <Package className="h-5 w-5" />, color: 'text-blue-500', label: 'Đã xác nhận' },
  DELIVERING: { icon: <Truck className="h-5 w-5" />, color: 'text-purple-500', label: 'Đang giao' },
  COMPLETED: { icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-500', label: 'Hoàn tất' },
  CANCELLED: { icon: <XCircle className="h-5 w-5" />, color: 'text-red-500', label: 'Đã hủy' },
};

export function TrackingPage() {
  const searchParams = useSearchParams();
  const recentOrders = useOrderHistoryStore((s) => s.orders);
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const runTrack = async (code: string, phoneValue: string) => {
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const result = await trackOrder(code.trim(), phoneValue.trim());
      if (result) {
        setOrder(result);
      } else {
        setError(
          'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn và số điện thoại.',
        );
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get('orderCode');
    const phoneParam = searchParams.get('phone');
    if (code) setOrderCode(code);
    if (phoneParam) setPhone(phoneParam);
    if (code && phoneParam) {
      void runTrack(code, phoneParam);
    }
  }, [searchParams]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    await runTrack(orderCode, phone);
  };

  const handleRecentClick = (code: string, phoneValue: string) => {
    setOrderCode(code);
    setPhone(phoneValue);
    void runTrack(code, phoneValue);
  };

  return (
    <div>
      {recentOrders.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-ink">Đơn gần đây</h2>
          <div className="flex flex-wrap gap-2">
            {recentOrders.map((item) => (
              <button
                key={`${item.orderCode}-${item.phone}`}
                type="button"
                onClick={() => handleRecentClick(item.orderCode, item.phone)}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink transition-colors hover:border-primary hover:text-primary"
              >
                {item.orderCode}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleTrack} className="mb-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Mã đơn hàng</label>
          <input
            type="text"
            required
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            placeholder="VD: VN-20261004-0001"
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại đặt hàng"
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-300"
        >
          {loading ? 'Đang tra cứu...' : 'Tra cứu'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
      )}

      {order && (
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Thông tin đơn hàng</h2>
          <div className="mb-4 space-y-2 text-sm">
            <p><span className="font-medium">Mã đơn:</span> {order.orderCode}</p>
            <p><span className="font-medium">Người nhận:</span> {order.recipientName}</p>
            <p><span className="font-medium">Điện thoại:</span> {order.recipientPhone}</p>
            <p><span className="font-medium">Địa chỉ:</span> {order.shippingAddressDetail}, {order.shippingProvince}</p>
            <p><span className="font-medium">Tổng tiền:</span> {order.totalAmount?.toLocaleString('vi-VN')}đ</p>
          </div>

          <div className="mb-4">
            <h3 className="mb-2 font-medium">Trạng thái</h3>
            <div className="flex items-center gap-2">
              {statusConfig[order.status]?.icon}
              <span className={statusConfig[order.status]?.color}>
                {statusConfig[order.status]?.label}
              </span>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Sản phẩm</h3>
            <div className="space-y-2">
              {order.items?.map((item) => {
                const ordered = item.orderedQuantity ?? item.quantity;
                const unit = item.unit || 'KG';
                const unitLabel =
                  unit === 'KG'
                    ? 'kg'
                    : unit === 'BUNDLE'
                      ? 'bó'
                      : unit === 'BOX'
                        ? 'hộp'
                        : 'trái';
                const adjusted =
                  unit === 'KG' && item.quantity !== ordered;

                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.productName}{' '}
                      {adjusted ? (
                        <>
                          (đặt {ordered} {unitLabel} / thực tế {item.quantity}{' '}
                          {unitLabel})
                        </>
                      ) : (
                        <>
                          x{item.quantity} {unitLabel}
                        </>
                      )}
                    </span>
                    <span>{item.subtotal?.toLocaleString('vi-VN')}đ</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
