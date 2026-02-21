"use client";

import { QueryProvider } from "./query-provider";
import { TenantProvider } from "./tenant-provider";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";
import { ThemeUpdater } from "@/shared/components/theme-updater";

interface AppProvidersProps {
  children: React.ReactNode;
  tenantSlug: string | null;
}

export function AppProviders({ children, tenantSlug }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
      storageKey="gesticash-theme"
    >
      <ThemeUpdater />
      <QueryProvider>
        <TenantProvider tenantSlug={tenantSlug}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TenantProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

// Export des providers individuels
export { QueryProvider } from "./query-provider";
export { TenantProvider } from "./tenant-provider";
export { AuthProvider } from "./auth-provider";
export { ThemeProvider } from "./theme-provider";