#!/bin/bash
# ============================================================
# SYSTIC-CI — Script de démarrage développement
# Lancer depuis : systic-platform/
#   chmod +x start.sh && ./start.sh
# ============================================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "📦 SYSTIC-CI — Démarrage de l'environnement de développement"
echo "────────────────────────────────────────────────────────────"

# 1. Infrastructure (PostgreSQL + Redis via Docker)
echo ""
echo "🐳 Démarrage de PostgreSQL et Redis..."
docker compose -f docker-compose.dev.yml up -d

echo ""
echo "⏳ Attente que PostgreSQL soit prêt..."
until docker exec systic_pg_dev pg_isready -U systic_user -d systic_ci -q 2>/dev/null; do
  sleep 1
done
echo "✅ PostgreSQL prêt"

# 2. Migration Prisma (si nécessaire)
echo ""
echo "🗄️  Application des migrations Prisma..."
cd packages/database
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss 2>/dev/null || true
cd "$ROOT_DIR"

# 3. Instructions pour les terminaux manuels
echo ""
echo "────────────────────────────────────────────────────────────"
echo "✅ Infrastructure prête. Lance maintenant dans 2 terminaux :"
echo ""
echo "  Terminal 1 — API NestJS (port 4000) :"
echo "    cd apps/api && npm run dev"
echo ""
echo "  Terminal 2 — Frontend Next.js (port 3001) :"
echo "    cd apps/web && npm run dev"
echo ""
echo "  Ou tout en un (Turborepo) :"
echo "    npm run dev"
echo ""
echo "────────────────────────────────────────────────────────────"
