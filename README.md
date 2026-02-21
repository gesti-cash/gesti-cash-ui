# 🏦 Gesti-Cash - Application Multi-Tenant de Gestion de Trésorerie

Application Next.js 14+ avec architecture multi-tenant complète, construite avec les meilleures pratiques et technologies modernes.

## ✨ Fonctionnalités

- 🏢 **Multi-Tenant** - Architecture par sous-domaine (tenant1.domain.com)
- 🔐 **Authentification** - JWT avec refresh automatique
- 🛡️ **Guards** - Protection des routes par authentification et rôles
- 🌍 **i18n** - Support multilingue (FR/EN)
- 📊 **React Query** - Gestion optimisée de l'état serveur
- 🎨 **Tailwind CSS** - Design moderne et responsive
- ✅ **Validation** - Zod + React Hook Form
- 🔄 **State Management** - Zustand avec persistance
- 🎭 **Mock Data System** - Système complet de données fake pour le développement

## 🚀 Technologies

- **Next.js 16** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Axios** - Client HTTP avec intercepteurs
- **TanStack Query (React Query)** - Gestion du cache et état serveur
- **Zustand** - Gestion de l'état client
- **Zod** - Validation de schémas
- **React Hook Form** - Gestion des formulaires
- **Next-intl** - Internationalisation
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Composants UI avec Radix UI

## 📁 Structure du Projet

```
gesti-cash/
├── app/
│   ├── (public)/          # Routes publiques
│   │   └── login/         # Page de connexion
│   ├── (tenant)/          # Routes protégées par tenant
│   │   └── dashboard/     # Dashboard principal
│   └── layout.tsx         # Layout racine avec providers
├── shared/
│   ├── api/               # Configuration API & React Query
│   ├── auth/              # Authentification (store, hooks, guards)
│   ├── tenant/            # Multi-tenant (store, hooks)
│   ├── mock/              # 🆕 Système de données fake (Mock Data)
│   ├── providers/         # Providers React
│   ├── i18n/              # Configuration i18n
│   ├── types/             # Types TypeScript
│   ├── constants/         # Constantes de l'app
│   ├── utils/             # Fonctions utilitaires
│   └── examples/          # Exemples de code
├── messages/              # Fichiers de traduction
├── middleware.ts          # Middleware multi-tenant
└── i18n.ts               # Configuration Next-intl
```

## 🎯 Démarrage Rapide

### 1. Installation

```bash
npm install
```

### 2. Configuration

Créez un fichier `.env.local` :

```bash
cp env.local.example .env.local
```

Configurez vos variables :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Sous-domaines en local (optionnel)

**Windows** : Éditez `C:\Windows\System32\drivers\etc\hosts`
**Linux/Mac** : Éditez `/etc/hosts`

Ajoutez :
```
127.0.0.1 tenant1.localhost
127.0.0.1 tenant2.localhost
```

### 4. Lancer l'application

```bash
npm run dev
```

Accédez à :
- http://localhost:3000
- http://tenant1.localhost:3000

## 📚 Documentation

### Guides Principaux

- **[QUICK_START.md](./QUICK_START.md)** - Guide de démarrage rapide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Documentation complète de l'architecture
- **[API_CONTRACTS.md](./API_CONTRACTS.md)** - Spécification des endpoints API
- **[SHADCN_UI.md](./SHADCN_UI.md)** - Documentation shadcn/ui et composants

### 🎭 Système de Mock Data (Données Fake)

**➡️ [MOCK_DATA_INDEX.md](./MOCK_DATA_INDEX.md)** - 🎯 **Index principal** (commencez ici !)

- **[MOCK_DATA_QUICK_START.md](./MOCK_DATA_QUICK_START.md)** - ⚡ Démarrage rapide (2 min)
- **[MOCK_DATA_VISUAL_GUIDE.md](./MOCK_DATA_VISUAL_GUIDE.md)** - 🎨 Guide visuel avec diagrammes
- **[MOCK_SYSTEM_SUMMARY.md](./MOCK_SYSTEM_SUMMARY.md)** - 📋 Résumé complet du système
- **[shared/mock/README.md](./shared/mock/README.md)** - 📖 Documentation technique détaillée
- **[shared/mock/example-usage.tsx](./shared/mock/example-usage.tsx)** - 💻 Exemples de code

> 💡 **Nouveau !** Développez vos fonctionnalités sans attendre les API grâce au système de mock data complet.

### 🔐 Connexion Admin avec Accès Fake

**➡️ [CONNEXION_ADMIN_FAKE.md](./CONNEXION_ADMIN_FAKE.md)** - 🎯 **Guide complet**

- **[MOCK_AUTH_QUICK_START.md](./MOCK_AUTH_QUICK_START.md)** - ⚡ Connexion en 30 secondes

> 🔑 **Connectez-vous immédiatement** avec `admin@gesticash.com` / `admin123` pour accéder à toutes les fonctionnalités !

### 🎨 Charte Graphique GestiCash

**➡️ [BRAND_INDEX.md](./BRAND_INDEX.md)** - 🎯 **Index principal de la charte** (commencez ici !)

- **[BRAND_QUICKSTART.md](./BRAND_QUICKSTART.md)** - ⚡ Guide rapide des couleurs et composants (5 min)
- **[BRAND_COLORS_REFERENCE.md](./BRAND_COLORS_REFERENCE.md)** - 🎨 Référence complète des couleurs
- **[BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md)** - 📖 Charte graphique officielle
- **[BRAND_INTEGRATION_SUMMARY.md](./BRAND_INTEGRATION_SUMMARY.md)** - 📋 Résumé de l'intégration technique
- **[INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md)** - ✅ Confirmation de l'intégration
- **[FILES_CHANGED.md](./FILES_CHANGED.md)** - 📝 Liste des fichiers modifiés

### Exemples de Code

Consultez `shared/examples/` pour des exemples de :
- Hooks API personnalisés
- Utilisation de React Query
- Mutations avec invalidation de cache

### Mock Data System

Développez vos fonctionnalités sans attendre les API :

```tsx
import { useMockTransactions, useMockCreateTransaction } from "@/shared/mock";

export default function MaPage() {
  const { data, isLoading } = useMockTransactions({ limit: 10 });
  const createMutation = useMockCreateTransaction();

  // Utilisez les données fake comme si c'étaient de vraies API !
  return (
    <div>
      {data?.data.map(t => (
        <div key={t.id}>{t.description} - {t.amount} FCFA</div>
      ))}
    </div>
  );
}
```

**Page de démo interactive :** [/mock-demo](http://localhost:3000/mock-demo)

**Entités disponibles :**
- ✅ Transactions (revenus/dépenses)
- ✅ Produits (avec stock)
- ✅ Commandes COD (suivi livraison)
- ✅ Clients (avec historique)
- ✅ Dashboard Stats (analytics complets)

Consultez [MOCK_DATA_INDEX.md](./MOCK_DATA_INDEX.md) pour la documentation complète.

## 🔑 Concepts Clés

### Multi-Tenant

Le tenant est automatiquement détecté depuis le sous-domaine :

```typescript
// tenant1.gesticash.com → tenant = "tenant1"
import { useTenant } from '@/shared/tenant';

const tenant = useTenant();
console.log(tenant.slug); // "tenant1"
```

### Authentification

```typescript
import { useLogin, useLogout } from '@/shared/auth';

const loginMutation = useLogin();
const logoutMutation = useLogout();

// Login
await loginMutation.mutateAsync({
  email: "user@example.com",
  password: "password",
  tenantSlug: "tenant1"
});
```

### Guards

```typescript
import { Guard } from '@/shared/auth';
import { UserRole } from '@/shared/types';

// Protéger par rôle
<Guard roles={[UserRole.ADMIN]}>
  <AdminPanel />
</Guard>

// HOC
import { withAuth, withRole } from '@/shared/auth';

export default withAuth(MyComponent);
export default withRole(MyComponent, [UserRole.ADMIN]);
```

### API Calls

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, queryKeys } from '@/shared/api';

// GET request
const { data } = useQuery({
  queryKey: queryKeys.transactions.all(tenantId),
  queryFn: async () => {
    const { data } = await apiClient.get('/transactions');
    return data;
  },
});

// POST request
const mutation = useMutation({
  mutationFn: async (newItem) => {
    const { data } = await apiClient.post('/transactions', newItem);
    return data;
  },
});
```

### Formulaires

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

### Traductions

```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('common');

<h1>{t('loading')}</h1>
```

## 🛡️ Sécurité

### Middleware

Le middleware gère automatiquement :
- ✅ Redirection vers `/login` si non authentifié
- ✅ Vérification du tenant pour les routes protégées
- ✅ Extraction du tenant depuis le sous-domaine

### Intercepteurs Axios

Tous les appels API incluent automatiquement :
- `Authorization: Bearer {token}`
- `X-Tenant-ID: {tenantId}`
- `X-Tenant-Slug: {tenantSlug}`

Le token est automatiquement rafraîchi en cas d'expiration.

## 📦 Scripts Disponibles

```bash
npm run dev      # Développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linter ESLint
```

## 🎨 Styles & Composants UI

L'application utilise **Tailwind CSS** avec **shadcn/ui** et la **charte graphique GestiCash**.

### 🎨 Charte Graphique

#### Couleurs principales
- **Vert GestiCash** `#4CAF50` - Croissance, gestion (primaire)
- **Bleu GestiCash** `#1E88E5` - Technologie, fiabilité (secondaire)
- **Orange GestiCash** `#F9A825` - Progression, accent

#### Typographie
- **Police** : Montserrat (400, 500, 600, 700)
- **Titres** : `font-bold` ou `font-semibold`

#### Guide rapide
```tsx
// Bouton primaire (vert)
<Button className="bg-primary">Action</Button>

// Card avec bordure colorée
<Card className="border-l-4 border-l-primary">...</Card>

// Badge avec couleur de marque
<Badge className="bg-primary">Validé</Badge>

// Titres
<h1 className="text-2xl font-bold text-primary">GestiCash</h1>
```

📖 **Consultez [BRAND_QUICKSTART.md](./BRAND_QUICKSTART.md) pour plus d'exemples**

### Composants Disponibles

- **Button** - Boutons avec variantes (primaire, secondaire, outline)
- **Input** / **Textarea** - Champs de formulaire
- **Card** - Cartes de contenu avec bordures colorées
- **Badge** - Labels et badges avec couleurs de marque
- **Avatar** - Avatars utilisateur
- **Skeleton** - États de chargement
- **Separator** - Séparateurs
- Plus de composants dans [SHADCN_UI.md](./SHADCN_UI.md)

### Utilisation

```tsx
import { Button, Card, Badge } from "@/shared/ui";

<Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle className="font-bold">Titre</CardTitle>
  </CardHeader>
  <CardContent>
    <Button className="bg-primary">Action</Button>
    <Badge className="bg-secondary">Nouveau</Badge>
  </CardContent>
</Card>
```

### Page de Démonstration

Visitez `/ui-showcase` pour voir tous les composants disponibles.

### Mode Sombre

Le mode sombre est supporté automatiquement via la classe `.dark`.
Les couleurs de la charte s'adaptent pour maintenir un bon contraste.

## 🔄 Flow d'Authentification

1. Utilisateur accède à `tenant1.localhost:3000/login`
2. Middleware extrait le slug "tenant1"
3. TenantProvider charge les données du tenant
4. Utilisateur se connecte
5. Tokens stockés dans Zustand (localStorage)
6. AuthProvider charge les données utilisateur
7. Redirection vers `/dashboard`
8. Tous les appels API incluent le token et le tenant ID

## 🏗️ Architecture

### Stores Zustand

- **authStore** : État d'authentification (user, tokens)
- **tenantStore** : État du tenant (tenant, settings)

### Providers

- **QueryProvider** : React Query + DevTools
- **TenantProvider** : Charge le tenant au démarrage
- **AuthProvider** : Charge l'utilisateur si authentifié
- **AppProviders** : Combine tous les providers

### Hooks Personnalisés

#### Auth
- `useLogin()` - Connexion
- `useLogout()` - Déconnexion
- `useCurrentUser()` - Utilisateur courant
- `useSession()` - Vérification de session

#### Tenant
- `useLoadTenant()` - Charger un tenant
- `useCurrentTenant()` - Tenant courant
- `useTenantSettings()` - Paramètres du tenant

## 🚧 Développement

### Créer une Nouvelle Page

```typescript
// app/(tenant)/ma-page/page.tsx
"use client";

import { useCurrentTenant } from '@/shared/tenant';
import { useUser } from '@/shared/auth';

export default function MaPage() {
  const tenant = useCurrentTenant();
  const user = useUser();

  return (
    <div>
      <h1>Bienvenue {user?.firstName}</h1>
      <p>Organisation : {tenant?.name}</p>
    </div>
  );
}
```

### Créer un Hook API

Consultez `shared/examples/example-hooks.ts` pour des exemples complets.

## 📝 Conventions de Code

- **Composants** : PascalCase (`MyComponent.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useMyHook.ts`)
- **Types** : PascalCase (`User`, `Tenant`)
- **Constants** : UPPER_SNAKE_CASE (`USER_ROLES`)
- **Fichiers utilitaires** : camelCase (`formatDate.ts`)

## 🤝 Contribution

1. Suivre les conventions de code
2. Ajouter des types TypeScript
3. Valider avec Zod
4. Documenter les fonctions complexes
5. Utiliser les query keys factory

## 📄 License

MIT

## 🆘 Support

Pour toute question :
- Consultez la documentation dans `/docs`
- Regardez les exemples dans `shared/examples/`
- Vérifiez les contrats API dans `API_CONTRACTS.md`

---

**Développé avec ❤️ pour la gestion de trésorerie**
