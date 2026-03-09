import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, extractApiError } from "../api/axios";
import { queryClient, queryKeys } from "../api/react-query";

/** Ligne d'inventaire (comptage par produit) */
export interface InventoryLine {
  id: string;
  inventory_id?: string;
  product_id: string;
  product_name?: string;
  product_sku?: string;
  system_quantity: number;
  counted_quantity?: number;
  gap?: number;
}

/** Inventaire - champs alignés sur l'API */
export interface Inventory {
  id: string;
  tenant_id?: string;
  organization_id?: string;
  reference: string;
  status: string;
  started_at?: string | null;
  closed_at?: string | null;
  lines?: InventoryLine[];
  created_at?: string | null;
  updated_at?: string | null;
}

/** Corps pour créer un inventaire (DRAFT) - POST /api/v1/inventories */
export interface CreateInventoryInput {
  reference: string;
}

/** Corps pour saisie comptage - PATCH /api/v1/inventories/lines/{lineId}/counting */
export interface CountingInput {
  counted_quantity: number;
}

/** Liste des inventaires - GET /api/v1/inventories */
export const useInventories = (
  tenantId?: string,
  organizationId?: string
) => {
  return useQuery({
    queryKey: tenantId
      ? queryKeys.inventories.list(tenantId, organizationId)
      : ["inventories", "null"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");

      const response = await apiClient.get<Inventory[]>("/inventories", {
        params: {
          tenantId,
          ...(organizationId != null &&
            organizationId !== "" && { organizationId }),
        },
      });

      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
};

/** Détail d'un inventaire (avec lignes) - GET /api/v1/inventories/{id} */
export const useInventory = (
  tenantId: string | undefined,
  inventoryId: string | undefined,
  organizationId?: string
) => {
  return useQuery({
    queryKey:
      tenantId && inventoryId
        ? queryKeys.inventories.detail(tenantId, inventoryId)
        : ["inventories", "null", "detail"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!inventoryId) throw new Error("No inventory ID provided");

      const response = await apiClient.get<Inventory>(
        `/inventories/${inventoryId}`,
        {
          params: {
            tenantId,
            ...(organizationId != null &&
              organizationId !== "" && { organizationId }),
          },
        }
      );
      return response.data;
    },
    enabled: !!tenantId && !!inventoryId,
    staleTime: 1000 * 60 * 2,
  });
};

/** Créer un inventaire (DRAFT) - POST /api/v1/inventories */
export const useCreateInventory = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (input: CreateInventoryInput) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");

      const response = await apiClient.post<Inventory>("/inventories", input, {
        params: { tenantId, organizationId },
      });

      return response.data;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.inventories.all(tenantId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Create inventory error:", apiError);
    },
  });
};

/** Démarrer un inventaire - POST /api/v1/inventories/{id}/start */
export const useStartInventory = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (inventoryId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!inventoryId) throw new Error("No inventory ID provided");

      const response = await apiClient.post<Inventory>(
        `/inventories/${inventoryId}/start`,
        {},
        {
          params: {
            tenantId,
            ...(organizationId != null &&
              organizationId !== "" && { organizationId }),
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, inventoryId) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.inventories.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.inventories.detail(tenantId, inventoryId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Start inventory error:", apiError);
    },
  });
};

/** Valider un inventaire - POST /api/v1/inventories/{id}/validate */
export const useValidateInventory = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (inventoryId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!inventoryId) throw new Error("No inventory ID provided");

      const response = await apiClient.post<Inventory>(
        `/inventories/${inventoryId}/validate`,
        {},
        {
          params: {
            tenantId,
            ...(organizationId != null &&
              organizationId !== "" && { organizationId }),
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, inventoryId) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.inventories.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.inventories.detail(tenantId, inventoryId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Validate inventory error:", apiError);
    },
  });
};

/** Saisie comptage - PATCH /api/v1/inventories/lines/{lineId}/counting */
export const useCountingLine = (
  tenantId?: string,
  organizationId?: string,
  inventoryId?: string
) => {
  return useMutation({
    mutationFn: async ({
      lineId,
      counted_quantity,
    }: { lineId: string } & CountingInput) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!lineId) throw new Error("No line ID provided");

      const response = await apiClient.patch<InventoryLine>(
        `/inventories/lines/${lineId}/counting`,
        { counted_quantity },
        {
          params: {
            tenantId,
            ...(organizationId != null &&
              organizationId !== "" && { organizationId }),
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.inventories.all(tenantId),
        });
        if (inventoryId) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.inventories.detail(tenantId, inventoryId),
          });
        }
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Counting line error:", apiError);
    },
  });
};
