/**
 * Synchronise les tokens d'auth en cookie pour que le middleware Next.js
 * puisse autoriser l'accès aux routes protégées (ex: /dashboard).
 * Les tokens restent aussi dans le store (localStorage) pour les appels API.
 */

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const ACCESS_MAX_AGE = 60 * 60 * 24; // 1 jour (aligné avec la vérification middleware)
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

export function setAuthCookies(accessToken: string, refreshToken: string): void {
  if (typeof document === "undefined") return;
  const opts = "path=/; SameSite=Lax";
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(accessToken)}; ${opts}; max-age=${ACCESS_MAX_AGE}`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(refreshToken)}; ${opts}; max-age=${REFRESH_MAX_AGE}`;
}

export function clearAuthCookies(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`;
}
