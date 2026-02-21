import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility pour combiner des classes CSS avec Tailwind
 * Combine clsx et tailwind-merge pour éviter les conflits de classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
