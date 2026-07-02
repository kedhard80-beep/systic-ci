#!/usr/bin/env bash
# ============================================================
# SYSTIC-CI — Démarrage en MODE PRODUCTION LOCAL
# Beaucoup plus rapide que "npm run dev"
# Utiliser pour les démonstrations / présentations
# ============================================================
set -e

cd "$(dirname "$0")"
ROOT=$(pwd)

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  SYSTIC-CI — Build Production Local         ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# 1. Variables d'environnement
export NODE_ENV=production
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:4000}"

# 2. Build du frontend Next.js
echo "▶ Build du frontend Next.js..."
cd "$ROOT/apps/web"
npm run build

echo ""
echo "✅ Build terminé. Démarrage des services..."
echo ""

# 3. Démarrer l'API en arrière-plan
echo "▶ Démarrage de l'API (port 4000)..."
cd "$ROOT/apps/api"
npm run start:prod &
API_PID=$!
sleep 3

# 4. Démarrer le frontend
echo "▶ Démarrage du frontend Next.js (port 3000)..."
cd "$ROOT/apps/web"
npm run start &
WEB_PID=$!

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  ✅  SYSTIC-CI est en ligne !               ║"
echo "║                                              ║"
echo "║  🌐  Site web   : http://localhost:3000      ║"
echo "║  ⚙️   API        : http://localhost:4000      ║"
echo "║  📚  Swagger    : http://localhost:4000/docs ║"
echo "║                                              ║"
echo "║  Login admin :                               ║"
echo "║    admin@systic.ci / Admin@Systic2024!       ║"
echo "║                                              ║"
echo "║  Ctrl+C pour arrêter                         ║"
echo "╚══════════════════════════════════════════════╝"

# Attendre et arrêter proprement
trap "kill $API_PID $WEB_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
