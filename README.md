# SYSTIC-CI — Plateforme Digitale Enterprise

> Plateforme SaaS multi-tenant pour la gestion complète d'une entreprise de sécurité électronique et d'infrastructures intelligentes à Abidjan, Côte d'Ivoire.

---

## Vue d'ensemble

SYSTIC-CI est une plateforme enterprise full-stack comprenant :

- **Site Corporate** — vitrine SEO-optimisée avec toutes les pages métiers
- **CRM** — gestion des leads, pipeline Kanban, suivi commercial
- **ERP léger** — clients, devis, contrats, factures, stocks, interventions
- **Portail Client** — accès sécurisé aux contrats, factures, tickets
- **Portail Technicien** — planning, missions, rapports d'intervention
- **Académie** — LMS avec cours, quiz, certificats PDF
- **Back-Office** — administration complète (utilisateurs, rôles, paramètres)
- **Assistant IA** — chatbot intelligent pour support client et devis

---

## Stack Technique

### Frontend (`apps/web`)
| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 15 | Framework React full-stack |
| React | 19 | UI Library |
| TypeScript | 5.7 | Typage statique |
| TailwindCSS | 3 | Styles utilitaires |
| Framer Motion | — | Animations premium |
| GSAP | — | Animations avancées |
| Shadcn UI | — | Composants accessibles |
| TanStack Query | — | Cache & requêtes API |
| React Hook Form + Zod | — | Formulaires validés |

### Backend (`apps/api`)
| Technologie | Version | Rôle |
|-------------|---------|------|
| NestJS | 10 | Framework backend modulaire |
| Node.js | 20 | Runtime |
| TypeScript | 5.7 | Typage statique |
| Prisma | 6 | ORM type-safe |
| PostgreSQL | 16 | Base de données principale |
| Redis | 7 | Cache & queues |
| BullMQ | — | Tâches asynchrones |
| Socket.IO | — | WebSocket temps réel |
| JWT + Refresh Tokens | — | Authentification |

### Infrastructure
| Outil | Rôle |
|-------|------|
| Docker + Docker Compose | Containerisation |
| Nginx | Reverse proxy + SSL |
| GitHub Actions | CI/CD automatisé |
| AWS S3 / Cloudflare | Stockage fichiers + CDN |
| Sentry | Monitoring erreurs |

---

## Démarrage rapide

### Prérequis

- Node.js ≥ 20
- Docker & Docker Compose
- npm ≥ 10

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-org/systic-platform.git
cd systic-platform

# 2. Démarrer PostgreSQL + Redis
docker compose -f docker-compose.dev.yml up -d

# 3. Configurer l'API
cp apps/api/.env.example apps/api/.env
# Éditer apps/api/.env avec vos valeurs

# 4. Installer les dépendances
npm install --workspace=packages/database
npm install --workspace=apps/api
npm install --workspace=apps/web

# 5. Générer le client Prisma + migrations + seed
cd packages/database
npx prisma generate
npx prisma migrate dev
npx ts-node prisma/seed.ts
cp -r node_modules/.prisma/client ../../apps/api/node_modules/.prisma/

# 6. Lancer en développement (deux terminaux)
cd ../../apps/api && npm run dev     # API sur :4000
cd ../../apps/web && npm run dev     # Web sur :3001
```

### Compte admin par défaut (après seed)

| Champ | Valeur |
|-------|--------|
| Email | `admin@systic.ci` |
| Mot de passe | `Admin@Systic2024!` |

---

## Structure du projet

```
systic-platform/
├── apps/
│   ├── api/                    # NestJS API
│   │   └── src/
│   │       ├── modules/        # Modules métier (auth, crm, clients…)
│   │       ├── common/         # Guards, interceptors, decorators
│   │       └── prisma/         # PrismaService
│   └── web/                    # Next.js App
│       └── src/
│           ├── app/            # App Router (pages, layouts)
│           ├── components/     # Composants réutilisables
│           ├── lib/            # API client, hooks, utils
│           └── styles/         # CSS global
├── packages/
│   └── database/
│       └── prisma/
│           ├── schema.prisma   # Schéma de base de données
│           ├── migrations/     # Migrations Prisma
│           └── seed.ts         # Données initiales
├── docker/
│   ├── docker-compose.yml      # Stack production complète
│   └── nginx/                  # Configuration Nginx
├── e2e/                        # Tests Playwright E2E
├── playwright.config.ts
└── .github/
    └── workflows/
        └── ci.yml              # Pipeline CI/CD
```

---

## Modules API

| Route | Module | Description |
|-------|--------|-------------|
| `/api/v1/auth` | AuthModule | Login, register, refresh, 2FA |
| `/api/v1/clients` | ClientsModule | CRUD clients + activités |
| `/api/v1/crm` | CrmModule | Leads, pipeline, stats |
| `/api/v1/quotes` | QuotesModule | Devis + transitions état |
| `/api/v1/contracts` | ContractsModule | Contrats + renouvellement |
| `/api/v1/invoices` | InvoicesModule | Factures + paiement |
| `/api/v1/interventions` | InterventionsModule | Planification techniciens |
| `/api/v1/academie` | AcademieModule | Cours, quiz, certificats |
| `/api/v1/tickets` | TicketsModule | Support client |
| `/api/v1/notifications` | NotificationsModule | Push + email |
| `/api/v1/dashboard` | DashboardModule | KPIs admin/client/technicien |
| `/api/v1/ai` | AiModule | Assistant IA + devis auto |
| `/api/v1/health` | HealthModule | Terminus health checks |

Documentation Swagger complète : `http://localhost:4000/api/docs`

---

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| `SUPER_ADMIN` | Accès complet — back-office, configuration |
| `ADMIN` | Gestion opérationnelle complète |
| `COMMERCIAL` | CRM, devis, clients |
| `TECHNICIEN` | Portail technicien, interventions |
| `FORMATEUR` | Académie — création de cours |
| `CLIENT` | Portail client (ses données uniquement) |
| `ETUDIANT` | Académie — accès aux cours achetés |

---

## Tests

```bash
# Tests unitaires (Jest)
cd apps/api && npm test

# Tests avec coverage
cd apps/api && npm test -- --coverage

# Tests E2E (Playwright) — serveurs doivent tourner
npx playwright test

# Interface Playwright
npx playwright test --ui
```

### Résultats actuels

- **28 tests unitaires** — 3 suites (AuthService, ClientsService, QuotesService) — ✅ tous verts
- **5 suites E2E Playwright** — login, dashboard, CRM, corporate, auth

---

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) comporte 7 étapes :

1. **Code Quality** — ESLint + TypeScript strict
2. **Security Audit** — npm audit + Trivy scan
3. **Unit Tests** — Jest avec coverage → Codecov
4. **E2E Tests** — Playwright (chromium) sur `main`/`develop`
5. **Docker Build** — Images web + api → GHCR
6. **Deploy Staging** — Auto sur `develop`
7. **Deploy Production** — Auto sur `main` (avec approbation GitHub)

### Secrets GitHub requis

```
CODECOV_TOKEN           # Rapport de couverture
STAGING_HOST            # IP/hostname du serveur staging
STAGING_USER            # Utilisateur SSH staging
STAGING_SSH_KEY         # Clé privée SSH staging
PROD_HOST               # IP/hostname du serveur production
PROD_USER               # Utilisateur SSH production
PROD_SSH_KEY            # Clé privée SSH production
PROD_SSH_PORT           # Port SSH (défaut 22)
SLACK_WEBHOOK           # Notifications Slack
```

---

## Production

```bash
# Déploiement complet stack production
cd docker
cp .env.prod.example .env
# Éditer .env avec les valeurs production

docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.yml exec api npx prisma migrate deploy
```

Services démarrés :
- **PostgreSQL 16** sur `127.0.0.1:5432`
- **Redis 7** sur `127.0.0.1:6379`
- **API NestJS** sur `:4000` (interne)
- **Web Next.js** sur `:3000` (interne)
- **Nginx** sur `:80` et `:443` (public)
- **Backup PostgreSQL** automatique toutes les 24h

---

## SEO & Performance

- Score Lighthouse cible : **> 95**
- Images : format **AVIF/WebP** automatique via Next.js `<Image>`
- Sitemap dynamique : `/sitemap.xml`
- Robots : `/robots.txt`
- Schema.org : Organization + LocalBusiness + WebSite + SearchAction
- Open Graph + Twitter Cards sur toutes les pages
- Headers sécurité : CSP, X-Frame-Options, HSTS

---

## Sécurité

- OWASP Top 10 adressé
- JWT + Refresh Tokens (rotation automatique)
- Rate limiting (ThrottlerModule)
- RBAC granulaire par rôle
- Audit logs sur toutes les actions sensibles
- 2FA TOTP (Google Authenticator)
- Protection CSRF + XSS (Helmet)
- Chiffrement mots de passe : bcrypt (cost=12)
- SQL Injection : impossible via Prisma ORM

---

## Licence

Propriétaire — SYSTIC-CI © 2024. Tous droits réservés.

Développé pour SYSTIC Côte d'Ivoire — Expert en sécurité électronique à Abidjan.
