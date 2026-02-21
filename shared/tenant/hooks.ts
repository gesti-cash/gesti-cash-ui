import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient, extractApiError } from "../api/axios";
import { useTenantStore } from "./store";
import { queryClient, queryKeys } from "../api/react-query";
import type { Tenant } from "../types";

// Hook pour charger le tenant courant depuis le slug
export const useLoadTenant = (slug: string | null) => {
  const { setTenant, setError } = useTenantStore();

  const query = useQuery({
    queryKey: slug ? queryKeys.tenant.current(slug) : ["tenant", "null"],
    queryFn: async () => {
      if (!slug) {
        throw new Error("No tenant slug provided");
      }

      const response = await apiClient.get<Tenant>(`/tenants/slug/${slug}`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Gérer le succès et l'erreur avec useEffect
  useEffect(() => {
    if (query.data) {
      setTenant(query.data);
    }
  }, [query.data, setTenant]);

  useEffect(() => {
    if (query.error) {
      const apiError = extractApiError(query.error);
      setError(apiError.message);
      // Ne logger que si ce n'est pas une erreur "No tenant slug"
      if (apiError.message !== "No tenant slug provided") {
        console.error("Tenant loading error:", apiError);
      }
    }
  }, [query.error, setError]);

  return query;
};

// Hook pour récupérer les paramètres du tenant
export const useTenantSettings = (tenantId: string | undefined) => {
  return useQuery({
    queryKey: tenantId ? queryKeys.tenant.settings(tenantId) : ["tenant", "settings", "null"],
    queryFn: async () => {
      if (!tenantId) {
        throw new Error("No tenant ID provided");
      }

      const response = await apiClient.get(`/tenants/${tenantId}/settings`);
      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook pour mettre à jour le tenant
export const useUpdateTenant = () => {
  const { updateTenant } = useTenantStore();

  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Tenant> }) => {
      const response = await apiClient.patch<Tenant>(
        `/tenants/${data.id}`,
        data.updates
      );
      return response.data;
    },
    onSuccess: (data) => {
      updateTenant(data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.current(data.slug),
      });
    },
  });
};

// Hook pour mettre à jour les paramètres du tenant
export const useUpdateTenantSettings = () => {
  const { tenant, updateTenant } = useTenantStore();

  return useMutation({
    mutationFn: async (settings: Partial<Tenant["settings"]>) => {
      if (!tenant?.id) {
        throw new Error("No tenant loaded");
      }

      const response = await apiClient.patch(
        `/tenants/${tenant.id}/settings`,
        settings
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (tenant) {
        updateTenant({ settings: data });
        queryClient.invalidateQueries({
          queryKey: queryKeys.tenant.settings(tenant.id),
        });
      }
    },
  });
};

// Hook pour obtenir le tenant courant depuis le store
export const useCurrentTenant = () => {
  return useTenantStore((state) => state.tenant);
};

// Hook pour vérifier si un tenant est chargé
export const useIsTenantLoaded = () => {
  return useTenantStore((state) => !!state.tenant && !state.isLoading);
};
