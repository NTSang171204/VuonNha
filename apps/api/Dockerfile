FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Build
RUN pnpm --filter @farm/api build

# Production
FROM node:20-alpine AS production
RUN corepack enable
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/packages/database/dist ./packages/database/dist
COPY --from=base /app/packages/types/dist ./packages/types/dist

EXPOSE 3000

CMD ["node", "apps/api/dist/main.js"]
