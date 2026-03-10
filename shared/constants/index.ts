/**
 * Constantes de l'application
 */

// Rôles utilisateurs
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
} as const;

// Types de transactions
export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
} as const;

// Devises supportées
export const CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "Dollar américain" },
  { code: "GBP", symbol: "£", name: "Livre sterling" },
  { code: "CHF", symbol: "CHF", name: "Franc suisse" },
] as const;

// Formats de date
export const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "JJ/MM/AAAA (31/12/2024)" },
  { value: "MM/DD/YYYY", label: "MM/JJ/AAAA (12/31/2024)" },
  { value: "YYYY-MM-DD", label: "AAAA-MM-JJ (2024-12-31)" },
] as const;

// Fuseaux horaires principaux
export const TIMEZONES = [
  { value: "Europe/Paris", label: "Europe/Paris (UTC+1)" },
  { value: "Europe/London", label: "Europe/London (UTC+0)" },
  { value: "America/New_York", label: "America/New_York (UTC-5)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (UTC-8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+9)" },
] as const;

// Langues supportées
export const LANGUAGES = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
] as const;

// Pagination par défaut
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Durées de cache (en ms)
export const CACHE_TIMES = {
  SHORT: 1000 * 60 * 2, // 2 minutes
  MEDIUM: 1000 * 60 * 5, // 5 minutes
  LONG: 1000 * 60 * 10, // 10 minutes
  VERY_LONG: 1000 * 60 * 30, // 30 minutes
} as const;

// Routes publiques
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
] as const;

// Routes tenant
export const TENANT_ROUTES = [
  "/dashboard",
  "/finances",
  "/settings",
  "/transactions",
  "/users",
  "/reports",
] as const;

// Status HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Téléphone (format E.164, code pays)
export {
  PHONE_COUNTRY_CODES,
  phoneSchema,
  phoneSchemaOptional,
  PHONE_VALIDATION_MESSAGE,
  normalizePhone,
  isValidE164,
  getCountryCodeFromE164,
  getLocalNumberFromE164,
  formatPhoneDisplay,
} from "./phone";

// Images (accroches auth, base finances)
export {
  AUTH_ACCROCHE_IMAGE,
  FINANCE_BASE_IMAGE,
} from "./images";

// Messages d'erreur communs
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Erreur réseau. Vérifiez votre connexion.",
  SERVER_ERROR: "Erreur serveur. Réessayez plus tard.",
  UNAUTHORIZED: "Non autorisé. Connectez-vous.",
  FORBIDDEN: "Accès interdit.",
  NOT_FOUND: "Ressource introuvable.",
  VALIDATION_ERROR: "Erreur de validation.",
  TENANT_NOT_FOUND: "Organisation introuvable.",
  TENANT_MISMATCH: "Problème d'organisation.",
} as const;
