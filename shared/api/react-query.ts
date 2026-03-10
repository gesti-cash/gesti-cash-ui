import { QueryClient, DefaultOptions } from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
  queries: {
    // Temps avant qu'une requête soit considérée comme obsolète
    staleTime: 1000 * 60 * 5, // 5 minutes
    
    // Temps avant qu'une requête inactive soit supprimée du cache
    gcTime: 1000 * 60 * 10, // 10 minutes (anciennement cacheTime)
    
    // Réessayer automatiquement en cas d'échec
    retry: (failureCount, error: any) => {
      // Ne pas réessayer pour les erreurs 4xx (sauf 408)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        if (error?.response?.status === 408) {
          return failureCount < 2;
        }
        return false;
      }
      // Réessayer jusqu'à 2 fois pour les autres erreurs
      return failureCount < 2;
    },
    
    // Délai entre les tentatives
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Rafraîchir automatiquement quand la fenêtre reprend le focus
    refetchOnWindowFocus: true,
    
    // Rafraîchir quand la connexion est rétablie
    refetchOnReconnect: true,
    
    // Ne pas rafraîchir au montage si les données sont fraîches
    refetchOnMount: true,
  },
  mutations: {
    // Ne pas réessayer les mutations par défaut
    retry: false,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Helper pour invalider les queries liées à un tenant
export const invalidateTenantQueries = (tenantId: string) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = query.queryKey;
      return Array.isArray(queryKey) && queryKey.includes(tenantId);
    },
  });
};

// Helper pour invalider toutes les queries d'un type
export const invalidateQueriesByType = (type: string) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = query.queryKey;
      return Array.isArray(queryKey) && queryKey[0] === type;
    },
  });
};

// Clé de query factory pour assurer la cohérence
export const queryKeys = {
  // Auth
  auth: {
    user: ["auth", "user"] as const,
    session: ["auth", "session"] as const,
  },
  
  // Tenant
  tenant: {
    current: (slug: string) => ["tenant", slug] as const,
    settings: (tenantId: string) => ["tenant", tenantId, "settings"] as const,
  },
  
  // Organizations
  organizations: {
    list: (tenantId: string) => ["organizations", tenantId, "list"] as const,
  },
  
  // Transactions
  transactions: {
    all: (tenantId: string) => ["transactions", tenantId] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["transactions", tenantId, "list", filters] as const,
    detail: (tenantId: string, id: string) => 
      ["transactions", tenantId, "detail", id] as const,
  },
  
  // Users
  users: {
    all: (tenantId: string) => ["users", tenantId] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["users", tenantId, "list", filters] as const,
    detail: (tenantId: string, id: string) => 
      ["users", tenantId, "detail", id] as const,
  },
  
  // Dashboard
  dashboard: {
    stats: (tenantId: string, period?: string) => 
      ["dashboard", tenantId, "stats", period] as const,
  },

  // Categories
  categories: {
    all: (tenantId: string) => ["categories", tenantId] as const,
    list: (tenantId: string, organizationId?: string) =>
      ["categories", tenantId, "list", organizationId] as const,
    detail: (tenantId: string, id: string) =>
      ["categories", tenantId, "detail", id] as const,
  },

  // Products
  products: {
    all: (tenantId: string) => ["products", tenantId] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["products", tenantId, "list", filters] as const,
    detail: (tenantId: string, id: string) =>
      ["products", tenantId, "detail", id] as const,
  },

  // Reference data
  reference: {
    countries: ["reference", "countries"] as const,
    cities: (countryId?: string) => ["reference", "cities", countryId] as const,
  },

  // Orders (ERP Commandes & livraisons)
  orders: {
    all: (tenantId: string) => ["orders", tenantId] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["orders", tenantId, "list", filters] as const,
    detail: (tenantId: string, id: string) =>
      ["orders", tenantId, "detail", id] as const,
  },

  // Customers (Clients)
  customers: {
    all: (tenantId: string) => ["customers", tenantId] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["customers", tenantId, "list", filters] as const,
    detail: (tenantId: string, id: string) =>
      ["customers", tenantId, "detail", id] as const,
  },

  // Suppliers (Fournisseurs)
  suppliers: {
    all: (tenantId: string) => ["suppliers", tenantId] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["suppliers", tenantId, "list", filters] as const,
    detail: (tenantId: string, id: string) =>
      ["suppliers", tenantId, "detail", id] as const,
  },

  // Drivers (Chauffeurs / Livreurs)
  drivers: {
    all: (tenantId: string) => ["drivers", tenantId] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["drivers", tenantId, "list", filters] as const,
    detail: (tenantId: string, id: string) =>
      ["drivers", tenantId, "detail", id] as const,
  },

  // Purchase orders (Bons de commande)
  purchaseOrders: {
    all: (tenantId: string) => ["purchaseOrders", tenantId] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      ["purchaseOrders", tenantId, "list", filters] as const,
    detail: (tenantId: string, id: string) =>
      ["purchaseOrders", tenantId, "detail", id] as const,
  },

  // Stocks
  stocks: {
    all: (tenantId: string) => ["stocks", tenantId] as const,
    list: (tenantId: string, organizationId?: string) =>
      ["stocks", tenantId, "list", organizationId] as const,
    detail: (tenantId: string, id: string) =>
      ["stocks", tenantId, "detail", id] as const,
  },

  // Inventories (Inventaires)
  inventories: {
    all: (tenantId: string) => ["inventories", tenantId] as const,
    list: (tenantId: string, organizationId?: string) =>
      ["inventories", tenantId, "list", organizationId] as const,
    detail: (tenantId: string, id: string) =>
      ["inventories", tenantId, "detail", id] as const,
  },
};
