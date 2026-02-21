/**
 * Exemples de hooks API personnalisés pour votre application
 * 
 * Ce fichier montre comment créer vos propres hooks React Query
 * qui s'intègrent avec l'architecture multi-tenant.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, extractApiError, queryKeys } from "../api";
import { useTenantId } from "../tenant";
import type { PaginatedResponse } from "../types";

// ============================================
// Types pour les transactions
// ============================================

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: "income" | "expense";
  category: string;
  date: string;
  tenantId: string;
}

interface CreateTransactionInput {
  amount: number;
  description: string;
  type: "income" | "expense";
  category: string;
  date?: string;
}

interface TransactionFilters {
  type?: "income" | "expense";
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

// ============================================
// Hooks de lecture (Queries)
// ============================================

/**
 * Hook pour récupérer la liste des transactions
 */
export function useTransactions(filters?: TransactionFilters) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: queryKeys.transactions.list(tenantId!, filters),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Transaction>>(
        "/transactions",
        { params: filters }
      );
      return data;
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook pour récupérer une transaction spécifique
 */
export function useTransaction(id: string | undefined) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: queryKeys.transactions.detail(tenantId!, id!),
    queryFn: async () => {
      const { data } = await apiClient.get<Transaction>(`/transactions/${id}`);
      return data;
    },
    enabled: !!tenantId && !!id,
  });
}

/**
 * Hook pour récupérer les statistiques du dashboard
 */
export function useDashboardStats(period?: string) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: queryKeys.dashboard.stats(tenantId!, period),
    queryFn: async () => {
      const { data } = await apiClient.get("/dashboard/stats", {
        params: { period },
      });
      return data;
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// Hooks de mutation (Create/Update/Delete)
// ============================================

/**
 * Hook pour créer une transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: async (data: CreateTransactionInput) => {
      const response = await apiClient.post<Transaction>("/transactions", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalider toutes les queries de transactions
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all(tenantId!),
      });
      
      // Invalider les stats du dashboard
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.stats(tenantId!),
      });
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Error creating transaction:", apiError);
    },
  });
}

/**
 * Hook pour mettre à jour une transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateTransactionInput>;
    }) => {
      const response = await apiClient.patch<Transaction>(
        `/transactions/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalider les queries liées
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all(tenantId!),
      });
      
      // Mettre à jour le cache de la transaction spécifique
      queryClient.setQueryData(
        queryKeys.transactions.detail(tenantId!, data.id),
        data
      );
      
      // Invalider les stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.stats(tenantId!),
      });
    },
  });
}

/**
 * Hook pour supprimer une transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/transactions/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalider les queries liées
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all(tenantId!),
      });
      
      // Invalider les stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.stats(tenantId!),
      });
    },
  });
}

// ============================================
// Exemple d'utilisation dans un composant
// ============================================

/*
"use client";

import { useState } from "react";
import { useTransactions, useCreateTransaction } from "@/shared/examples/example-hooks";

export default function TransactionsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  
  // Récupérer les transactions
  const { data, isLoading, error } = useTransactions(filters);
  
  // Hook pour créer une transaction
  const createMutation = useCreateTransaction();

  const handleCreate = async (formData: CreateTransactionInput) => {
    await createMutation.mutateAsync(formData);
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      <h1>Transactions</h1>
      <ul>
        {data?.data.map((transaction) => (
          <li key={transaction.id}>
            {transaction.description} - {transaction.amount}€
          </li>
        ))}
      </ul>
      
      <button onClick={() => handleCreate({ ... })}>
        Créer une transaction
      </button>
    </div>
  );
}
*/
