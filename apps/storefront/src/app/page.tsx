'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ProductGrid } from '@/components/products/ProductGrid';
import { FilterSidebar } from '@/components/products/FilterSidebar';
import { FilterDrawer } from '@/components/products/FilterDrawer';
import { Pagination } from '@/components/products/Pagination';
import { ActiveChips } from '@/components/products/ActiveChips';
import { SortDropdown } from '@/components/products/SortDropdown';
import { SearchBar } from '@/components/products/SearchBar';
import { getProducts, getCategories, Product } from '@/lib/api';
import { PriceRange } from '@farm/types';
import { SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'Tất cả sản phẩm', count: 0 },
  { id: 'rau-cu', name: 'Rau củ', count: 0 },
  { id: 'trai-cay', name: 'Trái cây', count: 0 },
  { id: 'dac-san-vung-mien', name: 'Đặc sản vùng miền', count: 0 },
];

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(CATEGORIES);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | 'any'>('any');
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState('featured');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [searchOpen, setSearchOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Đọc categoryId từ URL khi component mount
  useEffect(() => {
    const categoryId = searchParams.get('categoryId');
    if (categoryId && CATEGORIES.some((c) => c.id === categoryId)) {
      setSelectedCategory(categoryId);
    }
  }, [searchParams]);

  // Cập nhật URL khi selectedCategory thay đổi
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategory === 'all') {
      params.delete('categoryId');
    } else {
      params.set('categoryId', selectedCategory);
    }
    const newUrl = params.toString() ? `?${params.toString()}` : '/';
    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, searchParams, router]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        limit: number;
        categoryId?: string;
        search?: string;
        priceRange?: PriceRange;
        inStock?: boolean;
      } = { page, limit: 8 };

      if (selectedCategory !== 'all') params.categoryId = selectedCategory;
      if (search) params.search = search;
      if (selectedPrice !== 'any') params.priceRange = selectedPrice;
      if (inStock) params.inStock = true;

      const data = await getProducts(params);
      setProducts(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, search, selectedPrice, inStock]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === 'all') {
            return { ...cat, count: data.reduce((sum, c) => sum + c._count.products, 0) };
          }
          const found = data.find((c) => c.id === cat.id);
          return found ? { ...cat, count: found._count.products } : cat;
        }),
      );
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
    setSearchOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedPrice('any');
    setInStock(false);
    setSearch('');
    setPage(1);
  };

  const navItems = [
    { label: 'Tất cả sản phẩm', href: '/' },
    { label: 'Rau củ', href: '/?categoryId=rau-cu' },
    { label: 'Trái cây', href: '/?categoryId=trai-cay' },
    { label: 'Đặc sản vùng miền', href: '/?categoryId=dac-san-vung-mien' },
  ];

  const chips = [];
  if (selectedPrice !== 'any') {
    const labels: Record<string, string> = {
      UNDER_50K: 'Dưới 50.000₫',
      RANGE_50K_100K: '50.000₫ – 100.000₫',
      OVER_100K: 'Trên 100.000₫',
    };
    chips.push({
      label: labels[selectedPrice as string],
      onClear: () => setSelectedPrice('any'),
    });
  }
  if (inStock) {
    chips.push({ label: 'Còn hàng', onClear: () => setInStock(false) });
  }
  if (search) {
    chips.push({ label: `"${search}"`, onClear: () => setSearch('') });
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-primary py-2.5 text-center text-[13px] text-white">
        Miễn phí giao hàng cho đơn từ 300.000₫ tại TP.HCM
      </div>

      {searchOpen && (
        <div className="border-t border-line px-4 py-4 md:px-14">
          <SearchBar onSubmit={handleSearch} />
        </div>
      )}

      <main className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-14 md:pt-14">
        <h1 className="text-[clamp(28px,3.2vw,40px)] font-semibold tracking-tight">
          {search ? `Kết quả cho "${search}"` : 'Tất cả sản phẩm'}
        </h1>
        <p className="mt-3 max-w-[620px] text-muted">
          Nông sản thu hoạch trong tuần, giao trong ngày tại TP.HCM.
        </p>

        <div className="mt-6 flex items-center justify-between md:hidden">
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex h-11 items-center gap-2 border-0 bg-transparent text-[15px]"
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" />
            Lọc và sắp xếp
          </button>
          <span className="text-sm text-muted">{total} sản phẩm</span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="hidden md:block">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={(id) => {
                setSelectedCategory(id);
                setPage(1);
              }}
              selectedPrice={selectedPrice}
              onPriceChange={(value) => {
                setSelectedPrice(value);
                setPage(1);
              }}
              inStock={inStock}
              onInStockChange={(checked) => {
                setInStock(checked);
                setPage(1);
              }}
            />
          </div>

          <div className="min-w-0">
            <div className="mb-6 hidden items-center justify-between gap-4 md:flex">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-sm text-muted">{total} sản phẩm</span>
                <ActiveChips chips={chips} />
              </div>
              <SortDropdown
                value={sort}
                onChange={(value) => {
                  setSort(value);
                  setPage(1);
                }}
              />
            </div>

            {loading ? (
              <div className="py-16 text-center text-muted">Đang tải...</div>
            ) : (
              <>
                <ProductGrid products={products} />
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={(id) => {
          setSelectedCategory(id);
          setPage(1);
        }}
        selectedPrice={selectedPrice}
        onPriceChange={(value) => {
          setSelectedPrice(value);
          setPage(1);
        }}
        inStock={inStock}
        onInStockChange={(checked) => {
          setInStock(checked);
          setPage(1);
        }}
        sort={sort}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
        }}
        onClear={handleClearFilters}
        total={total}
      />

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
                ✕
              </button>
            </div>
            <nav aria-label="Danh mục" className="flex flex-col py-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[13] items-center px-6 py-3 text-[17px] text-ink no-underline"
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
    </div>
  );
}
