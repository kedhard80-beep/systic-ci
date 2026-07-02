#!/usr/bin/env bash
# ============================================================
# SYSTIC-CI — Installation complète + démarrage
# Lance ce script une seule fois : il installe tout et démarre
# ============================================================
set -e

GREEN="\033[0;32m"; BLUE="\033[0;34m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; NC="\033[0m"
log()  { echo -e "${BLUE}[SYSTIC]${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     SYSTIC-CI — Installation automatique             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Homebrew ──────────────────────────────────────────────
if ! command -v brew >/dev/null 2>&1; then
  log "Installation de Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Ajouter brew au PATH (Apple Silicon)
  if [ -f /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  fi
  ok "Homebrew installé"
else
  ok "Homebrew $(brew --version | head -1)"
fi

# S'assurer que brew est dans le PATH
if [ -f /opt/homebrew/bin/brew ]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi

# ── 2. Docker Desktop ────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1 && [ ! -d "/Applications/Docker.app" ]; then
  log "Installation de Docker Desktop (Apple Silicon)..."
  brew install --cask docker
  ok "Docker Desktop installé"
else
  ok "Docker déjà présent"
fi

# ── 3. Démarrer Docker Desktop ───────────────────────────────
if ! docker info >/dev/null 2>&1; then
  log "Démarrage de Docker Desktop..."
  open -a Docker
  log "Attente que Docker soit prêt (30-60 secondes)..."
  for i in $(seq 1 60); do
    docker info >/dev/null 2>&1 && break
    printf "."
    sleep 2
  done
  echo ""
  docker info >/dev/null 2>&1 || err "Docker n'a pas démarré. Ouvrez Docker Desktop manuellement et relancez ce script."
  ok "Docker prêt"
else
  ok "Docker déjà actif"
fi

# ── 4. Node.js ───────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
  log "Installation de Node.js 20 LTS..."
  brew install node@20
  echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zprofile
  export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
  ok "Node.js installé"
else
  ok "Node $(node -v)"
fi

# ── 5. Infrastructure (Postgres + Redis) ─────────────────────
log "Démarrage de Postgres + Redis..."
docker compose -f "$ROOT/docker-compose.dev.yml" up -d
log "Attente que Postgres soit prêt..."
for i in $(seq 1 30); do
  docker exec systic_pg_dev pg_isready -U systic_user -d systic_ci >/dev/null 2>&1 && break
  sleep 1
done
ok "Postgres :5432 · Redis :6379 · Adminer : http://localhost:8080"

# ── 6. Dépendances npm ───────────────────────────────────────
log "Installation des dépendances npm..."
cd "$ROOT/apps/web" && npm install --legacy-peer-deps --silent
ok "Dépendances frontend OK"

cd "$ROOT/apps/api" && npm install --legacy-peer-deps --silent
ok "Dépendances API OK"

cd "$ROOT/packages/database" && npm install --silent
ok "Dépendances database OK"

# ── 7. Prisma : schéma + seed ────────────────────────────────
log "Initialisation de la base de données..."
cd "$ROOT/packages/database"
npx prisma generate
DATABASE_URL="postgresql://systic_user:systic_pass_dev@localhost:5432/systic_ci?schema=public" \
  npx prisma db push --accept-data-loss 2>&1 | tail -3

log "Injection des données de démo..."
DATABASE_URL="postgresql://systic_user:systic_pass_dev@localhost:5432/systic_ci?schema=public" \
  npx ts-node --transpile-only prisma/seed.ts \
  && ok "Données de démo injectées" \
  || warn "Seed ignoré (déjà présent ?)"

# ── 8. Résumé final ──────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅ SYSTIC-CI — Prêt à démarrer !            ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Ouvrez 2 nouveaux terminaux et lancez :            ║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║  Terminal 2 (API) :                                  ║${NC}"
echo -e "${GREEN}║  cd ~/Claude/Projects/SYSTIC_CI/systic-platform      ║${NC}"
echo -e "${GREEN}║  ./start-local.sh api                                ║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║  Terminal 3 (Frontend) :                             ║${NC}"
echo -e "${GREEN}║  cd ~/Claude/Projects/SYSTIC_CI/systic-platform      ║${NC}"
echo -e "${GREEN}║  ./start-local.sh web-only                           ║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║  Comptes démo (mdp: Test@Systic2024!) :             ║${NC}"
echo -e "${GREEN}║  admin@systic.ci · client@systic.ci · tech@systic.ci║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Lancer le frontend directement pour voir tout de suite
read -p "▶  Lancer le frontend maintenant ? [O/n] " REPLY
REPLY=${REPLY:-O}
if [[ "$REPLY" =~ ^[Oo]$ ]]; then
  log "Ouverture de http://localhost:3000 dans 5 secondes..."
  (sleep 5 && open http://localhost:3000) &
  cd "$ROOT/apps/web" && npm run dev
fi
