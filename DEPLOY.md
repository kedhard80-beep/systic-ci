# 🚀 Guide de Déploiement SYSTIC-CI

## Services utilisés (tous GRATUITS)

| Service | Usage | Lien |
|---------|-------|------|
| **Vercel** | Frontend Next.js | https://vercel.com |
| **Railway** | Backend NestJS + PostgreSQL + Redis | https://railway.app |
| **Supabase** | Base de données PostgreSQL | https://supabase.com |
| **Upstash** | Redis (cache & queues) | https://upstash.com |

---

## Étape 1 — Base de données PostgreSQL (Supabase)

> ⚠️ **La base de données est obligatoire.** Sans elle, rien ne fonctionne.

1. Créer un compte sur https://supabase.com
2. Cliquer **New Project**
3. Choisir un nom : `systic-ci`
4. Choisir une région : `Europe West` (Frankfurt)
5. Définir un mot de passe fort
6. Attendre 2 minutes que le projet se crée
7. Aller dans **Settings → Database → Connection string → URI**
8. Copier la chaîne de connexion (ressemble à) :
   ```
   postgresql://postgres:[MOT_DE_PASSE]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
9. **Garder cette URL** — elle sera utilisée comme `DATABASE_URL`

---

## Étape 2 — Redis (Upstash)

1. Créer un compte sur https://upstash.com
2. Cliquer **Create Database**
3. Nom : `systic-ci-redis`
4. Région : `eu-west-1` (Europe)
5. Type : **Free**
6. Copier l'**UPSTASH_REDIS_REST_URL** (format : `rediss://default:xxx@xxx.upstash.io:6379`)
7. **Garder cette URL** — elle sera utilisée comme `REDIS_URL`

---

## Étape 3 — Backend API (Railway)

1. Créer un compte sur https://railway.app (avec GitHub)
2. Cliquer **New Project → Deploy from GitHub repo**
3. Sélectionner le dépôt `SYSTIC-CI`
4. Railway détecte le Dockerfile automatiquement
5. Changer le **Root Directory** en `apps/api`
6. Dans **Variables**, ajouter :

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=[URL Supabase copiée à l'étape 1]
REDIS_URL=[URL Upstash copiée à l'étape 2]
JWT_SECRET=[générer avec : openssl rand -base64 64]
JWT_REFRESH_SECRET=[générer avec : openssl rand -base64 64]
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://[votre-projet].vercel.app
ALLOWED_ORIGINS=https://[votre-projet].vercel.app
DEFAULT_TENANT_ID=systic-ci-default
SEED_ADMIN_EMAIL=admin@systic.ci
SEED_ADMIN_PASSWORD=Admin@Systic2024!
SEED_ADMIN_FIRSTNAME=Super
SEED_ADMIN_LASTNAME=Admin
```

7. Cliquer **Deploy**
8. Attendre 3-5 minutes
9. Copier l'URL générée (ex: `https://systic-ci-api.up.railway.app`)

---

## Étape 4 — Seed de la base de données

Après le premier déploiement du backend :

1. Dans Railway, aller dans l'onglet **Shell** du service API
2. Exécuter :
   ```bash
   node dist/prisma/seed.js
   ```
   Ou depuis votre machine avec la DATABASE_URL de Supabase :
   ```bash
   cd systic-platform/packages/database
   DATABASE_URL="[URL_SUPABASE]" npx prisma migrate deploy
   DATABASE_URL="[URL_SUPABASE]" npx ts-node prisma/seed.ts
   ```

---

## Étape 5 — Frontend (Vercel)

1. Créer un compte sur https://vercel.com (avec GitHub)
2. Cliquer **Add New → Project**
3. Importer le dépôt GitHub `SYSTIC-CI`
4. **IMPORTANT** — Configurer :
   - **Root Directory** : `apps/web`
   - **Framework Preset** : Next.js (auto-détecté)
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`
5. Dans **Environment Variables**, ajouter :
   ```
   NEXT_PUBLIC_API_URL = https://[votre-api].up.railway.app
   ```
6. Cliquer **Deploy**
7. Attendre 2-3 minutes
8. Votre site est en ligne sur `https://[nom-projet].vercel.app` 🎉

---

## Résultat final

| URL | Description |
|-----|-------------|
| `https://[projet].vercel.app` | Site public SYSTIC-CI |
| `https://[projet].vercel.app/admin` | Back-office admin |
| `https://[projet].vercel.app/portail` | Portail client |
| `https://[api].railway.app/docs` | Documentation API Swagger |

**Compte admin :**
- Email : `admin@systic.ci`
- Mot de passe : `Admin@Systic2024!`

---

## Lancer en production localement (pour démos rapides)

Sans déployer en ligne, pour une présentation en local ultra-rapide :

```bash
# Dans le dossier systic-platform/
./start-prod-local.sh
```

> ⚡ **10× plus rapide** que `npm run dev` — utiliser pour toutes les démonstrations.

---

## Pourquoi le site était lent ?

Le site tourne actuellement en mode **développement** (`npm run dev`).
En mode dev, Next.js recompile chaque page à la demande → lent.

En **mode production** (`npm run build` + `npm start`) :
- Pages pré-compilées et optimisées
- Assets minifiés et compressés
- Images converties en WebP/AVIF
- Cache agressif activé
- **Résultat : 10× plus rapide**

Pour le démarrage local rapide, utilisez `./start-prod-local.sh`.
