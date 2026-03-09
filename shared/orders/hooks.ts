import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, extractApiError } from "../api/axios";
import { queryClient, queryKeys } from "../api/react-query";

/** Statuts possibles d'une livraison (API) */
export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "failed";

/** Ligne de commande */
export interface OrderLine {
  id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total?: number;
}

/** Livraison associée à une commande */
export interface Delivery {
  id: string;
  order_id: string;
  status: DeliveryStatus;
  tracking_number?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Commande (liste ou détail) - champs alignés sur la réponse API (snake_case, total_amount en string possible) */
export interface Order {
  id: string;
  tenant_id?: string;
  organization_id?: string;
  reference?: string;
  order_number?: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_email?: string;
  status: string;
  total_amount: number | string;
  delivery_fee?: number;
  lines?: OrderLine[];
  deliveries?: Delivery[];
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Corps pour créer une commande - POST /api/v1/orders
 *  Query: tenantId (required), organizationId (required)
 *  Body: reference, customer_id, lines[]
 */
export interface CreateOrderInput {
  reference: string;
  customer_id: string;
  lines: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
}

/** Champs modifiables pour PATCH (tous optionnels) */
export interface UpdateOrderInput {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_email?: string;
  lines?: OrderLine[];
  delivery_fee?: number;
  notes?: string;
}

export interface OrdersListParams {
  page?: number;
  limit?: number;
  status?: string;
  organizationId?: string;
}

/** Liste des commandes - GET /api/v1/orders */
export const useOrders = (
  tenantId?: string,
  params?: OrdersListParams
) => {
  return useQuery({
    queryKey: tenantId
      ? queryKeys.orders.list(tenantId, params as Record<string, unknown>)
      : ["orders", "null"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");

      const response = await apiClient.get<Order[]>("/orders", {
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

/** Détail d'une commande - GET /api/v1/orders/{id} */
export const useOrder = (
  tenantId: string | undefined,
  orderId: string | undefined,
  organizationId?: string
) => {
  return useQuery({
    queryKey:
      tenantId && orderId
        ? queryKeys.orders.detail(tenantId, orderId)
        : ["orders", "null", "detail"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!orderId) throw new Error("No order ID provided");

      const response = await apiClient.get<Order>(`/orders/${orderId}`, {
        params: {
          tenantId,
          ...(organizationId && { organizationId }),
        },
      });
      return response.data;
    },
    enabled: !!tenantId && !!orderId,
    staleTime: 1000 * 60 * 2,
  });
};

/** Créer une commande - POST /api/v1/orders */
export const useCreateOrder = (tenantId?: string, organizationId?: string) => {
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");

      const response = await apiClient.post<Order>("/orders", input, {
        params: { tenantId, organizationId },
      });
      return response.data;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.all(tenantId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Create order error:", apiError);
    },
  });
};

/** Modifier une commande - PATCH /api/v1/orders/{id} */
export const useUpdateOrder = (tenantId?: string, organizationId?: string) => {
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateOrderInput & { id: string }) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!id) throw new Error("No order ID provided");

      const response = await apiClient.patch<Order>(`/orders/${id}`, input, {
        params: {
          tenantId,
          ...(organizationId && { organizationId }),
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(tenantId, variables.id),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Update order error:", apiError);
    },
  });
};

/** Supprimer une commande (soft) - DELETE /api/v1/orders/{id} */
export const useDeleteOrder = (tenantId?: string, organizationId?: string) => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!orderId) throw new Error("No order ID provided");

      await apiClient.delete(`/orders/${orderId}`, {
        params: {
          tenantId,
          ...(organizationId && { organizationId }),
        },
      });
    },
    onSuccess: (_, orderId) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(tenantId, orderId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Delete order error:", apiError);
    },
  });
};

/** Confirmer une commande (stock, mouvements, écriture financière) - POST /api/v1/orders/{id}/confirm */
export const useConfirmOrder = (tenantId?: string, organizationId?: string) => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!orderId) throw new Error("No order ID provided");

      const response = await apiClient.post<Order>(
        `/orders/${orderId}/confirm`,
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
          queryKey: queryKeys.orders.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(tenantId, orderId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Confirm order error:", apiError);
    },
  });
};

/** Annuler une commande - POST /api/v1/orders/{id}/cancel */
export const useCancelOrder = (tenantId?: string, organizationId?: string) => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!orderId) throw new Error("No order ID provided");

      const response = await apiClient.post<Order>(
        `/orders/${orderId}/cancel`,
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
          queryKey: queryKeys.orders.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(tenantId, orderId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Cancel order error:", apiError);
    },
  });
};

/** Créer une livraison pour une commande confirmée - POST /api/v1/orders/{id}/deliveries */
export const useCreateDelivery = (
  tenantId?: string,
  orderId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (_input?: Record<string, unknown>) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!orderId) throw new Error("No order ID provided");

      const response = await apiClient.post<Delivery>(
        `/orders/${orderId}/deliveries`,
        _input ?? {},
        {
          params: {
            tenantId,
            ...(organizationId && { organizationId }),
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, __, context) => {
      if (tenantId && orderId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(tenantId, orderId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Create delivery error:", apiError);
    },
  });
};

/** Mettre à jour le statut d'une livraison - PATCH /api/v1/orders/deliveries/{deliveryId}/status */
export const useUpdateDeliveryStatus = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async ({
      deliveryId,
      status,
    }: {
      deliveryId: string;
      status: DeliveryStatus;
    }) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!deliveryId) throw new Error("No delivery ID provided");

      const response = await apiClient.patch<Delivery>(
        `/orders/deliveries/${deliveryId}/status`,
        { status },
        {
          params: {
            tenantId,
            ...(organizationId && { organizationId }),
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.all(tenantId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Update delivery status error:", apiError);
    },
  });
}
