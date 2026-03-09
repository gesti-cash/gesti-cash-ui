import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getApiUrl } from "../config/env";
import { useAuthStore } from "../auth/store";
import { useTenantStore } from "../tenant/store";
import type { ApiError } from "../types";

// Créer l'instance Axios
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getApiUrl(),
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Intercepteur de requête
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Ajouter le token d'authentification
      const tokens = useAuthStore.getState().tokens;
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }

      // Ajouter le tenant ID dans les headers
      const tenant = useTenantStore.getState().tenant;
      if (tenant?.id) {
        config.headers["X-Tenant-ID"] = tenant.id;
      }

      // Ajouter le tenant slug
      if (tenant?.slug) {
        config.headers["X-Tenant-Slug"] = tenant.slug;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur de réponse
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Gestion de l'erreur 401 (non autorisé)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Tenter de rafraîchir le token
          const tokens = useAuthStore.getState().tokens;
          if (tokens?.refreshToken) {
            const response = await axios.post(`${getApiUrl()}/auth/refresh`, {
              refreshToken: tokens.refreshToken,
            });

            const newTokens = response.data;
            useAuthStore.getState().setTokens(newTokens);

            // Réessayer la requête originale
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            }
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Si le refresh échoue, déconnecter l'utilisateur
          useAuthStore.getState().logout();
          useTenantStore.getState().clearTenant();
          
          // Rediriger vers la page de login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          
          return Promise.reject(refreshError);
        }
      }

      // Gestion de l'erreur 403 (accès interdit - problème de tenant)
      if (error.response?.status === 403) {
        const errorData = error.response.data;
        if (errorData?.code === "TENANT_MISMATCH" || errorData?.code === "TENANT_NOT_FOUND") {
          useTenantStore.getState().clearTenant();
          
          if (typeof window !== "undefined") {
            window.location.href = "/tenant-error";
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Instance Axios par défaut
export const apiClient = createAxiosInstance();

// Helper pour extraire les erreurs API (plusieurs formats possibles : message, detail, error)
export const extractApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; detail?: string; error?: string; statusMessage?: string; code?: string; errors?: Record<string, string[]> }>;
    const data = axiosError.response?.data;
    const status = axiosError.response?.status;

    if (data && typeof data === "object") {
      const message =
        typeof data.message === "string"
          ? data.message
          : typeof data.detail === "string"
            ? data.detail
            : typeof data.error === "string"
              ? data.error
              : typeof data.statusMessage === "string"
                ? data.statusMessage
                : "Une erreur est survenue";
      return {
        message,
        code: data.code,
        statusCode: status,
        errors: data.errors,
      };
    }

    if (axiosError.response && status && status >= 400) {
      return {
        message: axiosError.message || `Erreur HTTP ${status}`,
        statusCode: status,
      };
    }

    return {
      message: axiosError.message || "Erreur réseau",
      statusCode: status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Une erreur inconnue est survenue",
  };
};
