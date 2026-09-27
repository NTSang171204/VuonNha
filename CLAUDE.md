# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Install dependencies
pnpm install

# Run all services in parallel
pnpm dev

# Run individual services
pnpm dev:api         # NestJS API on port 3000
pnpm dev:storefront  # Next.js Storefront on port 3001
pnpm dev:admin       # Next.js Admin on port 3002
```

### Database

```bash
docker compose up -d postgres  # Start PostgreSQL
cp .env.example .env           # Set up env vars

pnpm db:generate  # Generate Prisma Client
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed sample data
pnpm db:push      # Push schema without migration (dev only)
pnpm db:studio    # Open Prisma Studio GUI
```

### Build & Lint

```bash
pnpm build  # Build packages first, then apps (order matters)
pnpm lint   # Lint entire codebase
```

## Architecture

**Monorepo** managed with `pnpm workspaces`. All package names are prefixed `@farm/`.

### Apps

| App | Tech | Port | Purpose |
|-----|------|------|---------|
| `apps/api` | NestJS | 3000 | REST API backend |
| `apps/storefront` | Next.js | 3001 | Customer-facing shop |
| `apps/admin` | Next.js | 3002 | Admin dashboard |

### Shared Packages

| Package | Contents |
|---------|----------|
| `packages/database` | Prisma schema, migrations, seed script — the single source of truth for DB |
| `packages/types` | Shared TypeScript types and enums (DTOs, `Role`, `OrderStatus`, etc.) imported by both API and frontends |
| `packages/config` | Shared ESLint preset and `tsconfig.base.json` |

### API Structure (`apps/api`)

NestJS feature-module pattern. Each domain lives in `src/modules/<name>/` with its own `module`, `controller`, and `service`. Current modules:

- `auth` — JWT login (bcrypt + `@nestjs/jwt`). Guards: `JwtAuthGuard`, `RolesGuard`. Decorators: `@CurrentUser()`, `@Roles()`.
- `products` — CRUD with stock management; `ProductStatus` ACTIVE/INACTIVE.
- `categories` — Simple category management.
- `orders` — Create order (validates stock, deducts inventory), update status, public order tracking by code + phone.
- `prisma` — Global `PrismaService` wrapper.

### Storefront (`apps/storefront`)

Next.js App Router with Vietnamese URL slugs (`/gio-hang`, `/thanh-toan`, `/san-pham/[id]`, `/tracking`).

- **Cart state**: Zustand store with `persist` middleware (localStorage key `cart-storage`). No server-side cart.
- **API calls**: `apps/storefront/src/lib/api.ts` — plain `fetch` with `cache: 'no-store'`. `API_URL` env var points to the NestJS backend.

### Admin (`apps/admin`)

Next.js App Router. Protected pages under `/dashboard`, `/san-pham`, `/don-hang`. Login page at `/login` stores JWT in localStorage and attaches it as `Authorization: Bearer` on admin API calls.

### Data Model Highlights

- `Order.userId` is nullable — guests can place orders without an account.
- `OrderItem` snapshots `productName` and `unitPrice` at order time (denormalized).
- Order flow: `PENDING → CONFIRMED → DELIVERING → COMPLETED` (also `PENDING → CANCELLED`).
- `Product.unit` is a free-text string (e.g., "kg", "bó").

## Environment Variables

Each app has its own `.env.example`. The root `.env` is used by `packages/database` for `DATABASE_URL`. Copy `.env.example → .env` at both the root and inside `apps/api/` before starting.
