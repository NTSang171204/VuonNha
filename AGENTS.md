# AGENTS.md

Vietnamese farm e-commerce monorepo (pnpm workspaces). API = NestJS, frontends = Next.js.

## Commands

```bash
pnpm install            # install all workspace deps
pnpm dev                # run all 3 apps in parallel
pnpm dev:api            # NestJS API on :3000
pnpm dev:storefront     # Next.js storefront on :3001
pnpm dev:admin          # Next.js admin on :3002

pnpm build              # packages first, then apps (order matters)
pnpm lint               # lint all packages recursively

pnpm db:generate        # prisma generate
pnpm db:migrate         # prisma migrate dev
pnpm db:push            # db push (dev only, no migration file)
pnpm db:seed            # seed sample data
pnpm db:studio          # Prisma Studio GUI
```

## Setup (Local PostgreSQL — no Docker)

1. Install PostgreSQL 16 locally and start the service
2. Create database: `createdb farm_ecommerce` (or use pgAdmin)
3. `cp .env.example .env` (root) — replace `<PASSWORD>` in `DATABASE_URL` with your local PostgreSQL password
4. `cp apps/api/.env.example apps/api/.env` — same password replacement
5. `pnpm install` (runs `prisma generate` via postinstall)
6. `pnpm db:migrate && pnpm db:seed`

## Structure

```
apps/
  api/          NestJS REST API (port 3000)
  storefront/   Next.js customer shop (port 3001) — Tailwind, Zustand cart
  admin/        Next.js admin dashboard (port 3002) — Ant Design, axios
packages/
  database/     Prisma schema + client (single source of truth for DB)
  types/        Shared TS enums, DTOs, order state machine — imported by all apps
  config/       Shared ESLint preset + tsconfig.base.json
```

All workspace packages use the `@farm/` prefix.

### API (`apps/api`)

Feature-module pattern: `src/modules/<name>/{module,controller,service}.ts`.
Modules: `auth`, `products`, `categories`, `orders`, `prisma`.
Auth: JWT (bcrypt + `@nestjs/jwt`). Guards: `JwtAuthGuard`, `RolesGuard`. Decorators: `@CurrentUser()`, `@Roles()`.
Global `ValidationPipe` with `whitelist: true, transform: true`.
CORS allows only `localhost:3001` and `localhost:3002`.

### Storefront (`apps/storefront`)

Vietnamese URL slugs: `/gio-hang`, `/thanh-toan`, `/san-pham/[id]`, `/tracking`.
Cart = Zustand + `persist` middleware (localStorage key `cart-storage`). No server cart.
API calls via `src/lib/api.ts` — plain `fetch` with `cache: 'no-store'`, `API_URL` env → backend.

### Admin (`apps/admin`)

Protected pages: `/dashboard`, `/san-pham`, `/don-hang`. Login at `/login` stores JWT in localStorage, attaches `Authorization: Bearer` on API calls.
API client in `src/lib/api.ts` (axios).

### Data model highlights

- `Order.userId` nullable — guests can order without account.
- `OrderItem` snapshots `productName` + `unitPrice` at order time (denormalized).
- Order flow: `PENDING → CONFIRMED → DELIVERING → COMPLETED` (or `PENDING → CANCELLED`).
- `Product.unit` is enum: `KG`, `BUNDLE`, `BOX`, `FRUIT`.
- `Product.price` is `Int` (VND, no float).
- Enums (`Role`, `OrderStatus`, `ProductStatus`) defined in both Prisma schema and `packages/types` — keep in sync.

## Gotchas

- **No tests exist** — no test files, no test scripts. Don't claim tests pass.
- **No `typecheck` script** — run `tsc --noEmit` in the relevant package/app.
- **No migrations committed** — `.gitignore` excludes `prisma/migrations/`. Each dev generates locally via `db:migrate`.
- **Build order matters** — `packages/*` must build before `apps/*` (the root `build` script handles this).
- **`@farm/types` is consumed as source** (`main: ./src/index.ts`), not built output — no build step needed for it.
- **Storefront and admin have different UI stacks** (Tailwind vs Ant Design) — don't share components between them.
- **Local PostgreSQL** — no Docker. Install PostgreSQL 16, create `farm_ecommerce` DB, set password in `.env`.

## Workflow

Mỗi tính năng được thực hiện theo flow:

```
DB → API → UI → Test
```

1. **DB** — Schema, migration, seed (nếu cần)
2. **API** — Endpoints, filters, validation, typecheck
3. **UI** — Components, pages, tích hợp API
4. **Test** — Typecheck, manual test, verify behavior

## Rules

### Secrets

NEVER read, modify, delete, rename, or expose `.env`, `.env.*`, or any file containing real credentials/keys/tokens. Do not print secrets in output, source, logs, docs, fixtures, or commits. Use `.env.example` to understand env vars. If a secret is needed, assume it exists in the environment — do not ask the user to paste it.

Never hard-code passwords, API keys, JWT secrets, OAuth credentials, private keys, or tokens. Use environment variables.

### Before changing code

1. Inspect relevant existing code and understand the architecture.
2. Identify affected files and check existing patterns/conventions.
3. Make the smallest reasonable change; reuse existing utilities; keep types strict.
4. Do not modify unrelated files, add unneeded dependencies, or rewrite working code without reason.

### Definition of done

A task is NOT complete until: implementation finished, relevant tests run (if any), type checking passed, linting passed, build passed, no regressions. If a verification cannot run, state what was not tested and why. Never claim untested work is verified.

### Database changes

Inspect current schema and migrations first. Make the smallest necessary change, generate/update the migration, run checks. Never destroy data or run destructive commands without explicit approval.

### Git safety

No `push --force`, `reset --hard`, branch deletion, or history rewriting without explicit instruction. Before committing: inspect `git diff` and `git status`, verify no secrets or unrelated files are included. Never commit `.env` files.

### Dependencies

Check whether an existing dependency already covers the need. Prefer existing deps. Explain why a new dep is needed. Do not randomly upgrade.

### Final response

Report: **Changed** (files + what was done), **Verification** (tests/typecheck/lint/build results), **Notes** (limitations, unverified items).
