/**
 * Utilitaires pour vérifier l'authentification directement depuis localStorage
 * Utile pour éviter les problèmes de timing avec Zustand persist
 */

export function checkAuthFromStorage(): {
  isAuthenticated: boolean;
  user: any | null;
  tenant: any | null;
} {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    const tenantStorage = localStorage.getItem("tenant-storage");

    let user = null;
    let isAuthenticated = false;
    let tenant = null;

    if (authStorage) {
      const authData = JSON.parse(authStorage);
      user = authData?.state?.user || null;
      isAuthenticated = authData?.state?.isAuthenticated || false;
    }

    if (tenantStorage) {
      const tenantData = JSON.parse(tenantStorage);
      tenant = tenantData?.state?.tenant || null;
    }

    return {
      isAuthenticated,
      user,
      tenant,
    };
  } catch (error) {
    console.error("[auth-check] Erreur lors de la lecture de localStorage:", error);
    return {
      isAuthenticated: false,
      user: null,
      tenant: null,
    };
  }
}

export function hasAuthInStorage(): boolean {
  const { isAuthenticated, user } = checkAuthFromStorage();
  return isAuthenticated && !!user;
}

export function hasTenantInStorage(): boolean {
  const { tenant } = checkAuthFromStorage();
  return !!tenant;
}
