import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, extractApiError } from "../api/axios";
import { queryClient, queryKeys } from "../api/react-query";

export interface Organization {
  id: string;
  tenant_id: string;
  name: string;
  code: string | null;
  country_id: string | null;
  city_id: string | null;
  address: string | null;
  is_default: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateOrganizationInput {
  name: string;
  code: string;
  country_id: string;
  city_id: string;
  address: string;
  is_default: boolean;
}

// Récupérer les organisations du tenant courant
export const useOrganizations = (tenantId?: string) => {
  return useQuery({
    queryKey: tenantId ? queryKeys.organizations.list(tenantId) : ["organizations", "null"],
    queryFn: async () => {
      if (!tenantId) {
        throw new Error("No tenant ID provided");
      }

      // L'API attend /api/v1/organizations?tenantId=...
      const response = await apiClient.get<Organization[]>("/organizations", {
        params: { tenantId },
      });

      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5,
    // Éviter les relances multiples : pas de refetch au remontage ni au focus
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Créer une nouvelle organisation pour le tenant courant
export const useCreateOrganization = (tenantId?: string) => {
  return useMutation({
    mutationFn: async (input: CreateOrganizationInput) => {
      if (!tenantId) {
        throw new Error("No tenant ID provided");
      }

      const response = await apiClient.post<Organization>(
        "/organizations",
        input,
        {
          params: { tenantId },
        }
      );

      return response.data;
    },
    onSuccess: (_, __, context) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.organizations.list(tenantId),
        });
      }
      return context;
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Create organization error:", apiError);
    },
  });
};

