const API_URL = process.env.API_URL || 'http://localhost:3000';

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: 'KG' | 'BUNDLE' | 'BOX' | 'FRUIT';
  stock: number;
  status: 'ACTIVE' | 'INACTIVE';
  imageUrl?: string;
  description?: string;
  categoryId: string;
  category?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getProducts(params: {
  page: number;
  limit: number;
  categoryId?: string;
  search?: string;
  priceRange?: 'UNDER_50K' | 'RANGE_50K_100K' | 'OVER_100K';
  inStock?: boolean;
}): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.search) searchParams.set('search', params.search);
  if (params.priceRange) searchParams.set('priceRange', params.priceRange);
  if (params.inStock) searchParams.set('inStock', 'true');

  const res = await fetch(`${API_URL}/products?${searchParams}`, {
    cache: 'no-store',
  });
  return res.json();
}

export async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function getCategories(): Promise<
  { id: string; name: string; _count: { products: number } }[]
> {
  const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
  return res.json();
}

export async function trackOrder(orderCode: string, phone: string) {
  const res = await fetch(
    `${API_URL}/orders/track/${orderCode}?phone=${phone}`,
    { cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

export async function createOrder(data: unknown) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
