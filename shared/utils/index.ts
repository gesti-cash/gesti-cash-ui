// Export des utilities
export { cn } from "./cn";
export { checkAuthFromStorage, hasAuthInStorage, hasTenantInStorage } from "./auth-check";

/**
 * Formater un montant en devise
 */
export function formatCurrency(
  amount: number,
  currency: string = "EUR",
  locale: string = "fr-FR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Formater une date
 */
export function formatDate(
  date: string | Date,
  format: string = "DD/MM/YYYY",
  locale: string = "fr-FR"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (format === "DD/MM/YYYY") {
    return d.toLocaleDateString(locale);
  }
  
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Formater une date et heure
 */
export function formatDateTime(
  date: string | Date,
  locale: string = "fr-FR"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formater une date relative (il y a X heures)
 */
export function formatRelativeDate(
  date: string | Date,
  locale: string = "fr-FR"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return "À l'instant";
  }
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
  }
  if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
  }
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
  }
  
  return formatDate(d, "DD/MM/YYYY", locale);
}

/**
 * Générer des initiales depuis un nom complet
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Tronquer un texte
 */
export function truncate(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Capitaliser la première lettre
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Vérifier si une valeur est vide
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Delay (pour les tests)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Générer une couleur depuis un string (pour les avatars)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Copier dans le presse-papier
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Télécharger un fichier
 */
export function downloadFile(data: Blob, filename: string): void {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
