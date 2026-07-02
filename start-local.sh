#!/usr/bin/env bash
# ============================================================
# SYSTIC-CI — Démarrage local
# Usage : ./start-local.sh [web-only|all|infra|api|stop]
# ============================================================
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
WEB="$ROOT/apps/web"
API="$ROOT/apps/api"
DB="$ROOT/packages/database"

GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BOLD="\033[1m"
NC="\033[0m"

log()  { echo -e "${BLUE}[SYSTIC]${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }
info() { echo -e "${BOLD}$1${NC}"; }

# ── Check Node.js uniquement ──────────────────────────────────
check_node() {
  command -v node >/dev/null 2>&1 || err "Node.js non trouvé. Installez Node 20+ : https://nodejs.org"
  command -v npm  >/dev/null 2>&1 || err "npm non trouvé."
  NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  [ "$NODE_VER" -ge 18 ] || err "Node.js 18+ requis (actuel: $(node -v))"
  ok "Node $(node -v) · npm $(npm -v)"
}

# ── Check Docker (optionnel) ──────────────────────────────────
has_docker() {
  command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

# ── Installation des dépendances ─────────────────────────────
install_deps() {
  if [ ! -d "$WEB/node_modules" ]; then
    log "Installation des dépendances (première fois — 2-3 min)..."
    # Installer seulement le web si pas de turbo/root modules
    cd "$WEB" && npm install --legacy-peer-deps
    ok "Dépendances frontend installées"
  else
    ok "Dépendances déjà installées"
  fi
}

install_api_deps() {
  if [ ! -d "$API/node_modules" ]; then
    log "Installation des dépendances API..."
    cd "$API" && npm install --legacy-peer-deps
    ok "Dépendances API installées"
  fi
  if [ ! -d "$DB/node_modules" ]; then
    log "Installation des dépendances database..."
    cd "$DB" && npm install
    ok "Dépendances database installées"
  fi
}

# ── Infrastructure via Docker ─────────────────────────────────
start_infra_docker() {
  log "Démarrage Postgres + Redis via Docker..."
  docker compose -f "$ROOT/docker-compose.dev.yml" up -d
  log "Attente Postgres..."
  for i in $(seq 1 30); do
    docker exec systic_pg_dev pg_isready -U systic_user -d systic_ci >/dev/null 2>&1 && break
    sleep 1
  done
  ok "Postgres :5432 · Redis :6379 · Adminer : http://localhost:8080"
}

# ── Infrastructure via Homebrew (si pas Docker) ───────────────
start_infra_brew() {
  command -v brew >/dev/null 2>&1 || err "Homebrew non trouvé. Installez-le : https://brew.sh"

  # PostgreSQL
  if ! brew services list | grep -q "postgresql.*started"; then
    log "Démarrage PostgreSQL via Homebrew..."
    brew services start postgresql@16 2>/dev/null || brew services start postgresql 2>/dev/null || true
    sleep 3
    # Créer la base si elle n'existe pas
    createdb systic_ci 2>/dev/null || true
    createuser -s systic_user 2>/dev/null || true
    psql -c "ALTER USER systic_user WITH PASSWORD 'systic_pass_dev';" 2>/dev/null || true
    ok "PostgreSQL démarré"
  else
    ok "PostgreSQL déjà actif"
  fi

  # Redis
  if ! brew services list | grep -q "redis.*started"; then
    log "Démarrage Redis via Homebrew..."
    brew install redis 2>/dev/null || true
    brew services start redis
    ok "Redis démarré"
  else
    ok "Redis déjà actif"
  fi
}

# ── Setup base de données ─────────────────────────────────────
setup_db() {
  log "Génération du client Prisma..."
  cd "$DB" && npx prisma generate

  log "Création/mise à jour du schéma BDD..."
  DATABASE_URL="postgresql://systic_user:systic_pass_dev@localhost:5432/systic_ci?schema=public" \
    npx prisma db push --accept-data-loss 2>&1 | tail -5

  log "Injection des données de démo..."
  DATABASE_URL="postgresql://systic_user:systic_pass_dev@localhost:5432/systic_ci?schema=public" \
    npx ts-node --transpile-only prisma/seed.ts \
    && ok "Données de démo injectées" \
    || warn "Seed ignoré (données déjà présentes ou erreur)"
}

# ── Frontend Next.js ──────────────────────────────────────────
start_web() {
  log "Démarrage du frontend Next.js → http://localhost:3000"
  cd "$WEB" && npm run dev
}

# ── Backend NestJS ────────────────────────────────────────────
start_api() {
  log "Démarrage de l'API NestJS → http://localhost:4000"
  cd "$API" && npm run dev
}

# ── Arrêt Docker ─────────────────────────────────────────────
stop_all() {
  if has_docker; then
    log "Arrêt Docker..."
    docker compose -f "$ROOT/docker-compose.dev.yml" down
    ok "Arrêté"
  else
    warn "Arrêtez PostgreSQL/Redis manuellement : brew services stop postgresql redis"
  fi
}

# ══════════════════════════════════════════════════════════════
MODE="${1:-web-only}"

case "$MODE" in

  # ── MODE RAPIDE : uniquement le frontend (sans BDD ni API) ──
  web-only)
    check_node
    install_deps

    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   SYSTIC-CI — Frontend seul (mode rapide)        ║${NC}"
    echo -e "${GREEN}╠═══════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║   → http://localhost:3000                         ║${NC}"
    echo -e "${GREEN}║   L'API n'est pas lancée — données en attente     ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""
    start_web
    ;;

  # ── MODE INFRA DOCKER ────────────────────────────────────────
  infra)
    has_docker || err "Docker non trouvé/démarré. Installez Docker Desktop : https://docker.com"
    start_infra_docker
    ;;

  # ── MODE INFRA HOMEBREW (sans Docker) ────────────────────────
  infra-brew)
    start_infra_brew
    ;;

  # ── MODE API SEULE ────────────────────────────────────────────
  api)
    check_node
    install_api_deps
    setup_db
    start_api
    ;;

  # ── MODE COMPLET avec Docker ──────────────────────────────────
  all)
    check_node
    install_deps
    install_api_deps

    if has_docker; then
      start_infra_docker
    else
      warn "Docker non disponible → tentative via Homebrew..."
      start_infra_brew
    fi

    setup_db

    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         SYSTIC-CI — Infrastructure prête !          ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Ouvrez 2 terminaux et lancez :                     ║${NC}"
    echo -e "${GREEN}║  → ./start-local.sh api   (Terminal 2)             ║${NC}"
    echo -e "${GREEN}║  → ./start-local.sh web-only  (Terminal 3)         ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Comptes démo (mdp: Test@Systic2024!) :             ║${NC}"
    echo -e "${GREEN}║  admin@systic.ci · client@systic.ci · tech@systic.ci║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
    ;;

  stop)
    stop_all
    ;;

  *)
    echo "Usage: ./start-local.sh [web-only|all|infra|infra-brew|api|stop]"
    echo ""
    echo "  web-only   → Frontend uniquement (sans Docker, sans API) — DÉMARRAGE RAPIDE"
    echo "  all        → Tout (infra + BDD + seed) — nécessite Docker ou Homebrew"
    echo "  infra      → Postgres + Redis via Docker uniquement"
    echo "  infra-brew → Postgres + Redis via Homebrew (sans Docker)"
    echo "  api        → Backend NestJS uniquement"
    echo "  stop       → Arrêter l'infrastructure Docker"
    exit 1
    ;;
esac
