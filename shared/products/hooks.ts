import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, extractApiError } from "../api/axios";
import { queryClient, queryKeys } from "../api/react-query";

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category_id: string;
  tenant_id: string;
  organization_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  price: number;
  category_id: string;
}

/** Champs modifiables pour PATCH (tous optionnels) */
export interface UpdateProductInput {
  name?: string;
  sku?: string;
  price?: number;
  category_id?: string;
}

export interface ProductsListParams {
  page?: number;
  limit?: number;
}

export const useProducts = (
  tenantId?: string,
  organizationId?: string,
  params?: ProductsListParams
) => {
  return useQuery({
    queryKey: tenantId
      ? queryKeys.products.list(tenantId, { organizationId, ...params })
      : ["products", "null"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");

      const response = await apiClient.get<Product[]>("/products", {
        params: {
          tenantId,
          ...(organizationId != null && organizationId !== "" && { organizationId }),
          ...params,
        },
      });

      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateProduct = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");

      const response = await apiClient.post<Product>("/products", input, {
        params: { tenantId, organizationId },
      });

      return response.data;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.all(tenantId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Create product error:", apiError);
    },
  });
};

/** Détail d'un produit - GET /api/v1/products/{id} */
export const useProduct = (
  tenantId: string | undefined,
  productId: string | undefined,
  organizationId?: string
) => {
  return useQuery({
    queryKey:
      tenantId && productId
        ? queryKeys.products.detail(tenantId, productId)
        : ["products", "null", "detail"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!productId) throw new Error("No product ID provided");

      const response = await apiClient.get<Product>(`/products/${productId}`, {
        params: {
          tenantId,
          ...(organizationId != null && organizationId !== "" && { organizationId }),
        },
      });
      return response.data;
    },
    enabled: !!tenantId && !!productId,
    staleTime: 1000 * 60 * 5,
  });
};

/** Modifier un produit - PATCH /api/v1/products/{id} */
export const useUpdateProduct = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateProductInput & { id: string }) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!id) throw new Error("No product ID provided");

      const response = await apiClient.patch<Product>(`/products/${id}`, input, {
        params: {
          tenantId,
          ...(organizationId != null && organizationId !== "" && { organizationId }),
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.detail(tenantId, variables.id),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Update product error:", apiError);
    },
  });
};

/** Supprimer un produit (soft) - DELETE /api/v1/products/{id} */
export const useDeleteProduct = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!productId) throw new Error("No product ID provided");

      await apiClient.delete(`/products/${productId}`, {
        params: {
          tenantId,
          ...(organizationId != null && organizationId !== "" && { organizationId }),
        },
      });
    },
    onSuccess: (_, productId) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.detail(tenantId, productId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Delete product error:", apiError);
    },
  });
};
