import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, extractApiError } from "../api/axios";
import { queryClient, queryKeys } from "../api/react-query";

export interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  organization_id: string;
  tenant_id?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateSupplierInput {
  name: string;
  phone: string;
  address?: string;
  organization_id: string;
}

/** Champs modifiables pour PATCH (tous optionnels) */
export interface UpdateSupplierInput {
  name?: string;
  phone?: string;
  address?: string;
  organization_id?: string;
}

/** Liste des fournisseurs - GET /api/v1/suppliers */
export const useSuppliers = (
  tenantId?: string,
  organizationId?: string
) => {
  return useQuery({
    queryKey: tenantId
      ? queryKeys.suppliers.list(tenantId, { organizationId })
      : ["suppliers", "null"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");

      const response = await apiClient.get<Supplier[]>("/suppliers", {
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

/** Détail d'un fournisseur - GET /api/v1/suppliers/{id} */
export const useSupplier = (
  tenantId: string | undefined,
  supplierId: string | undefined,
  organizationId?: string
) => {
  return useQuery({
    queryKey:
      tenantId && supplierId
        ? queryKeys.suppliers.detail(tenantId, supplierId)
        : ["suppliers", "null", "detail"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!supplierId) throw new Error("No supplier ID provided");

      const response = await apiClient.get<Supplier>(
        `/suppliers/${supplierId}`,
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
    enabled: !!tenantId && !!supplierId,
    staleTime: 1000 * 60 * 5,
  });
};

/** Créer un fournisseur - POST /api/v1/suppliers */
export const useCreateSupplier = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (input: CreateSupplierInput) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");

      const response = await apiClient.post<Supplier>("/suppliers", input, {
        params: { tenantId },
      });

      return response.data;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.suppliers.all(tenantId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Create supplier error:", apiError);
    },
  });
};

/** Modifier un fournisseur - PATCH /api/v1/suppliers/{id} */
export const useUpdateSupplier = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateSupplierInput & { id: string }) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!id) throw new Error("No supplier ID provided");

      const response = await apiClient.patch<Supplier>(
        `/suppliers/${id}`,
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
          queryKey: queryKeys.suppliers.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.suppliers.detail(tenantId, variables.id),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Update supplier error:", apiError);
    },
  });
};

/** Supprimer un fournisseur (soft) - DELETE /api/v1/suppliers/{id} */
export const useDeleteSupplier = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (supplierId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!supplierId) throw new Error("No supplier ID provided");

      await apiClient.delete(`/suppliers/${supplierId}`, {
        params: {
          tenantId,
          ...(organizationId != null &&
            organizationId !== "" && { organizationId }),
        },
      });
    },
    onSuccess: (_, supplierId) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.suppliers.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.suppliers.detail(tenantId, supplierId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Delete supplier error:", apiError);
    },
  });
};
