"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/**
 * Force la classe de thème sur <html> pour que le mode clair/sombre
 * soit bien appliqué (notamment avec Tailwind darkMode: "class").
 * next-themes peut ne pas mettre à jour le DOM correctement dans l'App Router.
 */
export function ThemeUpdater() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (!resolvedTheme) return;
    // Tailwind darkMode: "class" : .dark active le mode sombre
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  return null;
}
