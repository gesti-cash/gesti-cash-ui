import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, extractApiError } from "../api/axios";
import { queryClient, queryKeys } from "../api/react-query";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  organization_id: string;
  tenant_id?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  organization_id: string;
}

/** Champs modifiables pour PATCH (tous optionnels) */
export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  organization_id?: string;
}

/** Liste des clients - GET /api/v1/customers */
export const useCustomers = (
  tenantId?: string,
  organizationId?: string
) => {
  return useQuery({
    queryKey: tenantId
      ? queryKeys.customers.list(tenantId, { organizationId })
      : ["customers", "null"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");

      const response = await apiClient.get<Customer[]>("/customers", {
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
    refetchOnWindowFocus: false,
  });
};

/** Détail d'un client - GET /api/v1/customers/{id} */
export const useCustomer = (
  tenantId: string | undefined,
  customerId: string | undefined,
  organizationId?: string
) => {
  return useQuery({
    queryKey:
      tenantId && customerId
        ? queryKeys.customers.detail(tenantId, customerId)
        : ["customers", "null", "detail"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!customerId) throw new Error("No customer ID provided");

      const response = await apiClient.get<Customer>(
        `/customers/${customerId}`,
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
    enabled: !!tenantId && !!customerId,
    staleTime: 1000 * 60 * 5,
  });
};

/** Créer un client - POST /api/v1/customers */
export const useCreateCustomer = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (input: CreateCustomerInput) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");

      const response = await apiClient.post<Customer>("/customers", input, {
        params: { tenantId },
      });

      return response.data;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.customers.all(tenantId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Create customer error:", apiError);
    },
  });
};

/** Modifier un client - PATCH /api/v1/customers/{id} */
export const useUpdateCustomer = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateCustomerInput & { id: string }) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!id) throw new Error("No customer ID provided");

      const response = await apiClient.patch<Customer>(
        `/customers/${id}`,
        input,
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
          queryKey: queryKeys.customers.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.customers.detail(tenantId, variables.id),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Update customer error:", apiError);
    },
  });
};

/** Supprimer un client (soft) - DELETE /api/v1/customers/{id} */
export const useDeleteCustomer = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (customerId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!customerId) throw new Error("No customer ID provided");

      await apiClient.delete(`/customers/${customerId}`, {
        params: {
          tenantId,
          ...(organizationId != null &&
            organizationId !== "" && { organizationId }),
        },
      });
    },
    onSuccess: (_, customerId) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.customers.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.customers.detail(tenantId, customerId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Delete customer error:", apiError);
    },
  });
};
