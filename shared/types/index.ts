// Types de base pour l'application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  tenantId: string;
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logo?: string;
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  currency: string;
  language: string;
  timezone: string;
  dateFormat: string;
  features: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TenantState {
  tenant: Tenant | null;
  isLoading: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type Locale = "en" | "fr";
