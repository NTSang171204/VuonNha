'use client';

import { Product } from '@/lib/api';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-2 text-lg font-semibold">Không tìm thấy sản phẩm phù hợp</p>
        <p className="text-muted">Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-7 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
