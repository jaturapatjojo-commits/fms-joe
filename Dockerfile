# Multi-stage Dockerfile for Next.js 16 (App Router + Turbopack + Standalone)
FROM node:22-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV AUTH_SECRET="temporary-secret-for-build-step-at-least-32-chars-long"
ENV APP_URL="http://localhost:3010"

RUN npx prisma generate
RUN npm run build

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache curl libc6-compat

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Persistent uploads directory
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3010/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]