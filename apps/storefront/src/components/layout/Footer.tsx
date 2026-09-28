export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-base font-semibold text-ink">Vườn Nhà</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Nông sản sạch từ nông trại đối tác, thu hoạch trong tuần và giao tận nhà.
            </p>
            <p className="mt-3 text-sm text-muted">
              128 Trần Quang Khải, phường Tân Định, TP.HCM
            </p>
            <p className="mt-1 text-sm text-muted">
              Hotline: 1900 6868 (8:00 – 20:00)
            </p>
          </div>

          {/* Shopping */}
          <div>
            <h3 className="text-sm font-semibold text-ink">Mua sắm</h3>
            <ul className="mt-3 space-y-2">
              <li><a href="/" className="text-sm text-muted hover:text-primary">Tất cả sản phẩm</a></li>
              <li><a href="/danh-muc/rau-cu" className="text-sm text-muted hover:text-primary">Rau củ</a></li>
              <li><a href="/danh-muc/trai-cay" className="text-sm text-muted hover:text-primary">Trái cây</a></li>
              <li><a href="/danh-muc/dac-san-vung-mien" className="text-sm text-muted hover:text-primary">Đặc sản vùng miền</a></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold text-ink">Chính sách</h3>
            <ul className="mt-3 space-y-2">
              <li><a href="/chinh-sach/giao-hang" className="text-sm text-muted hover:text-primary">Chính sách giao hàng</a></li>
              <li><a href="/chinh-sach/doi-tra" className="text-sm text-muted hover:text-primary">Đổi trả và hoàn tiền</a></li>
              <li><a href="/chinh-sach/can-dieu-chinh" className="text-sm text-muted hover:text-primary">Cân và điều chỉnh giá</a></li>
              <li><a href="/chinh-sach/bao-mat" className="text-sm text-muted hover:text-primary">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-ink">Nhận tin mùa vụ</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Mỗi tuần một email về sản phẩm vừa thu hoạch.
            </p>
            <form className="mt-4 flex items-center border border-ink">
              <input
                type="email"
                placeholder="Email của bạn"
                className="h-12 flex-1 bg-transparent px-4 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-12 w-12 items-center justify-center text-ink hover:bg-primary hover:text-white"
                aria-label="Đăng ký"
              >
                →
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">© 2026 Vườn Nhà</p>
          <p className="text-sm text-muted">Thanh toán khi nhận hàng (COD)</p>
        </div>
      </div>
    </footer>
  );
}
