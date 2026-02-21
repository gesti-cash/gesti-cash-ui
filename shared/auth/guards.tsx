"use client";

import { useEffect, ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./store";
import { useTenantStore } from "../tenant/store";
import { UserRole } from "../types";

// Props pour les composants protégés
interface WithAuthProps {
  fallback?: React.ReactNode;
}

// HOC pour protéger les routes authentifiées
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options?: {
    redirectTo?: string;
    fallback?: React.ReactNode;
  }
) {
  return function ProtectedComponent(props: P & WithAuthProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(options?.redirectTo || "/login");
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return options?.fallback || <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

// HOC pour protéger les routes par rôle
export function withRole<P extends object>(
  Component: ComponentType<P>,
  allowedRoles: UserRole[],
  options?: {
    redirectTo?: string;
    fallback?: React.ReactNode;
  }
) {
  return function RoleProtectedComponent(props: P & WithAuthProps) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push("/login");
        } else if (user && !allowedRoles.includes(user.role)) {
          router.push(options?.redirectTo || "/unauthorized");
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
      return options?.fallback || <div>Loading...</div>;
    }

    if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
      return null;
    }

    return <Component {...props} />;
  };
}

// HOC pour protéger les routes nécessitant un tenant
export function withTenant<P extends object>(
  Component: ComponentType<P>,
  options?: {
    redirectTo?: string;
    fallback?: React.ReactNode;
  }
) {
  return function TenantProtectedComponent(props: P & WithAuthProps) {
    const router = useRouter();
    const { tenant, isLoading } = useTenantStore();

    useEffect(() => {
      if (!isLoading && !tenant) {
        router.push(options?.redirectTo || "/tenant-required");
      }
    }, [tenant, isLoading, router]);

    if (isLoading) {
      return options?.fallback || <div>Loading tenant...</div>;
    }

    if (!tenant) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Hook pour vérifier les permissions
export function useHasRole(roles: UserRole[]): boolean {
  const user = useAuthStore((state) => state.user);
  if (!user) return false;
  return roles.includes(user.role);
}

// Hook pour vérifier si l'utilisateur est admin
export function useIsAdmin(): boolean {
  return useHasRole([UserRole.ADMIN]);
}

// Hook pour vérifier si l'utilisateur est manager ou admin
export function useIsManager(): boolean {
  return useHasRole([UserRole.ADMIN, UserRole.MANAGER]);
}

// Composant Guard pour utilisation dans le JSX
interface GuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
  requireAuth?: boolean;
  requireTenant?: boolean;
  fallback?: React.ReactNode;
}

export function Guard({
  children,
  roles,
  requireAuth = true,
  requireTenant = false,
  fallback = null,
}: GuardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { tenant } = useTenantStore();

  // Vérifier l'authentification
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Vérifier le rôle
  if (roles && user && !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // Vérifier le tenant
  if (requireTenant && !tenant) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
