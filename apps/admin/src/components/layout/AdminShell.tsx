'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import api, {
  AdminUser,
  clearAdminSession,
  getStoredAdminUser,
} from '@/lib/api';

const NAV = [
  { href: '/dashboard', label: 'Tổng quan', icon: 'dashboard' },
  { href: '/san-pham', label: 'Quản lý sản phẩm', icon: 'inventory_2' },
  { href: '/don-hang', label: 'Quản lý đơn hàng', icon: 'receipt_long' },
  { href: '/khach-hang', label: 'Khách hàng', icon: 'group', stub: true },
  { href: '/danh-muc', label: 'Danh mục', icon: 'category' },
  { href: '/cai-dat', label: 'Cài đặt', icon: 'settings', stub: true },
];

interface Props {
  children: React.ReactNode;
}

export function AdminShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    setUser(getStoredAdminUser());
    setReady(true);

    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem('admin_user', JSON.stringify(data));
      })
      .catch(() => {
        /* interceptor handles 401 */
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* still clear local session */
    }
    clearAdminSession();
    message.success('Đã đăng xuất');
    router.push('/login');
  };

  const userMenu: MenuProps['items'] = [
    {
      key: 'logout',
      label: 'Đăng xuất',
      onClick: () => {
        void handleLogout();
      },
    },
  ];

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-ink-secondary">
        Đang tải...
      </div>
    );
  }

  const breadcrumb =
    NAV.find((item) => pathname.startsWith(item.href))?.label || 'Tổng quan';

  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <aside className="fixed bottom-0 left-0 top-0 z-50 flex w-60 flex-col border-r border-line bg-surface-card">
        <div className="flex h-16 items-center gap-3 border-b border-line px-4">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-sm font-bold text-white">
            VN
          </span>
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-tight text-primary">
              Vườn Nhà
            </span>
            <span className="text-xs font-medium text-ink-secondary">
              Cổng Vận Hành
            </span>
          </div>
        </div>

        <div className="px-4 pb-1 pt-3">
          <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Hệ thống
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-2">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'border-r-2 border-primary bg-surface-low font-semibold text-primary'
                    : 'font-medium text-ink-secondary hover:bg-surface-container hover:text-ink'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
                {item.stub && (
                  <span className="ml-auto rounded bg-surface-container px-1.5 py-0.5 text-[10px] text-ink-muted">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2 rounded-md bg-surface-low p-2">
            <span className="material-symbols-outlined text-secondary">
              verified
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-secondary">
                VietGAP Verified
              </span>
              <span className="text-[11px] text-ink-muted">
                Chuỗi cung ứng sạch
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="pl-60">
        <header className="fixed left-60 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-surface-card/95 px-6 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-1 text-xs text-ink-secondary sm:flex">
              <span>Trang chủ</span>
              <span className="material-symbols-outlined text-base text-ink-muted">
                chevron_right
              </span>
              <span className="font-semibold text-ink">{breadcrumb}</span>
            </div>
            <div className="relative hidden w-72 md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-ink-muted">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm (Mã ĐH, Nông sản...)"
                className="h-9 w-full rounded-md border border-line-control bg-surface-low py-1.5 pl-9 pr-12 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-secondary"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-line-control bg-surface-container px-1.5 py-0.5 text-[10px] text-ink-secondary">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/don-hang')}
              className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tạo đơn mới
            </button>
            <button
              type="button"
              className="relative grid h-9 w-9 place-items-center rounded-md text-ink-secondary hover:bg-surface-container"
              aria-label="Thông báo"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-white" />
            </button>
            <div className="h-6 w-px bg-line" />
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <button
                type="button"
                className="flex items-center gap-3 rounded-md px-1 py-1 hover:bg-surface-low"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </span>
                <div className="hidden text-left lg:block">
                  <div className="text-sm font-semibold leading-tight text-ink">
                    {user?.name || 'Admin'}
                  </div>
                  <div className="text-xs leading-tight text-ink-secondary">
                    Quản trị viên vận hành
                  </div>
                </div>
                <span className="material-symbols-outlined hidden text-lg text-ink-muted sm:block">
                  expand_more
                </span>
              </button>
            </Dropdown>
          </div>
        </header>

        <main className="min-h-screen bg-surface px-6 pb-8 pt-20">{children}</main>
      </div>
    </div>
  );
}
