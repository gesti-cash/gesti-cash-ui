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
