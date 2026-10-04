'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  navItems: NavItem[];
  onOpenCart: () => void;
}

export function Header({ navItems, onOpenCart }: Props) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const itemCount = useCartStore((s) => s.itemCount());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    if (q) {
      router.push(`/?search=${encodeURIComponent(q)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-6 px-4 md:px-14">
          <button
            aria-label="Mở menu"
            onClick={() => setMenuOpen(true)}
            className="-ml-2.5 grid h-11 w-11 place-items-center border-0 bg-transparent md:hidden"
          >
            <Menu className="h-[22px] w-[22px]" />
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 text-ink no-underline"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xl font-bold tracking-tight">Vườn Nhà</span>
          </Link>

          <nav aria-label="Danh mục" className="hidden flex-1 gap-7 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-2 text-[15px] text-ink no-underline hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              aria-label="Tìm kiếm"
              onClick={() => setSearchOpen((prev) => !prev)}
              className="grid h-11 w-11 place-items-center border-0 bg-transparent"
            >
              <Search className="h-[22px] w-[22px]" />
            </button>
            <button
              aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}
              onClick={onOpenCart}
              className="relative grid h-11 w-11 place-items-center border-0 bg-transparent text-ink"
            >
              <ShoppingCart className="h-[22px] w-[22px]" />
              {itemCount > 0 && (
                <span className="absolute bottom-1 right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="border-t border-line px-4 py-4 md:px-14">
            <form
              onSubmit={handleSearch}
              className="mx-auto flex h-[52px] max-w-[720px] items-center gap-2 border border-line bg-white pl-4 pr-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm rau, trái cây, đặc sản…"
                className="h-full min-w-0 flex-1 border-0 bg-transparent text-base outline-none"
                autoFocus
              />
              <button
                type="submit"
                aria-label="Tìm"
                className="grid h-11 w-11 place-items-center border-0 bg-transparent"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </header>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[70] bg-ink/40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed bottom-0 left-0 top-0 z-[80] flex w-[min(340px,86%)] flex-col bg-white"
          >
            <div className="flex h-[72px] items-center justify-between border-b border-line px-4">
              <span className="text-lg font-bold tracking-tight">Vườn Nhà</span>
              <button
                aria-label="Đóng menu"
                onClick={() => setMenuOpen(false)}
                className="-mr-2.5 grid h-11 w-11 place-items-center border-0 bg-transparent"
              >
                <X className="h-[22px] w-[22px]" />
              </button>
            </div>
            <nav aria-label="Danh mục" className="flex flex-col py-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[52px] items-center px-6 py-3 text-[17px] text-ink no-underline"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <p className="mt-auto border-t border-line p-6 text-[13px] text-muted">
              Hotline 1900 6868 · 8:00 – 20:00
            </p>
          </div>
        </>
      )}
    </>
  );
}
