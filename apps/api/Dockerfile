# ============================================================
# SYSTIC-CI API — Dockerfile (Railway)
# Build context : monorepo root (systic-platform/)
# ============================================================

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl python3 make g++

# ── Builder (install + compile) ───────────────────────────────
FROM base AS builder
WORKDIR /app

# 1. Copier package.json et installer TOUTES les dépendances (dev inclus)
COPY apps/api/package.json ./
RUN npm install --legacy-peer-deps

# 2. Copier le code source + schema Prisma
COPY apps/api/ .
COPY packages/database/prisma ./prisma

# 3. Générer le client Prisma v6
RUN npx prisma@6 generate

# 4. Compiler TypeScript → dist/
RUN npm run build

# 5. Vérifier que dist/main.js existe
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found!" && ls -la dist/ && exit 1)

# ── Production ────────────────────────────────────────────────
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Copier uniquement ce qui est nécessaire pour l'exécution
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs \
 && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000
CMD ["node", "dist/main"]
