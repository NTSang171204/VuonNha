import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/products/ProductDetail';
import { getProduct } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ProductDetail product={product} />
    </div>
  );
}
