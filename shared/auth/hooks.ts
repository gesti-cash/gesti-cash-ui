import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient, extractApiError } from "../api/axios";
import { useAuthStore } from "./store";
import { useTenantStore } from "../tenant/store";
import { queryClient, queryKeys } from "../api/react-query";
import type { User, AuthTokens } from "../types";
import { z } from "zod";

// Schémas de validation Zod
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  tenantSlug: z.string().min(1, "Le tenant est requis"),
});

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  tenantSlug: z.string().min(1, "Le tenant est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Hook pour la connexion
export const useLogin = () => {
  const router = useRouter();
  const { login: setAuthState } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setAuthState(data.user, data.tokens);
      queryClient.setQueryData(queryKeys.auth.user, data.user);
      router.push("/dashboard");
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Login error:", apiError);
    },
  });
};

// Hook pour l'inscription
export const useRegister = () => {
  const router = useRouter();
  const { login: setAuthState } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const response = await apiClient.post<LoginResponse>("/auth/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuthState(data.user, data.tokens);
      queryClient.setQueryData(queryKeys.auth.user, data.user);
      router.push("/dashboard");
    },
    onError: (error) => {
      const apiError = extractApiError(error);
      console.error("Register error:", apiError);
    },
  });
};

// Hook pour la déconnexion
export const useLogout = () => {
  const router = useRouter();
  const { logout: clearAuthState } = useAuthStore();
  const { clearTenant } = useTenantStore();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSettled: () => {
      // Nettoyer le state même en cas d'erreur
      clearAuthState();
      clearTenant();
      queryClient.clear();
      router.push("/login");
    },
  });
};

// Hook pour récupérer l'utilisateur actuel
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: async () => {
      const response = await apiClient.get<User>("/auth/me");
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook pour vérifier la session
export const useSession = () => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const response = await apiClient.get<{ valid: boolean }>("/auth/session");
      return response.data;
    },
    enabled: isAuthenticated && !!tokens,
    refetchInterval: 1000 * 60 * 5, // Vérifier toutes les 5 minutes
  });
};

// Hook pour mettre à jour le profil
export const useUpdateProfile = () => {
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiClient.patch<User>("/auth/profile", data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data);
      queryClient.setQueryData(queryKeys.auth.user, data);
    },
  });
};

// Hook pour changer le mot de passe
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiClient.post("/auth/change-password", data);
      return response.data;
    },
  });
};
