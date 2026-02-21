/**
 * Hooks React Query pour l'authentification Mock
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../auth/store";
import { useTenantStore } from "../tenant/store";
import { queryClient, queryKeys } from "../api/react-query";
import { mockAuthAPI, isMockEnabled } from "./index";
import type { User, AuthTokens, Tenant } from "../types";
import { z } from "zod";

// Schémas de validation
export const mockLoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
  tenantSlug: z.string().optional(),
});

export const mockRegisterSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  tenantSlug: z.string().optional(),
});

export type MockLoginInput = z.infer<typeof mockLoginSchema>;
export type MockRegisterInput = z.infer<typeof mockRegisterSchema>;

interface MockLoginResponse {
  user: User;
  tokens: AuthTokens;
  tenant: Tenant;
}

/**
 * Hook pour la connexion en mode mock
 */
export const useMockLogin = () => {
  const router = useRouter();
  const { login: setAuthState } = useAuthStore();
  const { setTenant } = useTenantStore();

  return useMutation({
    mutationFn: async (credentials: MockLoginInput) => {
      if (!isMockEnabled()) {
        throw new Error("Le mode mock n'est pas activé");
      }
      return await mockAuthAPI.login(
        credentials.email,
        credentials.password,
        credentials.tenantSlug
      );
    },
    onSuccess: (data) => {
      console.log("[MOCK LOGIN] Connexion réussie, données:", data);
      
      // Mettre à jour l'état d'authentification
      setAuthState(data.user, data.tokens);
      console.log("[MOCK LOGIN] Auth state mis à jour");
      
      // Mettre à jour le tenant (IMPORTANT : doit être fait avant la redirection)
      setTenant(data.tenant);
      console.log("[MOCK LOGIN] Tenant state mis à jour:", data.tenant.slug);
      
      // Mettre en cache React Query
      queryClient.setQueryData(queryKeys.auth.user, data.user);
      
      // Forcer la mise à jour du cache React Query pour le tenant
      queryClient.setQueryData(
        queryKeys.tenant.current(data.tenant.slug),
        data.tenant
      );
      console.log("[MOCK LOGIN] React Query cache mis à jour");
      
      // Forcer la synchronisation des stores Zustand avec localStorage
      // En utilisant un délai plus long pour laisser le temps à Zustand persist de sauvegarder
      setTimeout(() => {
        // Vérifier que les données sont bien dans localStorage
        const authStorage = localStorage.getItem("auth-storage");
        const tenantStorage = localStorage.getItem("tenant-storage");
        console.log("[MOCK LOGIN] Vérification localStorage:", {
          auth: authStorage ? "présent" : "absent",
          tenant: tenantStorage ? "présent" : "absent",
        });
        
        if (authStorage && tenantStorage) {
          console.log("[MOCK LOGIN] Redirection vers /dashboard");
          // Utiliser window.location pour forcer une navigation complète
          window.location.href = "/dashboard";
        } else {
          console.warn("[MOCK LOGIN] Les données ne sont pas encore dans localStorage, nouvelle tentative...");
          // Réessayer après un court délai
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 300);
        }
      }, 500);
    },
    onError: (error) => {
      console.error("Mock login error:", error);
    },
  });
};

/**
 * Hook pour l'inscription en mode mock
 */
export const useMockRegister = () => {
  const router = useRouter();
  const { login: setAuthState } = useAuthStore();
  const { setTenant } = useTenantStore();

  return useMutation({
    mutationFn: async (data: MockRegisterInput) => {
      if (!isMockEnabled()) {
        throw new Error("Le mode mock n'est pas activé");
      }
      return await mockAuthAPI.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        tenantSlug: data.tenantSlug || "demo",
      });
    },
    onSuccess: (data) => {
      setAuthState(data.user, data.tokens);
      setTenant(data.tenant);
      queryClient.setQueryData(queryKeys.auth.user, data.user);
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Mock register error:", error);
    },
  });
};

/**
 * Hook pour la déconnexion en mode mock
 */
export const useMockLogout = () => {
  const router = useRouter();
  const { logout: clearAuthState } = useAuthStore();
  const { clearTenant } = useTenantStore();

  return useMutation({
    mutationFn: async () => {
      if (!isMockEnabled()) {
        throw new Error("Le mode mock n'est pas activé");
      }
      return await mockAuthAPI.logout();
    },
    onSettled: () => {
      clearAuthState();
      clearTenant();
      queryClient.clear();
      router.push("/login");
    },
  });
};

/**
 * Hook pour récupérer l'utilisateur actuel en mode mock
 */
export const useMockCurrentUser = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["mock", "auth", "user"],
    queryFn: async () => {
      if (!isMockEnabled()) {
        throw new Error("Le mode mock n'est pas activé");
      }
      return await mockAuthAPI.getCurrentUser();
    },
    enabled: isAuthenticated && isMockEnabled(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook pour vérifier la session en mode mock
 */
export const useMockSession = () => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: ["mock", "auth", "session"],
    queryFn: async () => {
      if (!isMockEnabled()) {
        throw new Error("Le mode mock n'est pas activé");
      }
      return await mockAuthAPI.checkSession();
    },
    enabled: isAuthenticated && !!tokens && isMockEnabled(),
    refetchInterval: 1000 * 60 * 5, // Vérifier toutes les 5 minutes
  });
};
