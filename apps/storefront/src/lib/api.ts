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

export interface Order {
  id: string;
  orderCode: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddressDetail: string;
  shippingProvince: string;
  totalAmount: number;
  status: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    subtotal: number;
  }>;
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as { message?: string | string[] }).message ||
      `Request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return data as T;
}

export async function getProducts(params: {
  page: number;
  limit: number;
  categoryId?: string;
  search?: string;
  priceRange?: 'UNDER_50K' | 'RANGE_50K_100K' | 'OVER_100K';
  inStock?: boolean;
  sort?: string;
}): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    status: 'ACTIVE',
  });
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.search) searchParams.set('search', params.search);
  if (params.priceRange) searchParams.set('priceRange', params.priceRange);
  if (params.inStock) searchParams.set('inStock', 'true');
  if (params.sort) searchParams.set('sort', params.sort);

  const res = await fetch(`${API_URL}/products?${searchParams}`, {
    cache: 'no-store',
  });
  return parseJson<PaginatedResponse<Product>>(res);
}

export async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export async function getCategories(): Promise<
  { id: string; name: string; _count: { products: number } }[]
> {
  const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
  return parseJson(res);
}

export async function trackOrder(
  orderCode: string,
  phone: string,
): Promise<Order | null> {
  const res = await fetch(
    `${API_URL}/orders/track/${encodeURIComponent(orderCode)}?phone=${encodeURIComponent(phone)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

export async function createOrder(data: unknown): Promise<Order> {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJson<Order>(res);
}

export async function validateOrder(
  items: { productId: string; quantity: number }[],
  shippingProvince?: string,
) {
  const res = await fetch(`${API_URL}/orders/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, shippingProvince }),
  });
  return parseJson(res);
}
