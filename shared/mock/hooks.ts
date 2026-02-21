/**
 * Hooks React Query pour utiliser les données mock
 * Ces hooks remplacent les vrais hooks API quand le mode mock est activé
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantId } from "../tenant";
import { queryKeys } from "../api/react-query";
import { mockAPI, isMockEnabled } from "./api";
import type {
  MockTransaction,
  MockProduct,
  MockCODOrder,
  MockCustomer,
} from "./generators";

// ============================================
// Transactions Hooks
// ============================================

export function useMockTransactions(filters?: {
  type?: "income" | "expense";
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["mock", "transactions", "list", tenantId, filters],
    queryFn: () => mockAPI.transactions.list(tenantId!, filters),
    enabled: !!tenantId && isMockEnabled(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useMockTransaction(id: string | undefined) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["mock", "transactions", "detail", id],
    queryFn: () => mockAPI.transactions.get(id!),
    enabled: !!tenantId && !!id && isMockEnabled(),
  });
}

export function useMockCreateTransaction() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: async (data: {
      amount: number;
      description: string;
      type: "income" | "expense";
      category: string;
      date?: string;
    }) => mockAPI.transactions.create(tenantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "transactions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["mock", "dashboard"],
      });
    },
  });
}

export function useMockUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: Partial<MockTransaction>;
    }) => mockAPI.transactions.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "transactions"],
      });
      queryClient.setQueryData(
        ["mock", "transactions", "detail", data.id],
        data
      );
    },
  });
}

export function useMockDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => mockAPI.transactions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "transactions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["mock", "dashboard"],
      });
    },
  });
}

// ============================================
// Products Hooks
// ============================================

export function useMockProducts(filters?: {
  category?: string;
  isActive?: boolean;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["mock", "products", "list", tenantId, filters],
    queryFn: () => mockAPI.products.list(tenantId!, filters),
    enabled: !!tenantId && isMockEnabled(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMockProduct(id: string | undefined) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["mock", "products", "detail", id],
    queryFn: () => mockAPI.products.get(id!),
    enabled: !!tenantId && !!id && isMockEnabled(),
  });
}

export function useMockCreateProduct() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      sku: string;
      category: string;
      price: number;
      cost?: number;
      stock: number;
      minStock?: number;
      maxStock?: number;
      description?: string;
    }) => mockAPI.products.create(tenantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "products"],
      });
    },
  });
}

export function useMockUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: Partial<MockProduct>;
    }) => mockAPI.products.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "products"],
      });
      queryClient.setQueryData(
        ["mock", "products", "detail", data.id],
        data
      );
    },
  });
}

export function useMockDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => mockAPI.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "products"],
      });
    },
  });
}

// ============================================
// COD Orders Hooks
// ============================================

export function useMockCODOrders(filters?: {
  status?: string;
  city?: string;
  page?: number;
  limit?: number;
}) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["mock", "cod-orders", "list", tenantId, filters],
    queryFn: () => mockAPI.codOrders.list(tenantId!, filters),
    enabled: !!tenantId && isMockEnabled(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useMockCODOrder(id: string | undefined) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["mock", "cod-orders", "detail", id],
    queryFn: () => mockAPI.codOrders.get(id!),
    enabled: !!tenantId && !!id && isMockEnabled(),
  });
}

export function useMockCreateCODOrder() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: async (data: {
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      city: string;
      products: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
      }>;
      totalAmount: number;
      deliveryFee: number;
    }) => mockAPI.codOrders.create(tenantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "cod-orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["mock", "dashboard"],
      });
    },
  });
}

export function useMockUpdateCODOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: Partial<MockCODOrder>;
    }) => mockAPI.codOrders.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "cod-orders"],
      });
      queryClient.setQueryData(
        ["mock", "cod-orders", "detail", data.id],
        data
      );
    },
  });
}

export function useMockDeleteCODOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => mockAPI.codOrders.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "cod-orders"],
      });
    },
  });
}

// ============================================
// Customers Hooks
// ============================================

export function useMockCustomers(filters?: {
  page?: number;
  limit?: number;
}) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["mock", "customers", "list", tenantId, filters],
    queryFn: () => mockAPI.customers.list(tenantId!, filters),
    enabled: !!tenantId && isMockEnabled(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMockCustomer(id: string | undefined) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["mock", "customers", "detail", id],
    queryFn: () => mockAPI.customers.get(id!),
    enabled: !!tenantId && !!id && isMockEnabled(),
  });
}

export function useMockCreateCustomer() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email?: string;
      phone: string;
      address?: string;
      city?: string;
    }) => mockAPI.customers.create(tenantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "customers"],
      });
    },
  });
}

export function useMockUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: Partial<MockCustomer>;
    }) => mockAPI.customers.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "customers"],
      });
      queryClient.setQueryData(
        ["mock", "customers", "detail", data.id],
        data
      );
    },
  });
}

export function useMockDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => mockAPI.customers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mock", "customers"],
      });
    },
  });
}

// ============================================
// Dashboard Hooks
// ============================================

export function useMockDashboardStats(period?: string) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["mock", "dashboard", "stats", tenantId, period],
    queryFn: () => mockAPI.dashboard.getStats(tenantId!, period),
    enabled: !!tenantId && isMockEnabled(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
