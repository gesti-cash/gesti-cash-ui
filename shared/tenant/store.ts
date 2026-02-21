import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Tenant } from "../types";

interface TenantStore {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTenant: (tenant: Tenant | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateTenant: (tenant: Partial<Tenant>) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set, get) => ({
      tenant: null,
      isLoading: false,
      error: null,

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
    }),
    {
      name: "tenant-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tenant: state.tenant,
      }),
    }
  )
);

// Hooks utilitaires
export const useTenant = () => useTenantStore((state) => state.tenant);
export const useTenantId = () => useTenantStore((state) => state.tenant?.id);
export const useTenantSlug = () => useTenantStore((state) => state.tenant?.slug);
