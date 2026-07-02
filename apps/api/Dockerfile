# ============================================================
# SYSTIC-CI API — Dockerfile multi-stage (Railway / Render)
# Build context : monorepo root (systic-platform/)
# ============================================================

# ── 1. Base ──────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# ── 2. Dependencies ──────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY apps/api/package.json apps/api/package-lock.json* ./
RUN npm install --legacy-peer-deps

# ── 3. Builder ───────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/api/ .
COPY packages/database/prisma ./prisma
# Générer le client Prisma puis compiler
RUN npx prisma generate
RUN npm run build

# ── 4. Production ────────────────────────────────────────────
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs \
 && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000
# Synchronise le schéma Prisma puis démarre l'API
CMD ["sh", "-c", "npx prisma@6 db push --skip-generate --accept-data-loss && node dist/main"]
