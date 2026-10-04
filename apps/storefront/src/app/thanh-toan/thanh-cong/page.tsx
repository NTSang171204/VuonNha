import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { orderCode?: string; phone?: string };
}) {
  const orderCode = searchParams.orderCode;
  const phone = searchParams.phone;
  const trackingHref =
    orderCode && phone
      ? `/tracking?orderCode=${encodeURIComponent(orderCode)}&phone=${encodeURIComponent(phone)}`
      : '/tracking';

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Đặt hàng thành công!</h1>
      <p className="mb-4 text-gray-600">
        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.
      </p>
      {orderCode && (
        <p className="mb-8 rounded-lg bg-green-50 px-4 py-3 text-sm text-gray-800">
          Mã đơn hàng của bạn:{' '}
          <span className="font-semibold text-green-700">{orderCode}</span>
        </p>
      )}
      <div className="space-y-3">
        <Link
          href={trackingHref}
          className="block rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
        >
          Tra cứu đơn hàng
        </Link>
        <Link
          href="/"
          className="block rounded-xl border py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
