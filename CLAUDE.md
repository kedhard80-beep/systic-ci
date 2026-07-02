# SYSTIC-CI — Guide pour Claude (Conventions & Architecture)

Ce fichier documente les conventions, décisions d'architecture et points critiques
à connaître avant de modifier le code SYSTIC-CI.

---

## Architecture multi-tenant

Chaque entité métier possède un champ `tenantId` (UUID). Toutes les requêtes Prisma
**doivent** filtrer par `tenantId` — ne jamais retourner des données cross-tenant.

```typescript
// ✅ Correct
const clients = await this.prisma.client.findMany({
  where: { tenantId, deletedAt: null },
});

// ❌ Incorrect — expose les données de tous les tenants
const clients = await this.prisma.client.findMany();
```

---

## Champs critiques du schéma Prisma

Noms de champs non-évidents à retenir :

| Modèle | Champ dans le schéma | Piège courant |
|--------|---------------------|---------------|
| `User` | `passwordHash` | Ne pas utiliser `password` |
| `AuditLog` | `entity`, `entityId` | Ne pas utiliser `resource`, `resourceId` |
| `Contract` | `montantHT`, `montantTVA`, `montantTTC` | Ne pas utiliser `totalAmount` |
| `Contact` | `isPrimary` | Ne pas utiliser `principal` |
| `QuizAttempt` | `startedAt` | Pas de `createdAt` sur ce modèle |
| `QuoteItem` | `totalHT` | Pas de `total` |

---

## Enums Prisma — valeurs exactes

### `ActivityType`
`APPEL` | `EMAIL` | `VISITE` | `DEMONSTRATION` | `REUNION` | `DEVIS` | `RELANCE` | `NOTE`
> Pas de `CLIENT_CREATED` ni `CLIENT_UPDATED`

### `QuoteStatus`
`BROUILLON` | `ENVOYE` | `VU` | `EN_NEGOCIATION` | `ACCEPTE` | `REFUSE` | `EXPIRE` | `CONVERTI`
> Pas de `ANNULE`

### `UserRole`
`SUPER_ADMIN` | `ADMIN` | `COMMERCIAL` | `TECHNICIEN` | `FORMATEUR` | `CLIENT` | `ETUDIANT` | `PARTENAIRE`

---

## Client Prisma — règle de copie

Le client généré doit exister dans **deux emplacements** :
- `packages/database/node_modules/.prisma/client/` (généré par `prisma generate`)
- `apps/api/node_modules/.prisma/client/` (copie nécessaire pour la compilation NestJS)

Après toute modification du schéma :
```bash
cd packages/database
npx prisma generate
cp -r node_modules/.prisma/client ../../apps/api/node_modules/.prisma/
```

---

## API URL — Frontend

Le client axios (`apps/web/src/lib/api/client.ts`) ajoute automatiquement `/api/v1` :

```typescript
const _BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const API_URL = _BASE.endsWith('/api/v1') ? _BASE : `${_BASE}/api/v1`;
```

`.env.local` doit contenir :
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## Routes Next.js (App Router)

### Groupes de routes

| Groupe | Dossier | Layout | Usage |
|--------|---------|--------|-------|
| `(admin)` | `src/app/(admin)/` | `layout.tsx` avec sidebar admin | Back-office |
| `(portail)` | `src/app/(portail)/` | `layout.tsx` avec sidebar client | Portail client |
| `(auth)` | `src/app/(auth)/` | Layout minimaliste centré | Login, Register |

Les routes publiques corporate sont à la racine `src/app/`.

### Pages admin existantes
- `/dashboard` → `(admin)/dashboard/page.tsx`
- `/crm` → `(admin)/crm/page.tsx`
- `/admin/clients`, `/admin/devis`, etc. → `(admin)/admin/[module]/page.tsx`

---

## Packages non installés

Ne pas importer ces packages — ils ne sont PAS dans `package.json` :
- `@nestjs/event-emitter` → supprimé, utiliser les notifications directement
- `@nestjs/serve-static` → non utilisé

---

## JSON fields Prisma

Pour les champs `Json` Prisma (ex: `metadata` dans `AuditLog`, `Notification`) :

```typescript
import { Prisma } from '@prisma/client';

// Cast obligatoire
metadata: (dto.metadata ?? {}) as Prisma.InputJsonObject
```

---

## Variables NEXT_PUBLIC_*

Ces variables sont **baked at compile time** dans Next.js. Un changement dans `.env.local`
nécessite :
1. Arrêt du serveur dev (`Ctrl+C`)
2. Redémarrage (`npm run dev`)
3. Hard refresh navigateur (`Cmd+Shift+R`)

---

## Tests unitaires

Les spec files sont dans le même dossier que le service :
```
src/modules/auth/auth.service.spec.ts
src/modules/clients/clients.service.spec.ts
src/modules/quotes/quotes.service.spec.ts
```

Lancer : `cd apps/api && npm test`

Le mock Prisma doit inclure `$transaction` et `softDelete` si utilisés dans le service :
```typescript
const mockPrisma = {
  $transaction: jest.fn((ops) => Promise.all(ops)),
  softDelete: jest.fn().mockResolvedValue({ id: '...' }),
  // ...autres modèles
};
```

---

## Compte admin de développement

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@systic.ci` | `Admin@Systic2024!` | SUPER_ADMIN |
| `akarosine08@gmail.com` | `Test@Systic2024!` | SUPER_ADMIN |

Pour recréer : `cd packages/database && DATABASE_URL="..." npx ts-node --transpile-only add-admin.ts`

---

## Services locaux (dev)

| Service | Port | Commande |
|---------|------|---------|
| PostgreSQL | 5432 | `docker compose -f docker-compose.dev.yml up -d` |
| Redis | 6379 | (inclus dans docker-compose.dev.yml) |
| API NestJS | 4000 | `cd apps/api && npm run dev` |
| Web Next.js | 3001 | `cd apps/web && npm run dev` |
| Prisma Studio | 5555 | `npm run db:studio` (depuis la racine) |
| Swagger UI | 4000/api/docs | Disponible quand l'API tourne |
