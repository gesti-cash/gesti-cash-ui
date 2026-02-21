/**
 * Export principal de tous les modules shared
 * Permet d'importer facilement depuis n'importe où dans l'app
 * 
 * Exemple:
 * import { useLogin, apiClient, UserRole } from '@/shared';
 */

// API
export * from "./api";

// Auth
export * from "./auth";

// Tenant
export * from "./tenant";

// Types
export * from "./types";

// Constants
export * from "./constants";

// Utils
export * from "./utils";

// Config
export { env, getApiUrl, getAppUrl, getTenantFromDomain } from "./config/env";

// Mock Data (pour le développement sans API)
export * from "./mock";

// Providers (pour les réexports si besoin)
export { AppProviders, QueryProvider, TenantProvider, AuthProvider } from "./providers";
