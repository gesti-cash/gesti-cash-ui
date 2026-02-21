"use client";

import { useEffect } from "react";
import { useAuthStore } from "../auth/store";
import { useCurrentUser } from "../auth/hooks";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, setLoading } = useAuthStore();
  
  // Charger l'utilisateur courant si authentifié
  const { data: user, isLoading, error } = useCurrentUser();

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Si erreur lors du chargement de l'utilisateur, le déconnecter
  useEffect(() => {
    if (error && isAuthenticated) {
      useAuthStore.getState().logout();
    }
  }, [error, isAuthenticated]);

  return <>{children}</>;
}
