# Farm Ecommerce Monorepo

Hệ thống thương mại điện tử bán nông sản với kiến trúc Monorepo sử dụng pnpm workspaces.

## Cấu trúc dự án

```
InterviewWeb/
├── apps/
│   ├── storefront/     # Next.js - Giao diện khách hàng
│   ├── admin/          # Next.js - Giao diện quản trị
│   └── api/            # NestJS - Backend API
├── packages/
│   ├── database/       # Prisma schema & client
│   ├── types/          # Shared TypeScript types & enums
│   └── config/         # Shared ESLint & TSConfig
├── docs/               # Tài liệu thiết kế
├── docker-compose.yml  # Docker orchestration
└── pnpm-workspace.yaml # Workspace config
```

## Yêu cầu hệ thống

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose

## Bắt đầu nhanh

### 1. Cài đặt dependencies

```bash
pnpm install
```

### 2. Khởi tạo Database

```bash
# Chạy PostgreSQL bằng Docker
docker compose up -d postgres

# Copy environment variables
cp .env.example .env

# Generate Prisma Client
pnpm db:generate

# Chạy migrations
pnpm db:migrate

# Seed dữ liệu mẫu
pnpm db:seed
```

### 3. Chạy development

```bash
# Chạy tất cả services
pnpm dev

# Hoặc chạy riêng lẻ
pnpm dev:api         # NestJS API (port 3000)
pnpm dev:storefront  # Next.js Storefront (port 3001)
pnpm dev:admin       # Next.js Admin (port 3002)
```

### 4. Truy cập ứng dụng

- **Storefront**: http://localhost:3001
- **Admin**: http://localhost:3002
- **API**: http://localhost:3000

## Scripts có sẵn

| Script | Mô tả |
|--------|-------|
| `pnpm dev` | Chạy tất cả services song song |
| `pnpm dev:api` | Chỉ chạy NestJS API |
| `pnpm dev:storefront` | Chỉ chạy Storefront |
| `pnpm dev:admin` | Chỉ chạy Admin |
| `pnpm build` | Build tất cả packages và apps |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:migrate` | Chạy database migrations |
| `pnpm db:push` | Push schema changes (dev only) |
| `pnpm db:seed` | Seed dữ liệu mẫu |
| `pnpm db:studio` | Mở Prisma Studio |
| `pnpm lint` | Lint toàn bộ codebase |

## Tài liệu thiết kế

- [Architecture](./docs/architecture.md)
- [Data Model](./docs/data-model.md)
- [Order State Machine](./docs/order-state-machine.md)
- [Specification](./docs/spec.md)
