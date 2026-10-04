import { Suspense } from 'react';
import { HomePageClient } from './HomePageClient';
import { getProducts, getCategories } from '@/lib/api';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';

const CATEGORIES = [
  { id: 'all', name: 'Tất cả sản phẩm', count: 0 },
  { id: 'rau-cu', name: 'Rau củ', count: 0 },
  { id: 'trai-cay', name: 'Trái cây', count: 0 },
  { id: 'dac-san-vung-mien', name: 'Đặc sản vùng miền', count: 0 },
];

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: {
    categoryId?: string;
    search?: string;
    priceRange?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  };
}) {
  const categoryId = searchParams.categoryId;
  const page = Math.max(1, Number(searchParams.page || '1') || 1);

  const params: {
    page: number;
    limit: number;
    categoryId?: string;
    search?: string;
    priceRange?: 'UNDER_50K' | 'RANGE_50K_100K' | 'OVER_100K';
    inStock?: boolean;
    sort?: string;
  } = {
    page,
    limit: 8,
    sort: searchParams.sort || 'featured',
  };

  if (categoryId && categoryId !== 'all') params.categoryId = categoryId;
  if (searchParams.search) params.search = searchParams.search;
  if (
    searchParams.priceRange === 'UNDER_50K' ||
    searchParams.priceRange === 'RANGE_50K_100K' ||
    searchParams.priceRange === 'OVER_100K'
  ) {
    params.priceRange = searchParams.priceRange;
  }
  if (searchParams.inStock === 'true') params.inStock = true;

  let productsData = {
    items: [] as Awaited<ReturnType<typeof getProducts>>['items'],
    total: 0,
    totalPages: 0,
  };
  let categoriesData: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [productsData, categoriesData] = await Promise.all([
      getProducts(params),
      getCategories(),
    ]);
  } catch (err) {
    console.error('Failed to load homepage data:', err);
  }

  const categories = CATEGORIES.map((cat) => {
    if (cat.id === 'all') {
      return {
        ...cat,
        count: categoriesData.reduce((sum, c) => sum + c._count.products, 0),
      };
    }
    const found = categoriesData.find((c) => c.id === cat.id);
    return found ? { ...cat, count: found._count.products } : cat;
  });

  return (
    <Suspense fallback={<ProductSkeleton />}>
      <HomePageClient
        initialProducts={productsData.items}
        initialTotal={productsData.total}
        initialTotalPages={productsData.totalPages}
        initialCategories={categories}
      />
    </Suspense>
  );
}
