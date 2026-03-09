import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, extractApiError } from "../api/axios";
import { queryClient, queryKeys } from "../api/react-query";

/** Ligne d'un bon de commande */
export interface PurchaseOrderLine {
  id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total?: number;
}

/** Bon de commande - champs alignés sur l'API (snake_case) */
export interface PurchaseOrder {
  id: string;
  tenant_id?: string;
  organization_id?: string;
  reference?: string;
  supplier_id?: string;
  supplier_name?: string;
  status: string;
  total_amount?: number | string;
  lines?: PurchaseOrderLine[];
  created_at?: string | null;
  updated_at?: string | null;
}

/** Corps pour créer un bon de commande (DRAFT) - POST /api/v1/purchase-orders
 *  Query: tenantId (required), organizationId (required)
 *  Body: reference, supplier_id, lines[]
 */
export interface CreatePurchaseOrderInput {
  reference: string;
  supplier_id: string;
  lines: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface PurchaseOrdersListParams {
  page?: number;
  limit?: number;
  status?: string;
  organizationId?: string;
}

/** Liste des bons de commande - GET /api/v1/purchase-orders */
export const usePurchaseOrders = (
  tenantId?: string,
  params?: PurchaseOrdersListParams
) => {
  return useQuery({
    queryKey: tenantId
      ? queryKeys.purchaseOrders.list(tenantId, params)
      : ["purchaseOrders", "null"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");

      const response = await apiClient.get<PurchaseOrder[]>("/purchase-orders", {
        params: {
          tenantId,
          ...(params?.organizationId && { organizationId: params.organizationId }),
          ...(params?.page != null && { page: params.page }),
          ...(params?.limit != null && { limit: params.limit }),
          ...(params?.status && { status: params.status }),
        },
      });

      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
};

/** Détail d'un bon de commande - GET /api/v1/purchase-orders/{id} */
export const usePurchaseOrder = (
  tenantId: string | undefined,
  orderId: string | undefined,
  organizationId?: string
) => {
  return useQuery({
    queryKey:
      tenantId && orderId
        ? queryKeys.purchaseOrders.detail(tenantId, orderId)
        : ["purchaseOrders", "null", "detail"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!orderId) throw new Error("No purchase order ID provided");

      const response = await apiClient.get<PurchaseOrder>(
        `/purchase-orders/${orderId}`,
        {
          params: {
            tenantId,
            ...(organizationId && { organizationId }),
          },
        }
      );
      return response.data;
    },
    enabled: !!tenantId && !!orderId,
    staleTime: 1000 * 60 * 2,
  });
};

/** Créer un bon de commande (DRAFT) - POST /api/v1/purchase-orders - sans impact stock */
export const useCreatePurchaseOrder = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (input: CreatePurchaseOrderInput) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");

      const response = await apiClient.post<PurchaseOrder>(
        "/purchase-orders",
        input,
        {
          params: { tenantId, organizationId },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.purchaseOrders.all(tenantId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Create purchase order error:", apiError);
    },
  });
};

/** Confirmer un bon de commande - POST /api/v1/purchase-orders/{id}/confirm */
export const useConfirmPurchaseOrder = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!orderId) throw new Error("No purchase order ID provided");

      const response = await apiClient.post<PurchaseOrder | undefined>(
        `/purchase-orders/${orderId}/confirm`,
        {},
        {
          params: {
            tenantId,
            ...(organizationId && { organizationId }),
          },
        }
      );
      // 201 peut renvoyer un body vide ; on retourne les données si présentes
      return response.data;
    },
    onSuccess: (_, orderId) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.purchaseOrders.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.purchaseOrders.detail(tenantId, orderId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      const statusCode = apiError.statusCode ?? (error as { response?: { status?: number } }).response?.status;
      const responseData = (error as { response?: { data?: unknown } }).response?.data;
      // Un seul message lisible en console (plus de "{}")
      console.error(
        `Confirm purchase order error: ${statusCode ?? "?"} - ${apiError.message}`,
        responseData != null ? responseData : ""
      );
    },
  });
};

/** Réception marchandise (GOODS RECEIPT) - POST /api/v1/purchase-orders/{id}/goods-receipts - impact stock + mouvement + écriture expense */
export const useGoodsReceiptPurchaseOrder = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!orderId) throw new Error("No purchase order ID provided");

      const response = await apiClient.post<PurchaseOrder>(
        `/purchase-orders/${orderId}/goods-receipts`,
        {},
        {
          params: {
            tenantId,
            ...(organizationId && { organizationId }),
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, orderId) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.purchaseOrders.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.purchaseOrders.detail(tenantId, orderId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Goods receipt purchase order error:", apiError);
    },
  });
};
