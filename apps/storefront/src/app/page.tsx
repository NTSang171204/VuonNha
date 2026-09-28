import { HomePageClient } from './HomePageClient';
import { getProducts, getCategories, Product } from '@/lib/api';
import { PriceRange } from '@farm/types';

const CATEGORIES = [
  { id: 'all', name: 'Tất cả sản phẩm', count: 0 },
  { id: 'rau-cu', name: 'Rau củ', count: 0 },
  { id: 'trai-cay', name: 'Trái cây', count: 0 },
  { id: 'dac-san-vung-mien', name: 'Đặc sản vùng miền', count: 0 },
];

export const revalidate = 60; // ISR: revalidate mỗi 60s

export default async function HomePage({
  searchParams,
}: {
  searchParams: { categoryId?: string };
}) {
  const categoryId = searchParams.categoryId;

  // Fetch products ở server
  const params: {
    page: number;
    limit: number;
    categoryId?: string;
  } = { page: 1, limit: 8 };

  if (categoryId && categoryId !== 'all') {
    params.categoryId = categoryId;
  }

  const [productsData, categoriesData] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  // Merge categories với counts
  const categories = CATEGORIES.map((cat) => {
    if (cat.id === 'all') {
      return { ...cat, count: categoriesData.reduce((sum, c) => sum + c._count.products, 0) };
    }
    const found = categoriesData.find((c) => c.id === cat.id);
    return found ? { ...cat, count: found._count.products } : cat;
  });

  return (
    <HomePageClient
      initialProducts={productsData.items}
      initialTotal={productsData.total}
      initialTotalPages={productsData.totalPages}
      initialCategories={categories}
    />
  );
}
