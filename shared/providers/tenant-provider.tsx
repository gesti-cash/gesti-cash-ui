"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoadTenant } from "../tenant/hooks";
import { useTenantStore } from "../tenant/store";
import { isMockEnabled, MOCK_TENANT } from "../mock";

interface TenantProviderProps {
  children: React.ReactNode;
  tenantSlug: string | null;
}

// Routes publiques qui ne nécessitent pas de tenant
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export function TenantProvider({ children, tenantSlug }: TenantProviderProps) {
  const pathname = usePathname();
  const { tenant, isLoading, setTenant } = useTenantStore();
  
  // IMPORTANT: Tous les hooks doivent être appelés AVANT les early returns
  // Charger le tenant si on a un slug et qu'il n'est pas déjà chargé
  const { data, isLoading: isQueryLoading, error } = useLoadTenant(
    tenantSlug && (!tenant || tenant.slug !== tenantSlug) ? tenantSlug : null
  );
  
  // Si on est sur une route publique et qu'il n'y a pas de tenant, on laisse passer
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  
  // En mode mock, utiliser le tenant mock automatiquement si pas de slug
  useEffect(() => {
    if (isMockEnabled() && !tenantSlug && !isPublicRoute && !tenant) {
      // Charger le tenant mock automatiquement
      setTenant(MOCK_TENANT);
    }
  }, [tenantSlug, isPublicRoute, tenant, setTenant]);
  
  // Si pas de slug et route publique, afficher directement la page (landing, login, etc.)
  if (!tenantSlug && isPublicRoute) {
    return <>{children}</>;
  }
  
  // Si pas de slug sur une route qui nécessite un tenant
  if (!tenantSlug && !isPublicRoute) {
    // En mode mock, on utilise le tenant mock
    if (isMockEnabled() && tenant?.id === MOCK_TENANT.id) {
      return <>{children}</>;
    }
    
    // Sinon, afficher une page d'erreur pour sélectionner/créer un tenant
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-zinc-800">
          <div className="mb-4 text-6xl">🏢</div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Organisation requise
          </h1>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            Pour accéder à cette page, vous devez utiliser votre sous-domaine :<br />
            <code className="mt-2 inline-block rounded bg-zinc-100 px-2 py-1 text-sm dark:bg-zinc-700">
              votre-tenant.localhost:3000
            </code>
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            En développement, utilisez un sous-domaine comme <strong>tenant1.localhost:3000</strong>
          </p>
          {isMockEnabled() && (
            <p className="mt-4 text-sm text-blue-600 dark:text-blue-400">
              💡 Mode mock activé : Le tenant mock sera chargé automatiquement après connexion
            </p>
          )}
        </div>
      </div>
    );
  }

  // Afficher un état de chargement
  if (isLoading || isQueryLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Chargement de l'organisation...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le tenant n'a pas pu être chargé
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-zinc-800">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Organisation introuvable
          </h1>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            L'organisation <strong>{tenantSlug}</strong> n'existe pas ou n'est plus accessible.
          </p>
          <div className="space-y-2 text-sm text-zinc-500 dark:text-zinc-500">
            <p>Vérifiez que :</p>
            <ul className="list-inside list-disc text-left">
              <li>Le nom du sous-domaine est correct</li>
              <li>L'API backend est accessible</li>
              <li>L'organisation existe dans la base de données</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
