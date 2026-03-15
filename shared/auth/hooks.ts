import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient, extractApiError } from "../api/axios";
import { useAuthStore } from "./store";
import { useTenantStore } from "../tenant/store";
import { queryClient, queryKeys } from "../api/react-query";
import type { User, AuthTokens } from "../types";
import { UserRole } from "../types";
import { z } from "zod";

// Schémas de validation Zod
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
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
  user: {
    id: string;
    name?: string;
    email: string;
    tenantId: string;
    emailVerifiedAt?: string | null;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    referralCode?: string;
  };
  accessToken: string;
  expiresIn: string;
}

const mapApiUserToUser = (apiUser: LoginResponse["user"]): User => {
  const fullName = apiUser.name || "";
  const parts = fullName.trim().split(" ").filter(Boolean);
  const firstName = apiUser.firstName || parts[0] || fullName || apiUser.email;
  const lastName = apiUser.lastName || parts.slice(1).join(" ");

  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName,
    lastName: lastName || "",
    tenantId: apiUser.tenantId,
    role: apiUser.role ?? UserRole.USER,
    referralCode: apiUser.referralCode,
  };
};

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
      if (!data.user.emailVerifiedAt) return;
      const user = mapApiUserToUser(data.user);
      const tokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: "",
      };
      setAuthState(user, tokens);
      queryClient.setQueryData(queryKeys.auth.user, user);
      router.push("/organizations/select");
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
      if (!data.user.emailVerifiedAt) return;
      const user = mapApiUserToUser(data.user);
      const tokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: "",
      };
      setAuthState(user, tokens);
      queryClient.setQueryData(queryKeys.auth.user, user);
      router.push("/organizations/select");
    },
  });
};

/** Nom du cookie indiquant qu'une organisation a été sélectionnée (à effacer au logout) */
const COOKIE_ORG_SELECTED = "gesticash_org_selected";

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
      clearAuthState();
      clearTenant();
      queryClient.clear();
      if (typeof document !== "undefined") {
        document.cookie = `${COOKIE_ORG_SELECTED}=; path=/; max-age=0`;
      }
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

/** Mot de passe oublié – POST /api/v1/auth/forgot-password – body: { email }, réponse 204 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      await apiClient.post("/auth/forgot-password", { email: data.email });
      // 204 No Content : pas de body
    },
  });
};

/** Critères mot de passe (notice « Nouveau mot de passe ») : 8+ caractères, majuscule, minuscule, chiffre */
const PASSWORD_MIN_LENGTH = 8;
const hasUppercase = (s: string) => /[A-Z]/.test(s);
const hasLowercase = (s: string) => /[a-z]/.test(s);
const hasDigit = (s: string) => /\d/.test(s);

/** Réinitialiser le mot de passe – POST /api/v1/auth/reset-password – body: { token, password }, 204 ou 400 (token invalide/expiré) */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token requis"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "Le mot de passe doit contenir au moins 8 caractères")
      .refine(hasUppercase, "Le mot de passe doit contenir une lettre majuscule")
      .refine(hasLowercase, "Le mot de passe doit contenir une lettre minuscule")
      .refine(hasDigit, "Le mot de passe doit contenir un chiffre"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      await apiClient.post("/auth/reset-password", {
        token: data.token,
        password: data.password,
      });
      // 204 No Content
    },
  });
};

/** Vérification email – POST /api/v1/auth/verify-email – body: { token }, 204 ou 400 (token invalide/expiré) */
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      await apiClient.post("/auth/verify-email", { token: data.token });
    },
  });
};

/** Renvoyer l'email de vérification – POST /api/v1/auth/resend-verification – body: { email } */
export const useResendVerification = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      await apiClient.post("/auth/resend-verification", { email: data.email });
    },
  });
};
