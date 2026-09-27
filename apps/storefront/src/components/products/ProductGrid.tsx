'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
  unit: string;
  stock: number;
  category?: { name: string };
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        Chưa có sản phẩm nào
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Link key={product.id} href={`/san-pham/${product.id}`}>
          <ProductCard product={product} />
        </Link>
      ))}
    </div>
  );
}
