import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, extractApiError } from "../api/axios";
import { queryClient, queryKeys } from "../api/react-query";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  sort_order?: number;
  is_active: boolean;
  tenant_id?: string;
  organization_id?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
  is_active: boolean;
}

/** Champs modifiables pour PATCH (tous optionnels) */
export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
}

export const useCategories = (tenantId?: string, organizationId?: string) => {
  return useQuery({
    queryKey: tenantId
      ? queryKeys.categories.list(tenantId, organizationId)
      : ["categories", "null"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");

      const response = await apiClient.get<Category[]>("/categories", {
        params: { tenantId, organizationId },
      });

      return response.data;
    },
    enabled: !!tenantId && !!organizationId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCategory = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");

      const response = await apiClient.post<Category>("/categories", input, {
        params: { tenantId, organizationId },
      });

      return response.data;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.all(tenantId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Create category error:", apiError);
    },
  });
};

/** Modifier une catégorie - PATCH /categories/{id} */
export const useUpdateCategory = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateCategoryInput & { id: string }) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");
      if (!id) throw new Error("No category ID provided");

      const response = await apiClient.patch<Category>(
        `/categories/${id}`,
        input,
        { params: { tenantId, organizationId } }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.detail(tenantId, variables.id),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Update category error:", apiError);
    },
  });
};

/** Supprimer une catégorie - DELETE /categories/{id} */
export const useDeleteCategory = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (categoryId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");
      if (!categoryId) throw new Error("No category ID provided");

      await apiClient.delete(`/categories/${categoryId}`, {
        params: { tenantId, organizationId },
      });
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.all(tenantId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Delete category error:", apiError);
    },
  });
};
