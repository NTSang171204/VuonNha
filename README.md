# Farm Ecommerce Monorepo

Hệ thống thương mại điện tử bán nông sản với kiến trúc monorepo dùng pnpm workspaces.

## Cấu trúc dự án

```
InterviewWeb/
├── apps/
│   ├── storefront/     # Next.js - Giao diện khách hàng (port 3001)
│   ├── admin/          # Next.js - Giao diện quản trị (port 3002)
│   └── api/            # NestJS - Backend API (port 3000)
├── packages/
│   ├── database/       # Prisma schema & client
│   ├── types/          # Shared TypeScript types & enums
│   └── config/         # Shared ESLint & TSConfig
├── docs/               # Tài liệu thiết kế
└── pnpm-workspace.yaml
```

## Yêu cầu hệ thống

- Node.js >= 18
- pnpm >= 8 (`npm install -g pnpm`)
- Git
- PostgreSQL: chọn **một** trong hai
  - Local PostgreSQL 16, hoặc
  - Neon Postgres (cloud, không cần cài Postgres trên máy)

Docker **không bắt buộc**. Nếu muốn chạy Postgres bằng container, có thể dùng `docker compose up -d postgres` (xem `docker-compose.yml`).

## Setup máy mới

### 1. Clone và cài dependencies

```bash
git clone <url-repo>
cd InterviewWeb
pnpm install
```

### 2. Tạo file môi trường

Copy từ `.env.example` (không commit file `.env`):

```bash
# macOS / Linux / Git Bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/storefront/.env.example apps/storefront/.env
cp apps/admin/.env.example apps/admin/.env
```

PowerShell (Windows):

```powershell
Copy-Item .env.example .env
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/storefront/.env.example apps/storefront/.env
Copy-Item apps/admin/.env.example apps/admin/.env
```

Storefront và admin chỉ cần `API_URL` trỏ về `http://localhost:3000` (đã có trong example).

`DATABASE_URL` và `JWT_SECRET` cần chỉnh ở **root** `.env` và `apps/api/.env` (hai file nên giống nhau về `DATABASE_URL`).

### 3. Database (chọn A hoặc B)

#### A. Local PostgreSQL

1. Cài PostgreSQL 16, đảm bảo service đang chạy.
2. Tạo database `farm_ecommerce` (pgAdmin hoặc `createdb farm_ecommerce`).
3. Sửa `DATABASE_URL` trong `.env` và `apps/api/.env`:

```env
DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@localhost:5432/farm_ecommerce?schema=public"
```

#### B. Neon Postgres

1. Tạo project tại [https://console.neon.tech](https://console.neon.tech).
2. Lấy **Direct** connection string (URI), đảm bảo có `sslmode=require`.
3. Dán vào `DATABASE_URL` của `.env` và `apps/api/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"
```

Không cần cài Postgres trên máy khi dùng Neon.

### 4. Đồng bộ schema và seed

Repo không commit thư mục `prisma/migrations/`, nên máy mới dùng `db:push`:

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

Sau seed, tài khoản admin mẫu:

- Email: `admin@farm.com`
- Password: `admin123`

### 5. Chạy development

```bash
# Tất cả services
pnpm dev

# Hoặc từng service
pnpm dev:api         # NestJS API       -> http://localhost:3000
pnpm dev:storefront  # Storefront       -> http://localhost:3001
pnpm dev:admin       # Admin            -> http://localhost:3002
```

### 6. Truy cập ứng dụng

| App        | URL                      |
|------------|--------------------------|
| API        | http://localhost:3000    |
| Storefront | http://localhost:3001    |
| Admin      | http://localhost:3002    |

Đăng nhập Admin tại http://localhost:3002/login bằng tài khoản seed ở trên.

Kiểm tra DB bằng Prisma Studio (tùy chọn):

```bash
pnpm db:studio
```

## Scripts có sẵn

| Script | Mô tả |
|--------|--------|
| `pnpm dev` | Chạy tất cả services song song |
| `pnpm dev:api` | Chỉ chạy NestJS API |
| `pnpm dev:storefront` | Chỉ chạy Storefront |
| `pnpm dev:admin` | Chỉ chạy Admin |
| `pnpm build` | Build packages rồi mới tới apps |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Đồng bộ schema lên DB (bước chính cho máy mới) |
| `pnpm db:migrate` | Tạo/chạy migration local (không commit migrations) |
| `pnpm db:seed` | Seed dữ liệu mẫu |
| `pnpm db:studio` | Mở Prisma Studio |
| `pnpm lint` | Lint toàn bộ codebase |

## Tài liệu thiết kế

- [Architecture](./docs/architecture.md)
- [Data Model](./docs/data-model.md)
- [Order State Machine](./docs/order-state-machine.md)
- [Specification](./docs/spec.md)
