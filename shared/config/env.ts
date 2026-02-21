// Configuration des variables d'environnement

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  isProd: process.env.NODE_ENV === "production",
  isDev: process.env.NODE_ENV === "development",
} as const;

export const getApiUrl = () => env.apiUrl;

export const getAppUrl = () => env.appUrl;

// Extraction du tenant depuis le sous-domaine
export const getTenantFromDomain = (hostname: string): string | null => {
  // Si on est en local, on peut utiliser tenant1.localhost:3000
  // En production: tenant1.gesticash.com
  
  // Retirer le port si présent
  const hostWithoutPort = hostname.split(":")[0];
  
  // Vérifier si c'est une adresse IP (pattern IPv4)
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostWithoutPort);
  
  // Si c'est une IP locale, pas de tenant (pour accès direct à la landing page)
  if (isIpAddress) {
    return null;
  }
  
  const parts = hostWithoutPort.split(".");
  
  // En développement local (localhost)
  if (hostWithoutPort === "localhost" || hostWithoutPort.includes("localhost")) {
    if (parts.length > 1 && parts[0] !== "localhost") {
      return parts[0];
    }
    return null;
  }
  
  // En production (au moins 3 parties: tenant.domain.com)
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
};
