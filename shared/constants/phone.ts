import { z } from "zod";

/**
 * Constantes et validation pour les numéros de téléphone (format E.164)
 * Format: +[code pays][numéro], ex: +225 07 00 00 00 00 → +2250700000000
 */

/** Codes pays courants avec indicatif et libellé */
export const PHONE_COUNTRY_CODES = [
  { code: "225", label: "Côte d'Ivoire", dial: "+225" },
  { code: "221", label: "Sénégal", dial: "+221" },
  { code: "223", label: "Mali", dial: "+223" },
  { code: "226", label: "Burkina Faso", dial: "+226" },
  { code: "228", label: "Togo", dial: "+228" },
  { code: "229", label: "Bénin", dial: "+229" },
  { code: "33", label: "France", dial: "+33" },
  { code: "32", label: "Belgique", dial: "+32" },
  { code: "41", label: "Suisse", dial: "+41" },
  { code: "1", label: "USA / Canada", dial: "+1" },
  { code: "44", label: "Royaume-Uni", dial: "+44" },
  { code: "49", label: "Allemagne", dial: "+49" },
  { code: "237", label: "Cameroun", dial: "+237" },
  { code: "234", label: "Nigeria", dial: "+234" },
  { code: "212", label: "Maroc", dial: "+212" },
  { code: "213", label: "Algérie", dial: "+213" },
  { code: "216", label: "Tunisie", dial: "+216" },
] as const;

/** Regex E.164: + suivi de 1 à 3 chiffres (indicatif) puis 8 à 12 chiffres (sans espaces) */
const E164_REGEX = /^\+[1-9]\d{0,3}\d{8,14}$/;

/**
 * Nettoie un numéro (espaces, tirets) et vérifie le format E.164
 */
export function normalizePhone(value: string): string {
  const cleaned = value.replace(/\s+/g, "").replace(/-/g, "").trim();
  if (cleaned.startsWith("00")) return "+" + cleaned.slice(2);
  if (cleaned.startsWith("+")) return cleaned;
  return cleaned ? "+" + cleaned : "";
}

/**
 * Vérifie si une chaîne est un numéro valide au format E.164
 */
export function isValidE164(value: string): boolean {
  const normalized = normalizePhone(value);
  return E164_REGEX.test(normalized);
}

/** Codes triés par longueur décroissante pour matcher le plus long en premier (ex: 225 avant 22) */
const COUNTRY_CODES_SORTED = [...PHONE_COUNTRY_CODES].sort(
  (a, b) => b.code.length - a.code.length
);

/**
 * Extrait le code pays (sans +) d'un numéro E.164
 */
export function getCountryCodeFromE164(fullNumber: string): string {
  const n = normalizePhone(fullNumber);
  if (!n || n === "+") return "";
  const rest = n.slice(1);
  for (const { code } of COUNTRY_CODES_SORTED) {
    if (rest.startsWith(code)) return code;
  }
  const match = rest.match(/^(\d{1,3})/);
  return match ? match[1] : "";
}

/** Message d'erreur pour le format téléphone */
export const PHONE_VALIDATION_MESSAGE =
  "Le numéro doit inclure le code pays (ex: +225 07 00 00 00 00) et respecter le format international.";

/** Schéma Zod : téléphone requis au format E.164 */
export const phoneSchema = z
  .string()
  .min(1, "Le téléphone est requis")
  .refine(
    (val) => isValidE164(val),
    PHONE_VALIDATION_MESSAGE
  );

/** Schéma Zod : téléphone optionnel au format E.164 */
export const phoneSchemaOptional = z
  .string()
  .optional()
  .refine(
    (val) => !val || val.trim() === "" || isValidE164(val),
    PHONE_VALIDATION_MESSAGE
  );

/**
 * Extrait le numéro local (sans indicatif) à partir d'un numéro E.164
 */
export function getLocalNumberFromE164(fullNumber: string): string {
  const n = normalizePhone(fullNumber);
  if (!n || n === "+") return "";
  const code = getCountryCodeFromE164(n);
  if (!code) return n.slice(1).replace(/\D/g, "");
  return n.slice(1 + code.length).replace(/\D/g, "");
}

/** Formate un numéro E.164 pour l'affichage (ex: +225 07 01 23 45 67) */
export function formatPhoneDisplay(e164: string): string {
  const n = normalizePhone(e164);
  if (!n || n === "+") return "—";
  const code = getCountryCodeFromE164(n);
  const local = getLocalNumberFromE164(n);
  if (!code) return n;
  const dial = PHONE_COUNTRY_CODES.find((c) => c.code === code)?.dial ?? `+${code}`;
  return local ? `${dial} ${local.replace(/(\d{2})(?=\d)/g, "$1 ").trim()}` : dial;
}
