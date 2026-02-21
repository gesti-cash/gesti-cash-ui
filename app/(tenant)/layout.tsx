"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTenantStore } from "@/shared/tenant/store";
import { useAuthStore } from "@/shared/auth/store";
import { isMockEnabled, MOCK_TENANT } from "@/shared/mock";
import { checkAuthFromStorage } from "@/shared/utils/auth-check";
import { Sidebar } from "@/shared/components/sidebar";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { tenant, setTenant } = useTenantStore();
  const { isAuthenticated, user } = useAuthStore();
  const mockEnabled = isMockEnabled();
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [storageAuth, setStorageAuth] = useState<{
    isAuthenticated: boolean;
    user: any;
    tenant: any;
  } | null>(null);

  // Forcer la classe de thème sur <html> depuis le tenant (priorité sur next-themes)
  useEffect(() => {
    if (!resolvedTheme) return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  // Re-sync après hydratation au cas où next-themes écrase la classe
  useEffect(() => {
    if (!resolvedTheme) return;
    const t1 = setTimeout(() => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolvedTheme);
    }, 100);
    const t2 = setTimeout(() => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolvedTheme);
    }, 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [resolvedTheme]);

  // Au montage : appliquer le thème depuis localStorage si next-themes n'a pas encore résolu
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("gesticash-theme") : null;
    const theme = stored === "dark" || stored === "light" ? stored : null;
    if (theme) {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
    }
  }, []);

  // Vérifier localStorage directement au montage
  useEffect(() => {
    const authData = checkAuthFromStorage();
    setStorageAuth(authData);
    setCheckedStorage(true);
    console.log("[TenantLayout] Vérification localStorage:", authData);
  }, []);

  // En mode mock, charger automatiquement le tenant mock si authentifié
  useEffect(() => {
    if (mockEnabled && checkedStorage) {
      const hasAuth = storageAuth?.isAuthenticated || isAuthenticated || user;
      if (hasAuth && !tenant) {
        console.log("[TenantLayout] Chargement du tenant mock");
        setTenant(MOCK_TENANT);
      }
    }
  }, [mockEnabled, checkedStorage, storageAuth, isAuthenticated, user, tenant, setTenant]);

  // Rediriger vers login seulement si on est sûr que l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (checkedStorage) {
      const hasAuth = storageAuth?.isAuthenticated || isAuthenticated || user;
      if (!hasAuth) {
        console.log("[TenantLayout] Utilisateur non authentifié, redirection vers /login");
        router.push("/login");
      }
    }
  }, [checkedStorage, storageAuth, isAuthenticated, user, router]);

  // État de chargement initial
  if (!checkedStorage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Vérifier l'authentification depuis localStorage ou store
  const hasAuth = storageAuth?.isAuthenticated || isAuthenticated || user;
  const hasTenant = storageAuth?.tenant || tenant;

  // En mode mock, permettre l'accès si authentifié
  if (mockEnabled) {
    if (hasAuth) {
      // S'assurer que le tenant est chargé
      if (!hasTenant && !tenant) {
        setTenant(MOCK_TENANT);
      }
      return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
          <Sidebar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      );
    }
    // Si pas authentifié, retourner null (le useEffect va rediriger)
    return null;
  }

  // En mode production, vérifier que l'utilisateur est authentifié et a un tenant
  if (!hasAuth || !hasTenant) {
    return null; // Les useEffects vont gérer la redirection
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
