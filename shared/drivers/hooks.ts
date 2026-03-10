import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, extractApiError } from "../api/axios";
import { queryClient, queryKeys } from "../api/react-query";

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  vehicle_type?: string | null;
  vehicle_plate?: string | null;
  organization_id: string;
  is_active?: boolean;
  tenant_id?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateDriverInput {
  first_name: string;
  last_name: string;
  phone: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  organization_id: string;
  is_active?: boolean;
}

/** Champs modifiables pour PATCH (tous optionnels) */
export interface UpdateDriverInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  organization_id?: string;
  is_active?: boolean;
}

/** Liste des chauffeurs - GET /api/v1/drivers */
export const useDrivers = (
  tenantId?: string,
  organizationId?: string
) => {
  return useQuery({
    queryKey: tenantId
      ? queryKeys.drivers.list(tenantId, { organizationId })
      : ["drivers", "null"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");

      const response = await apiClient.get<Driver[]>("/drivers", {
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

/** Détail d'un chauffeur - GET /api/v1/drivers/{id} */
export const useDriver = (
  tenantId: string | undefined,
  driverId: string | undefined,
  organizationId?: string
) => {
  return useQuery({
    queryKey:
      tenantId && driverId
        ? queryKeys.drivers.detail(tenantId, driverId)
        : ["drivers", "null", "detail"],
    queryFn: async () => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!driverId) throw new Error("No driver ID provided");

      const response = await apiClient.get<Driver>(
        `/drivers/${driverId}`,
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
    enabled: !!tenantId && !!driverId,
    staleTime: 1000 * 60 * 5,
  });
};

/** Créer un chauffeur - POST /api/v1/drivers */
export const useCreateDriver = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (input: CreateDriverInput) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!organizationId) throw new Error("No organization ID provided");

      const response = await apiClient.post<Driver>("/drivers", input, {
        params: { tenantId },
      });

      return response.data;
    },
    onSuccess: () => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.drivers.all(tenantId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Create driver error:", apiError);
    },
  });
};

/** Modifier un chauffeur - PATCH /api/v1/drivers/{id} */
export const useUpdateDriver = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateDriverInput & { id: string }) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!id) throw new Error("No driver ID provided");

      const response = await apiClient.patch<Driver>(
        `/drivers/${id}`,
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
          queryKey: queryKeys.drivers.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.drivers.detail(tenantId, variables.id),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Update driver error:", apiError);
    },
  });
};

/** Supprimer un chauffeur (soft) - DELETE /api/v1/drivers/{id} */
export const useDeleteDriver = (
  tenantId?: string,
  organizationId?: string
) => {
  return useMutation({
    mutationFn: async (driverId: string) => {
      if (!tenantId) throw new Error("No tenant ID provided");
      if (!driverId) throw new Error("No driver ID provided");

      await apiClient.delete(`/drivers/${driverId}`, {
        params: {
          tenantId,
          ...(organizationId != null &&
            organizationId !== "" && { organizationId }),
        },
      });
    },
    onSuccess: (_, driverId) => {
      if (tenantId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.drivers.all(tenantId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.drivers.detail(tenantId, driverId),
        });
      }
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Delete driver error:", apiError);
    },
  });
};
