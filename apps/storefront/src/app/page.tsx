import { ProductGrid } from '@/components/products/ProductGrid';
import { getProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { items: products } = await getProducts({ page: 1, limit: 12 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 p-12 text-white">
        <h1 className="mb-4 text-4xl font-bold">Nông Sản Tươi Sạch</h1>
        <p className="text-lg opacity-90">
          Trực tiếp từ nông trại đến bàn ăn của bạn. Tươi ngon, an toàn, giá tốt.
        </p>
      </section>

      {/* Products */}
      <section>
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Sản phẩm mới nhất</h2>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
