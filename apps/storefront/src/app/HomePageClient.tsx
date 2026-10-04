'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductGrid } from '@/components/products/ProductGrid';
import { FilterSidebar } from '@/components/products/FilterSidebar';
import { FilterDrawer } from '@/components/products/FilterDrawer';
import { Pagination } from '@/components/products/Pagination';
import { ActiveChips } from '@/components/products/ActiveChips';
import { SortDropdown } from '@/components/products/SortDropdown';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { getProducts, getCategories, Product } from '@/lib/api';
import { PriceRange } from '@farm/types';
import { SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'Tất cả sản phẩm', count: 0 },
  { id: 'rau-cu', name: 'Rau củ', count: 0 },
  { id: 'trai-cay', name: 'Trái cây', count: 0 },
  { id: 'dac-san-vung-mien', name: 'Đặc sản vùng miền', count: 0 },
];

interface Props {
  initialProducts: Product[];
  initialTotal: number;
  initialTotalPages: number;
  initialCategories: typeof CATEGORIES;
}

export function HomePageClient({
  initialProducts,
  initialTotal,
  initialTotalPages,
  initialCategories,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedCategory = searchParams.get('categoryId') || 'all';
  const search = searchParams.get('search') || '';
  const selectedPrice =
    (searchParams.get('priceRange') as PriceRange | null) || 'any';
  const inStock = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || 'featured';
  const page = Math.max(1, Number(searchParams.get('page') || '1') || 1);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const skipFirstFetch = useRef(true);

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        const shouldDelete =
          value === null ||
          value === '' ||
          (key === 'categoryId' && value === 'all') ||
          (key === 'priceRange' && value === 'any') ||
          (key === 'sort' && value === 'featured') ||
          (key === 'page' && value === '1') ||
          (key === 'inStock' && value !== 'true');
        if (shouldDelete) params.delete(key);
        else params.set(key, value as string);
      });
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '/', { scroll: false });
    },
    [router, searchParams],
  );

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
        sort?: string;
      } = { page, limit: 8, sort };

      if (selectedCategory !== 'all') params.categoryId = selectedCategory;
      if (search) params.search = search;
      if (selectedPrice !== 'any') params.priceRange = selectedPrice;
      if (inStock) params.inStock = true;

      const data = await getProducts(params);
      setProducts(data.items ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, search, selectedPrice, inStock, sort]);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories((prev) =>
          prev.map((cat) => {
            if (cat.id === 'all') {
              return {
                ...cat,
                count: data.reduce((sum, c) => sum + c._count.products, 0),
              };
            }
            const found = data.find((c) => c.id === cat.id);
            return found ? { ...cat, count: found._count.products } : cat;
          }),
        );
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  const handleClearFilters = () => {
    router.replace('/', { scroll: false });
  };

  const chips: { label: string; onClear: () => void }[] = [];
  if (selectedPrice !== 'any') {
    const labels: Record<string, string> = {
      UNDER_50K: 'Dưới 50.000₫',
      RANGE_50K_100K: '50.000₫ - 100.000₫',
      OVER_100K: 'Trên 100.000₫',
    };
    chips.push({
      label: labels[selectedPrice as string],
      onClear: () => updateParams({ priceRange: null, page: '1' }),
    });
  }
  if (inStock) {
    chips.push({
      label: 'Còn hàng',
      onClear: () => updateParams({ inStock: null, page: '1' }),
    });
  }
  if (search) {
    chips.push({
      label: `"${search}"`,
      onClear: () => updateParams({ search: null, page: '1' }),
    });
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-primary py-2.5 text-center text-[13px] text-white">
        Miễn phí giao hàng cho đơn từ 300.000₫ tại TP.HCM
      </div>

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
              onCategoryChange={(id) =>
                updateParams({ categoryId: id, page: '1' })
              }
              selectedPrice={selectedPrice}
              onPriceChange={(value) =>
                updateParams({ priceRange: value, page: '1' })
              }
              inStock={inStock}
              onInStockChange={(checked) =>
                updateParams({ inStock: checked ? 'true' : null, page: '1' })
              }
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
                onChange={(value) => updateParams({ sort: value, page: '1' })}
              />
            </div>

            {loading ? (
              <ProductSkeleton />
            ) : (
              <>
                <ProductGrid products={products} />
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(next) => updateParams({ page: String(next) })}
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
        onCategoryChange={(id) => updateParams({ categoryId: id, page: '1' })}
        selectedPrice={selectedPrice}
        onPriceChange={(value) =>
          updateParams({ priceRange: value, page: '1' })
        }
        inStock={inStock}
        onInStockChange={(checked) =>
          updateParams({ inStock: checked ? 'true' : null, page: '1' })
        }
        sort={sort}
        onSortChange={(value) => updateParams({ sort: value, page: '1' })}
        onClear={handleClearFilters}
        total={total}
      />
    </div>
  );
}
