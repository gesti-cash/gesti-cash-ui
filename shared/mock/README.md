# Système de Mock Data (Données Fake)

Ce système permet de développer et tester les fonctionnalités de l'application sans avoir besoin d'une vraie API backend.

## 🎯 Fonctionnalités

- ✅ **Données réalistes** : Génération automatique de données cohérentes
- ✅ **CRUD complet** : Create, Read, Update, Delete pour toutes les entités
- ✅ **Simulation d'API** : Délais et erreurs simulés pour un comportement réaliste
- ✅ **React Query** : Intégration complète avec React Query
- ✅ **Persistence en mémoire** : Les données restent cohérentes pendant la session
- ✅ **Easy toggle** : Activation/désactivation simple du mode mock

## 📦 Entités disponibles

- **Transactions** : Revenus et dépenses
- **Produits** : Catalogue produits avec stock
- **Commandes COD** : Suivi des livraisons
- **Clients** : Base de données clients
- **Dashboard Stats** : Statistiques et analytics

## 🚀 Démarrage rapide

### 1. Activer le mode mock

Le mode mock est activé par défaut dans `shared/config/mock.ts` :

```ts
export const MOCK_CONFIG = {
  enabled: true,  // Mettre à false pour utiliser les vraies API
  delay: { min: 300, max: 800 },
  errorRate: 0.05,
  debug: true,
}
```

### 2. Utiliser les hooks dans vos composants

```tsx
"use client";

import { useMockTransactions, useMockCreateTransaction } from "@/shared/mock";

export default function TransactionsPage() {
  // Récupérer la liste des transactions
  const { data, isLoading, error } = useMockTransactions({
    type: "income",
    page: 1,
    limit: 10,
  });

  // Hook pour créer une transaction
  const createMutation = useMockCreateTransaction();

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      amount: 50000,
      description: "Vente boutique",
      type: "income",
      category: "Électronique",
    });
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      <h1>Transactions ({data?.meta.total})</h1>
      
      <button onClick={handleCreate}>
        Créer une transaction
      </button>

      <ul>
        {data?.data.map((transaction) => (
          <li key={transaction.id}>
            {transaction.description} - {transaction.amount} FCFA
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 📚 Hooks disponibles

### Transactions

```ts
import {
  useMockTransactions,      // Liste des transactions avec filtres
  useMockTransaction,       // Détails d'une transaction
  useMockCreateTransaction, // Créer une transaction
  useMockUpdateTransaction, // Modifier une transaction
  useMockDeleteTransaction, // Supprimer une transaction
} from "@/shared/mock";
```

### Produits

```ts
import {
  useMockProducts,      // Liste des produits avec filtres
  useMockProduct,       // Détails d'un produit
  useMockCreateProduct, // Créer un produit
  useMockUpdateProduct, // Modifier un produit
  useMockDeleteProduct, // Supprimer un produit
} from "@/shared/mock";
```

### Commandes COD

```ts
import {
  useMockCODOrders,      // Liste des commandes COD
  useMockCODOrder,       // Détails d'une commande
  useMockCreateCODOrder, // Créer une commande
  useMockUpdateCODOrder, // Modifier une commande
  useMockDeleteCODOrder, // Supprimer une commande
} from "@/shared/mock";
```

### Clients

```ts
import {
  useMockCustomers,      // Liste des clients
  useMockCustomer,       // Détails d'un client
  useMockCreateCustomer, // Créer un client
  useMockUpdateCustomer, // Modifier un client
  useMockDeleteCustomer, // Supprimer un client
} from "@/shared/mock";
```

### Dashboard

```ts
import {
  useMockDashboardStats, // Statistiques du dashboard
} from "@/shared/mock";
```

## 🔧 Configuration avancée

### Modifier le délai de simulation

```ts
import { MOCK_CONFIG } from "@/shared/mock";

// Modifier le délai (en millisecondes)
MOCK_CONFIG.delay = { min: 100, max: 500 };
```

### Activer/Désactiver le mode mock dynamiquement

```ts
import { setMockEnabled } from "@/shared/mock";

// Désactiver le mode mock
setMockEnabled(false);

// Réactiver le mode mock
setMockEnabled(true);
```

### Réinitialiser les données

```ts
import { mockDB } from "@/shared/mock";

// Réinitialiser toutes les données
mockDB.reset();
```

### Accès direct à l'API mock

Si vous avez besoin d'utiliser l'API mock sans React Query :

```ts
import { mockAPI } from "@/shared/mock";

// Exemple : récupérer les transactions
const transactions = await mockAPI.transactions.list("tenant-id", {
  type: "income",
  page: 1,
  limit: 10,
});

// Exemple : créer un produit
const product = await mockAPI.products.create("tenant-id", {
  name: "iPhone 15",
  sku: "SKU-1234",
  category: "Électronique",
  price: 500000,
  stock: 10,
});
```

## 🎨 Générer des données personnalisées

```ts
import { 
  generateTransaction,
  generateProduct,
  generateCODOrder,
  generateCustomer,
} from "@/shared/mock";

// Générer une transaction personnalisée
const transaction = generateTransaction("tenant-id", {
  amount: 100000,
  type: "income",
  description: "Ma transaction",
});

// Générer un produit personnalisé
const product = generateProduct("tenant-id", {
  name: "Mon produit",
  price: 50000,
  stock: 25,
});
```

## 🔄 Migration vers les vraies API

Quand vous recevrez les vraies API, il suffit de :

1. **Désactiver le mode mock** dans `shared/config/mock.ts` :

```ts
export const MOCK_CONFIG = {
  enabled: false, // ← Mettre à false
  // ...
}
```

2. **Remplacer les hooks mock par les vrais hooks** :

```ts
// Avant (avec mock)
import { useMockTransactions } from "@/shared/mock";

// Après (avec vraie API)
import { useTransactions } from "@/shared/api/hooks";
```

3. **Ou créer des hooks adaptatifs** qui basculent automatiquement :

```ts
import { useMockTransactions } from "@/shared/mock";
import { useTransactions } from "@/shared/api/hooks";
import { isMockEnabled } from "@/shared/mock";

export function useAdaptiveTransactions(filters) {
  return isMockEnabled() 
    ? useMockTransactions(filters)
    : useTransactions(filters);
}
```

## 📊 Données générées par défaut

Au démarrage, le système génère automatiquement :

- **50 transactions** (70% revenus, 30% dépenses)
- **30 produits** avec différentes catégories
- **40 commandes COD** avec différents statuts
- **25 clients** avec historique d'achats
- **1 dashboard** avec statistiques complètes

## 🐛 Débogage

Activez les logs de débogage dans `shared/config/mock.ts` :

```ts
export const MOCK_CONFIG = {
  // ...
  debug: true, // Affiche les logs dans la console
}
```

Vous verrez dans la console :
- `[MOCK API] Simulating call with XXXms delay...`
- `[MOCK API] Response: {...}`
- `[MOCK API] Simulated error: ...` (en cas d'erreur simulée)

## 💡 Conseils

- **Utilisez les hooks mock dès le début** pour ne pas être bloqué en attendant les API
- **Testez différents scénarios** (erreurs, données vides, etc.)
- **Gardez le mode mock même après avoir reçu les API** pour les tests et le développement hors ligne
- **Documentez vos types** pour faciliter la migration vers les vraies API

## 🤝 Contribuer

Pour ajouter une nouvelle entité mock :

1. Créer l'interface dans `generators.ts`
2. Créer le générateur dans `generators.ts`
3. Ajouter les méthodes CRUD dans `database.ts`
4. Ajouter les endpoints dans `api.ts`
5. Créer les hooks dans `hooks.ts`
6. Exporter dans `index.ts`

---

**Bon développement ! 🚀**
