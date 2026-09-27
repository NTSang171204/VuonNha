FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

COPY apps/admin ./apps/admin
COPY packages ./packages

RUN pnpm --filter @farm/admin build

FROM node:20-alpine AS production
RUN corepack enable
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/admin/.next ./apps/admin/.next
COPY --from=base /App/apps/admin/public ./apps/admin/public

EXPOSE 3002

CMD ["pnpm", "--filter", "@farm/admin", "start"]
