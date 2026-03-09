import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, extractApiError } from "../api/axios";
import { queryClient, queryKeys } from "../api/react-query";

export interface Stock {
  id: string;
  product_id: string;
  quantity: number;
  tenant_id?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
  product?: { id: string; name: string; sku?: string };
}

/** Corps pour créer ou ajuster un stock - POST /api/v1/stocks */
export interface CreateOrAdjustStockInput {
  product_id: string;
  quantity: number;
}

/** Corps pour modifier la quantité - PATCH /api/v1/stocks/{id} */
export interface UpdateStockQuantityInput {
  quantity: number;
}

/** Liste des stocks - GET /api/v1/stocks */
export const useStocks = (tenantId?: string, organizationId?: string) => {
  return useQuery({
    queryKey: tenantId
      ? queryKeys.stocks.list(tenantId, organizationId)
      : ["stocks", "null"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");

      const response = await apiClient.get<Stock[]>("/stocks", {
        params: {
          tenantId,
          ...(organizationId != null &&
            organizationId !== "" && { organizationId }),
        },
      });

      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
};

/** Détail d'un stock - GET /api/v1/stocks/{id} */
export const useStock = (
  tenantId: string | undefined,
  stockId: string | undefined,
  organizationId?: string
) => {
  return useQuery({
    queryKey:
      tenantId && stockId
        ? queryKeys.stocks.detail(tenantId, stockId)
        : ["stocks", "null", "detail"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!stockId) throw new Error("No stock ID provided");

      const response = await apiClient.get<Stock>(`/stocks/${stockId}`, {
        params: {
          tenantId,
          ...(organizationId != null &&
            organizationId !== "" && { organizationId }),
        },
      });
      return response.data;
    },
    enabled: !!tenantId && !!stockId,
    staleTime: 1000 * 60 * 5,
  });
};

/** Créer ou ajuster un stock - POST /api/v1/stocks */
export const useCreateOrAdjustStock = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (input: CreateOrAdjustStockInput) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");

      const response = await apiClient.post<Stock>("/stocks", input, {
        params: { tenantId, organizationId },
      });

      return response.data;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.stocks.all(tenantId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Create/adjust stock error:", apiError);
    },
  });
};

/** Modifier la quantité d'un stock - PATCH /api/v1/stocks/{id} */
export const useUpdateStockQuantity = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async ({
      id,
      quantity,
    }: UpdateStockQuantityInput & { id: string }) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!id) throw new Error("No stock ID provided");

      const response = await apiClient.patch<Stock>(`/stocks/${id}`, { quantity }, {
        params: {
          tenantId,
          ...(organizationId != null &&
            organizationId !== "" && { organizationId }),
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.stocks.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.stocks.detail(tenantId, variables.id),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Update stock quantity error:", apiError);
    },
  });
};

/** Supprimer un stock (soft) - DELETE /api/v1/stocks/{id} */
export const useDeleteStock = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (stockId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!stockId) throw new Error("No stock ID provided");

      await apiClient.delete(`/stocks/${stockId}`, {
        params: {
          tenantId,
          ...(organizationId != null &&
            organizationId !== "" && { organizationId }),
        },
      });
    },
    onSuccess: (_, stockId) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.stocks.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.stocks.detail(tenantId, stockId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Delete stock error:", apiError);
    },
  });
};
