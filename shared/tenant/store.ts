import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Tenant } from "../types";

/** Organisation sélectionnée par tenant (persistée pour survivre au rechargement) */
export type SelectedOrganizationIdByTenant = Record<string, string>;

interface TenantStore {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  /** organisation_id par tenantId, pour le board (produits, catégories, etc.) */
  selectedOrganizationIdByTenant: SelectedOrganizationIdByTenant;

  // Actions
  setTenant: (tenant: Tenant | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateTenant: (tenant: Partial<Tenant>) => void;
  clearTenant: () => void;
  setSelectedOrganizationId: (tenantId: string, orgId: string | null) => void;
  getSelectedOrganizationId: (tenantId: string) => string | null;
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set, get) => ({
      tenant: null,
      isLoading: false,
      error: null,
      selectedOrganizationIdByTenant: {},

      setTenant: (tenant) => set({ 
        tenant, 
        isLoading: false, 
        error: null 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error, isLoading: false }),
      
      updateTenant: (tenantData) => {
        const currentTenant = get().tenant;
        if (currentTenant) {
          set({ tenant: { ...currentTenant, ...tenantData } });
        }
      },
      
      clearTenant: () => set({ 
        tenant: null, 
        isLoading: false, 
        error: null 
      }),

      setSelectedOrganizationId: (tenantId, orgId) => set((state) => ({
        selectedOrganizationIdByTenant: orgId
          ? { ...state.selectedOrganizationIdByTenant, [tenantId]: orgId }
          : (() => {
              const next = { ...state.selectedOrganizationIdByTenant };
              delete next[tenantId];
              return next;
            })(),
      })),

      getSelectedOrganizationId: (tenantId) => {
        return get().selectedOrganizationIdByTenant[tenantId] ?? null;
      },
    }),
    {
      name: "tenant-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tenant: state.tenant,
        selectedOrganizationIdByTenant: state.selectedOrganizationIdByTenant,
      }),
    }
  )
);

// Hooks utilitaires
export const useTenant = () => useTenantStore((state) => state.tenant);
export const useTenantId = () => useTenantStore((state) => state.tenant?.id);
export const useTenantSlug = () => useTenantStore((state) => state.tenant?.slug);
export const useSetSelectedOrganizationId = () =>
  useTenantStore((state) => state.setSelectedOrganizationId);
export const useSelectedOrganizationId = (tenantId: string | undefined) =>
  useTenantStore((state) => (tenantId ? state.selectedOrganizationIdByTenant[tenantId] ?? null : null));
