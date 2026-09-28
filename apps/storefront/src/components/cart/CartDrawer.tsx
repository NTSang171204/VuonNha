'use client';

import Link from 'next/link';
import { X, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FREE_SHIP_THRESHOLD = 300000;

export function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.total());

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const progress = Math.min(100, Math.round((total / FREE_SHIP_THRESHOLD) * 100));
  const remaining = FREE_SHIP_THRESHOLD - total;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-ink/40 transition-opacity"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Giỏ hàng"
        className="fixed bottom-0 right-0 top-0 z-[80] flex w-[min(440px,100%)] flex-col bg-white transition-transform duration-300"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          visibility: open ? 'visible' : 'hidden',
        }}
      >
        <div className="flex h-[72px] flex-none items-center justify-between border-b border-line px-6">
          <h2 className="text-lg font-semibold">
            Giỏ hàng{' '}
            <span className="text-base font-normal text-muted">({itemCount})</span>
          </h2>
          <button
            aria-label="Đóng giỏ hàng"
            onClick={onClose}
            className="-mr-2.5 grid h-11 w-11 place-items-center border-0 bg-transparent"
          >
            <X className="h-[22px] w-[22px]" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
            <ShoppingCart className="h-10 w-10 text-muted" />
            <p className="mt-3 text-lg font-semibold">Giỏ hàng của bạn đang trống</p>
            <p className="mb-5 text-[15px] text-muted">
              Rau củ và trái cây mới thu hoạch đang chờ bạn.
            </p>
            <button
              onClick={onClose}
              className="h-[52px] bg-primary px-8 text-base font-medium text-white"
            >
              Tiếp tục mua sắm
            </button>
            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
              <Link href="/" onClick={onClose} className="text-ink">
                Tất cả sản phẩm
              </Link>
              <Link href="/" onClick={onClose} className="text-ink">
                Rau củ
              </Link>
              <Link href="/" onClick={onClose} className="text-ink">
                Trái cây
              </Link>
              <Link href="/" onClick={onClose} className="text-ink">
                Đặc sản vùng miền
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 py-4">
              <p className="mb-2 text-[13px]">
                {remaining > 0
                  ? `Mua thêm ${remaining.toLocaleString('vi-VN')}₫ để được miễn phí giao hàng tại TP.HCM.`
                  : 'Đơn của bạn được miễn phí giao hàng tại TP.HCM.'}
              </p>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="h-1 bg-line"
              >
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto px-6">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-4 border-b border-line py-5"
                >
                  <div className="h-[88px] w-[88px] flex-none rounded-md border border-line bg-surface" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex justify-between gap-3">
                      <div>
                        <Link
                          href={`/san-pham/${item.productId}`}
                          onClick={onClose}
                          className="text-[15px] font-medium text-ink no-underline"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-[13px] text-muted">
                          {item.price.toLocaleString('vi-VN')}₫ / {item.unit}
                        </p>
                      </div>
                      <div className="flex-none text-right">
                        <p className="text-[15px]">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex h-10 items-center border border-ink">
                        <button
                          aria-label="Giảm số lượng"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="grid h-full w-10 place-items-center border-0 bg-transparent disabled:opacity-30"
                        >
                          <Minus className="text-sm" />
                        </button>
                        <output className="min-w-16 text-center text-sm font-medium">
                          {item.quantity}
                        </output>
                        <button
                          aria-label="Tăng số lượng"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="grid h-full w-10 place-items-center border-0 bg-transparent"
                        >
                          <Plus className="text-sm" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="border-0 bg-transparent py-2.5 text-[13px] text-muted underline underline-offset-2"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex-none border-t border-line p-6">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-base font-semibold">Tạm tính</span>
                <span className="text-lg font-semibold">
                  {total.toLocaleString('vi-VN')}₫
                </span>
              </div>
              <p className="mb-3 text-[13px] text-muted">
                Phí giao hàng và mã giảm giá được tính ở bước thanh toán.
              </p>
              <Link
                href="/thanh-toan"
                onClick={onClose}
                className="flex h-[52px] items-center justify-center bg-primary text-base font-medium text-white no-underline hover:bg-primary-dark"
              >
                Thanh toán
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
