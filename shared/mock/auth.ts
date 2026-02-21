/**
 * Système d'authentification Mock
 * Permet de se connecter avec des credentials fake pour tester l'application
 */

import { simulateApiCall, isMockEnabled } from "../config/mock";
import type { User, AuthTokens, Tenant } from "../types";
import { UserRole } from "../types";

// ============================================
// Utilisateurs fake prédéfinis
// ============================================

export const MOCK_USERS = {
  admin: {
    id: "mock-admin-001",
    email: "admin@gesticash.com",
    password: "admin123", // Mot de passe simple pour les tests
    firstName: "Admin",
    lastName: "GestiCash",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    role: UserRole.ADMIN,
    tenantId: "tenant-default-123",
  },
  manager: {
    id: "mock-manager-001",
    email: "manager@gesticash.com",
    password: "manager123",
    firstName: "Manager",
    lastName: "Test",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager",
    role: UserRole.MANAGER,
    tenantId: "tenant-default-123",
  },
  user: {
    id: "mock-user-001",
    email: "user@gesticash.com",
    password: "user123",
    firstName: "User",
    lastName: "Test",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    role: UserRole.USER,
    tenantId: "tenant-default-123",
  },
} as const;

// Tenant fake par défaut
export const MOCK_TENANT: Tenant = {
  id: "tenant-default-123",
  name: "GestiCash Demo",
  slug: "demo",
  domain: "demo.gesticash.com",
  logo: "/logo/logo.png",
  settings: {
    currency: "XOF",
    language: "fr",
    timezone: "Africa/Dakar",
    dateFormat: "DD/MM/YYYY",
    features: ["transactions", "products", "cod", "customers", "dashboard"],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// Fonctions de génération de tokens
// ============================================

function generateMockToken(): string {
  return `mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

function generateAuthTokens(): AuthTokens {
  return {
    accessToken: generateMockToken(),
    refreshToken: generateMockToken(),
  };
}

// ============================================
// API Mock d'authentification
// ============================================

export const mockAuthAPI = {
  /**
   * Connexion avec email/password
   */
  login: async (email: string, password: string, tenantSlug?: string): Promise<{
    user: User;
    tokens: AuthTokens;
    tenant: Tenant;
  }> => {
    return simulateApiCall(() => {
      // Chercher l'utilisateur
      const userKey = Object.keys(MOCK_USERS).find(
        (key) => MOCK_USERS[key as keyof typeof MOCK_USERS].email === email
      ) as keyof typeof MOCK_USERS | undefined;

      if (!userKey) {
        throw new Error("Email ou mot de passe incorrect");
      }

      const mockUser = MOCK_USERS[userKey];

      // Vérifier le mot de passe
      if (mockUser.password !== password) {
        throw new Error("Email ou mot de passe incorrect");
      }

      // Créer l'utilisateur avec le bon format
      const user: User = {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        avatar: mockUser.avatar,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
      };

      // Générer les tokens
      const tokens = generateAuthTokens();

      return {
        user,
        tokens,
        tenant: MOCK_TENANT,
      };
    });
  },

  /**
   * Inscription (crée un nouvel utilisateur mock)
   */
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantSlug: string;
  }): Promise<{
    user: User;
    tokens: AuthTokens;
    tenant: Tenant;
  }> => {
    return simulateApiCall(() => {
      // Vérifier si l'email existe déjà
      const existingUser = Object.values(MOCK_USERS).find(
        (u) => u.email === data.email
      );

      if (existingUser) {
        throw new Error("Cet email est déjà utilisé");
      }

      // Créer un nouvel utilisateur
      const newUser: User = {
        id: `mock-user-${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRole.USER, // Par défaut USER
        tenantId: MOCK_TENANT.id,
      };

      const tokens = generateAuthTokens();

      return {
        user: newUser,
        tokens,
        tenant: MOCK_TENANT,
      };
    });
  },

  /**
   * Récupérer l'utilisateur actuel
   */
  getCurrentUser: async (): Promise<User> => {
    return simulateApiCall(() => {
      // En mode mock, on retourne l'admin par défaut
      // En production, ça viendrait du token JWT
      const mockUser = MOCK_USERS.admin;
      return {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        avatar: mockUser.avatar,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
      };
    });
  },

  /**
   * Déconnexion
   */
  logout: async (): Promise<void> => {
    return simulateApiCall(() => {
      // En mode mock, on ne fait rien côté serveur
      // Le nettoyage se fait côté client
      return;
    });
  },

  /**
   * Vérifier la session
   */
  checkSession: async (): Promise<{ valid: boolean }> => {
    return simulateApiCall(() => {
      // En mode mock, la session est toujours valide
      return { valid: true };
    });
  },
};

// ============================================
// Credentials de test à afficher
// ============================================

export const MOCK_CREDENTIALS = {
  admin: {
    email: MOCK_USERS.admin.email,
    password: MOCK_USERS.admin.password,
    role: "Administrateur",
    description: "Accès complet à toutes les fonctionnalités",
  },
  manager: {
    email: MOCK_USERS.manager.email,
    password: MOCK_USERS.manager.password,
    role: "Manager",
    description: "Accès à la gestion et aux rapports",
  },
  user: {
    email: MOCK_USERS.user.email,
    password: MOCK_USERS.user.password,
    role: "Utilisateur",
    description: "Accès limité aux fonctionnalités de base",
  },
} as const;
