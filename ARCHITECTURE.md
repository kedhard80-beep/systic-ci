# SYSTIC-CI Platform — Architecture Technique

> Version 1.0 · Juillet 2026 · Équipe SYSTIC-CI Tech

---

## Vue d'ensemble

La plateforme SYSTIC-CI est une application SaaS multi-tenant enterprise construite en monorepo (Turborepo). Elle regroupe un site corporate SEO-first, un CRM, un ERP léger, un LMS (Académie), des portails client/technicien, et un back-office complet avec IA intégrée.

```
systic-platform/
├── apps/
│   ├── web/          ← Next.js 15 (React 19, TypeScript, TailwindCSS)
│   └── api/          ← NestJS 10 (TypeScript, Prisma, PostgreSQL)
├── packages/
│   ├── database/     ← Prisma schema + migrations
│   ├── ui/           ← Composants partagés
│   └── config/       ← ESLint, TypeScript configs
├── docker/           ← Docker Compose, NGINX, configs infra
└── .github/
    └── workflows/    ← CI/CD GitHub Actions
```

---

## Stack Technique

### Frontend — `apps/web`
| Technologie | Usage |
|---|---|
| **Next.js 15** | Framework React, App Router, SSR/SSG/ISR |
| **React 19** | UI library avec Server Components |
| **TypeScript** | Typage strict |
| **TailwindCSS 3** | CSS utility-first |
| **Framer Motion** | Animations déclaratives |
| **GSAP** | Animations haute performance |
| **React Three Fiber** | 3D (hero sections) |
| **Shadcn/UI + Radix UI** | Composants accessibles |
| **React Hook Form + Zod** | Formulaires typés |
| **TanStack Query** | State serveur, cache, sync |
| **Zustand** | State client léger |
| **Lenis** | Smooth scroll |
| **Lucide React** | Icônes |

### Backend — `apps/api`
| Technologie | Usage |
|---|---|
| **NestJS 10** | Framework Node.js modulaire |
| **TypeScript** | Typage strict end-to-end |
| **Prisma** | ORM type-safe |
| **PostgreSQL 16** | Base de données principale |
| **Redis 7** | Cache + BullMQ (jobs) |
| **BullMQ** | Files de jobs asynchrones |
| **Socket.IO** | Temps réel (chat, notifications) |
| **JWT + Refresh Token** | Authentification stateless |
| **Passport.js** | Stratégies auth |
| **Swagger/OpenAPI** | Documentation API auto-générée |

### Infrastructure
| Technologie | Usage |
|---|---|
| **Docker + Compose** | Containerisation |
| **NGINX** | Reverse proxy, SSL, rate limiting |
| **GitHub Actions** | CI/CD automatisé |
| **Vercel** | Déploiement Next.js (optionnel) |
| **Coolify** | Self-hosting alternatif |
| **AWS S3** | Stockage fichiers/médias |
| **Cloudflare** | CDN + protection DDoS |
| **Sentry** | Error tracking |
| **Prometheus + Grafana** | Métriques & monitoring |

---

## Architecture Multi-Tenant

Chaque `Tenant` représente une instance (filiale, marque, franchise). La séparation est assurée au niveau applicatif via `tenantId` sur chaque table.

```
Tenant (SYSTIC-CI Main)
  ├── Users (avec rôles RBAC)
  ├── Clients & Contacts
  ├── Devis → Contrats → Factures
  ├── Projets → Interventions
  ├── Produits → Stocks
  ├── Cours → Modules → Étudiants
  ├── Blog → Portfolio
  └── Paramètres
```

---

## Modules Applicatifs

### Module 1 — Site Corporate
- Pages : Accueil, Entreprise, Nos Métiers (Courant Faible/Fort), Académie, Réalisations, Blog, Carrières, Contact, FAQ, Devis
- SEO : Lighthouse >95, Schema.org, Open Graph, Sitemap, Robots
- Performance : images WebP/AVIF, lazy loading, compression, CDN

### Module 2 — CRM
- Gestion prospects → clients
- Pipeline commercial visuel (kanban)
- Devis avec signature électronique
- Activités et historique complet
- Relances automatiques par email/SMS

### Module 3 — Portail Client
- Dashboard personnel
- Contrats, factures, paiements
- Historique des interventions
- Tickets de support
- Chat en temps réel
- Notifications push

### Module 4 — Portail Technicien
- Planning journalier/hebdomadaire
- Fiche d'intervention (GPS, photos, checklist)
- Signature client électronique
- Rapport d'intervention
- Gestion du stock embarqué
- Mode hors-ligne (PWA)

### Module 5 — ERP
- Gestion clients & fournisseurs
- Stock & achats
- Facturation complète
- Gestion des contrats de maintenance
- Calendrier des interventions

### Module 6 — Académie (LMS)
- Catalogue de 6 modules de formation
- Vidéos, ressources, quiz interactifs
- Progression et badges
- Génération de certificats PDF
- Forum et classe virtuelle
- Paiement intégré

### Module 7 — Blog CMS
- Éditeur markdown riche
- Catégories, tags, SEO par article
- Commentaires modérés
- Recherche full-text

### Module 8 — Portfolio
- Galerie de réalisations
- Photos avant/après
- Filtres par catégorie
- Études de cas détaillées

### Module 9 — IA
- Assistant conversationnel (GPT-4)
- Recommandation de services
- Aide à la création de devis
- Réponse aux FAQ
- Prise de rendez-vous intelligente

### Module 10 — Back-Office Admin
- Dashboard analytics complet
- Gestion des utilisateurs et rôles (RBAC)
- Logs d'audit
- Paramètres de la plateforme
- Sauvegardes automatiques

---

## Sécurité

- **OWASP Top 10** : protection complète
- **2FA** : TOTP (Google Authenticator)
- **JWT** : access token 15min + refresh token 30j (rotation)
- **Rate Limiting** : par IP et par utilisateur
- **RBAC** : 9 rôles distincts avec permissions fines
- **CSRF** : protection activée
- **XSS** : sanitisation des inputs
- **SQL Injection** : Prisma ORM (requêtes paramétrées)
- **RGPD** : consentement, droit à l'oubli, exports
- **Chiffrement** : TLS 1.3 en transit, bcrypt pour passwords

---

## Déploiement

### Développement local
```bash
# Prérequis : Node 20+, Docker Desktop
git clone https://github.com/systic-ci/systic-platform.git
cd systic-platform
cp .env.example .env.local
docker compose -f docker/docker-compose.yml up -d postgres redis
npm install
npx prisma migrate dev --schema=packages/database/prisma/schema.prisma
npm run dev
```

### Production (VPS Ubuntu 22.04)
```bash
# Sur le serveur
docker compose -f docker/docker-compose.yml --profile prod up -d
docker compose exec api npx prisma migrate deploy
```

### CI/CD
- **Push sur `develop`** → tests → build → déploiement staging
- **Push sur `main`** → tests → build → déploiement production
- **Pull Requests** → lint + type-check + tests uniquement

---

## Variables d'environnement

Voir `.env.example` pour la liste complète.

---

## Roadmap V2

- [ ] Application mobile Flutter (iOS + Android)
- [ ] API publique pour les partenaires
- [ ] Facturation électronique normalisée
- [ ] Intégration CinetPay (Mobile Money)
- [ ] Rapport BI avancé (Grafana public)
- [ ] Multi-langue (FR / EN)

---

*SYSTIC-CI — Systèmes Technologiques & Intégration de Confiance*  
*contact@systic.ci · systic.ci · Abidjan, Côte d'Ivoire*
