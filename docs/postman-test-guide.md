# API Test Guide — Postman

**Base URL:** `http://localhost:3000`

---

## 1. Auth

### POST `/auth/login` — Đăng nhập

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@farm.com",
  "password": "admin123"
}
```

**Expected Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@farm.com",
    "role": "ADMIN"
  }
}
```

> **Lưu ý:** Copy `accessToken` từ response và dùng cho các API cần auth.

---

## 2. Categories

### GET `/categories` — Lấy tất cả danh mục

**Headers:** Không cần auth

**Expected Response (200):**
```json
[
  {
    "id": "rau-cu",
    "name": "Rau Củ",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": { "products": 8 }
  }
]
```

### GET `/categories/:id` — Lấy danh mục theo ID

**Example:** `GET /categories/rau-cu`

**Expected Response (200):**
```json
{
  "id": "rau-cu",
  "name": "Rau Củ",
  "products": [...]
}
```

### POST `/categories` — Tạo danh mục mới

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body:**
```json
{
  "name": "Danh mục mới"
}
```

### PUT `/categories/:id` — Cập nhật danh mục

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body:**
```json
{
  "name": "Tên mới"
}
```

### DELETE `/categories/:id` — Xóa danh mục

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

---

## 3. Products

### GET `/products` — Lấy danh sách sản phẩm

**Query Params (optional):**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Trang (default: 1) |
| `limit` | number | Số lượng/trang (default: 8) |
| `categoryId` | string | Lọc theo danh mục |
| `search` | string | Tìm kiếm theo tên |
| `status` | string | `ACTIVE` / `INACTIVE` |
| `priceRange` | string | `UNDER_50K` / `RANGE_50K_100K` / `OVER_100K` |
| `inStock` | string | `true` để chỉ hiện còn hàng |

**Examples:**
```
GET /products
GET /products?page=1&limit=20
GET /products?categoryId=rau-cu
GET /products?search=cà chua
GET /products?priceRange=UNDER_50K
GET /products?inStock=true
```

**Expected Response (200):**
```json
{
  "items": [
    {
      "id": "ca-chua",
      "name": "Cà chua",
      "price": 15000,
      "unit": "KG",
      "stock": 100,
      "status": "ACTIVE",
      "category": { "id": "rau-cu", "name": "Rau Củ" }
    }
  ],
  "total": 21,
  "page": 1,
  "limit": 8,
  "totalPages": 3
}
```

### GET `/products/:id` — Lấy sản phẩm theo ID

**Example:** `GET /products/ca-chua`

### POST `/products` — Tạo sản phẩm mới

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body:**
```json
{
  "categoryId": "rau-cu",
  "name": "Bắp cải",
  "price": 20000,
  "unit": "KG",
  "stock": 50,
  "description": "Bắp cải tươi",
  "imageUrl": "https://example.com/image.jpg"
}
```

### PUT `/products/:id` — Cập nhật sản phẩm

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body (partial — chỉ gửi field cần đổi):**
```json
{
  "price": 25000,
  "stock": 30
}
```

### DELETE `/products/:id` — Xóa sản phẩm (soft delete → status = INACTIVE)

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

---

## 4. Orders

### GET `/orders` — Lấy danh sách đơn hàng (ADMIN only)

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Query Params (optional):**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Trang (default: 1) |
| `limit` | number | Số lượng/trang (default: 20) |
| `status` | string | `PENDING` / `CONFIRMED` / `DELIVERING` / `COMPLETED` / `CANCELLED` |
| `search` | string | Tìm theo tên/số điện thoại người nhận |

**Expected Response (200):**
```json
{
  "items": [
    {
      "id": "...",
      "recipientName": "Nguyễn Văn A",
      "recipientPhone": "0901234567",
      "totalAmount": 45000,
      "status": "PENDING",
      "items": [...],
      "user": { "name": "...", "email": "..." }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### GET `/orders/:id` — Lấy đơn hàng theo ID (ADMIN only)

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

### GET `/orders/track/:orderCode?phone=...` — Tra cứu đơn hàng (public)

**Example:** `GET /orders/track/abc123?phone=0901234567`

**Expected Response (200):**
```json
{
  "id": "abc123",
  "recipientName": "Nguyễn Văn A",
  "status": "DELIVERING",
  "items": [...]
}
```

### POST `/orders` — Tạo đơn hàng (public — guest checkout)

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "recipientName": "Nguyễn Văn A",
  "recipientPhone": "0901234567",
  "shippingAddressDetail": "123 Đường ABC",
  "shippingProvince": "Hồ Chí Minh",
  "shippingNote": "Giao giờ hành chính",
  "deliveryDate": "2024-01-15",
  "deliveryTimeSlot": "08:00-12:00",
  "paymentMethod": "COD",
  "items": [
    {
      "productId": "ca-chua",
      "quantity": 2
    },
    {
      "productId": "xa-lach",
      "quantity": 1
    }
  ]
}
```

**Expected Response (201):**
```json
{
  "id": "...",
  "totalAmount": 42000,
  "status": "PENDING",
  "items": [...]
}
```

### PUT `/orders/:id/status` — Cập nhật trạng thái đơn hàng (ADMIN only)

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{accessToken}}
```

**Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Valid transitions:**
- `PENDING` → `CONFIRMED` hoặc `CANCELLED`
- `CONFIRMED` → `DELIVERING`
- `DELIVERING` → `COMPLETED`

### PUT `/orders/:id/cancel` — Hủy đơn hàng (ADMIN only)

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Condition:** Chỉ hủy được đơn ở trạng thái `PENDING`. Hủy sẽ restore stock.

---

## Postman Collection Setup

### Biến môi trường (Environment Variables)

| Variable | Value |
|----------|-------|
| `baseUrl` | `http://localhost:3000` |
| `accessToken` | *(tự động set sau khi login)* |

### Auto-set token sau login

Trong **Tests** tab của request `POST /auth/login`, thêm:

```javascript
const json = pm.response.json();
pm.environment.set("accessToken", json.accessToken);
```

---

## Seed Data

| Entity | ID | Notes |
|--------|-----|-------|
| Admin user | `admin@farm.com` | Role: ADMIN |
| Category | `rau-cu` | Rau Củ (8 products) |
| Category | `trai-cay` | Trái Cây (7 products) |
| Category | `dac-san-vung-mien` | Đặc Sản Vùng Miền (6 products) |
| Product | `ca-chua` | Cà chua — 15,000đ/kg |
| Product | `sau-rieng` | Sầu riêng — 120,000đ/trái |

---

## Lưu ý quan trọng

1. **Seed password không hợp lệ:** File `seed.ts` dùng `$2b$10$placeholderhash` — đây không phải bcrypt hash thật. Bạn cần tạo user admin thủ công hoặc sửa seed để login được.
2. **Cần auth:** Tất cả endpoints products (POST/PUT/DELETE), orders (GET/PUT) đều cần `Authorization: Bearer {{accessToken}}`.
3. **Public endpoints:** `GET /products`, `GET /categories`, `POST /orders`, `GET /orders/track/:code` không cần auth.
