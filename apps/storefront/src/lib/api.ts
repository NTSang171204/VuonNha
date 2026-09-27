const API_URL = process.env.API_URL || 'http://localhost:3000';

export async function getProducts(params: {
  page: number;
  limit: number;
  categoryId?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.search) searchParams.set('search', params.search);

  const res = await fetch(`${API_URL}/products?${searchParams}`, {
    cache: 'no-store',
  });
  return res.json();
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function getCategories() {
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
