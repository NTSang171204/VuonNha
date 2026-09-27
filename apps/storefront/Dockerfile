FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/storefront/package.json ./apps/storefront/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

COPY apps/storefront ./apps/storefront
COPY packages ./packages

RUN pnpm --filter @farm/storefront build

FROM node:20-alpine AS production
RUN corepack enable
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/storefront/.next ./apps/storefront/.next
COPY --from=base /app/apps/storefront/public ./apps/storefront/public

EXPOSE 3001

CMD ["pnpm", "--filter", "@farm/storefront", "start"]
