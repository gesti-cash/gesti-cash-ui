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

/** Cookie indiquant qu'une organisation a déjà été sélectionnée (évite écran "Organisation requise" pendant réhydratation) */
const COOKIE_ORG_SELECTED = "gesticash_org_selected";

function hasOrgSelectedCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(COOKIE_ORG_SELECTED + "=1");
}

// Routes publiques qui ne nécessitent pas de tenant
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  // Sélection / création d'organisation doit être accessible sans tenant
  "/organizations/select",
];

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
    // Laisser passer si un tenant est déjà en store (sélection sur /organizations/select ou mock)
    if (tenant) {
      return <>{children}</>;
    }
    
    // Cookie présent = utilisateur a déjà sélectionné une org (store peut ne pas être réhydraté encore)
    if (hasOrgSelectedCookie()) {
      return <>{children}</>;
    }
    
    // En mode mock, laisser passer (le layout ou l'effet chargera le tenant mock)
    if (isMockEnabled()) {
      return <>{children}</>;
    }
    
    // Sinon, afficher une page pour sélectionner une organisation ou utiliser le sous-domaine
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <div className="mb-4 text-6xl">🏢</div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Organisation requise
          </h1>
          <p className="mb-4 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            Pour accéder au tableau de bord, une organisation doit être associée à votre accès.
          </p>
          {isMockEnabled() ? (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-left">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                Mode développement activé
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Connectez-vous depuis la page de connexion : une organisation de démonstration sera chargée automatiquement après authentification.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                Utilisez l’URL de votre organisation (sous-domaine) :
              </p>
              <code className="block rounded-lg bg-zinc-100 dark:bg-zinc-700/80 px-4 py-2.5 text-sm font-mono text-zinc-800 dark:text-zinc-200">
                nom-org.localhost:3000
              </code>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                Exemple en local : <strong>monentreprise.localhost:3000</strong> ou <strong>demo.localhost:3000</strong>
              </p>
            </>
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
