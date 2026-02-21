import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { getTenantFromDomain } from "../config/env";

export type Locale = "en" | "fr";

export const locales: Locale[] = ["en", "fr"];
export const defaultLocale: Locale = "fr";

// Configuration Next-intl avec support multi-tenant
export default getRequestConfig(async () => {
  // Récupérer le hostname depuis les headers
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  
  // Extraire le tenant slug
  const tenantSlug = getTenantFromDomain(hostname);
  
  // La locale peut être définie par:
  // 1. Les paramètres du tenant (à charger depuis l'API)
  // 2. Les préférences utilisateur (stockées en cookie)
  // 3. La locale par défaut
  
  // Pour l'instant, on utilise la locale par défaut
  // TODO: Charger la locale depuis les paramètres du tenant
  const locale = defaultLocale;
  
  // Charger les messages de traduction
  const messages = (await import(`../../messages/${locale}.json`)).default;
  
  return {
    locale,
    messages,
    timeZone: "Europe/Paris", // Peut être configuré par tenant
    now: new Date(),
  };
});

// Helper pour obtenir les messages d'une locale spécifique
export async function getMessages(locale: Locale) {
  return (await import(`../../messages/${locale}.json`)).default;
}
