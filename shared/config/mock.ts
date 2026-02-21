/**
 * Configuration du système de données mock/fake
 * 
 * Active ou désactive le mode mock pour le développement
 */

export const MOCK_CONFIG = {
  // Activer le mode mock (mettre à false pour utiliser les vraies API)
  enabled: true,
  
  // Délai de simulation des appels API (en ms)
  delay: {
    min: 300,
    max: 800,
  },
  
  // Taux d'erreur simulé (0 = aucune erreur, 1 = toujours en erreur)
  errorRate: 0, // 0% de chance d'erreur (désactivé pour le développement)
  
  // Logs de débogage
  debug: true,
} as const;

/**
 * Active ou désactive le mode mock
 */
export function setMockEnabled(enabled: boolean) {
  (MOCK_CONFIG as any).enabled = enabled;
}

/**
 * Vérifie si le mode mock est activé
 */
export function isMockEnabled(): boolean {
  return MOCK_CONFIG.enabled;
}

/**
 * Génère un délai aléatoire pour simuler un appel API
 */
export function getRandomDelay(): number {
  const { min, max } = MOCK_CONFIG.delay;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Simule un appel API avec délai et gestion d'erreurs
 */
export async function simulateApiCall<T>(
  dataFn: () => T,
  options?: {
    delay?: number;
    errorRate?: number;
    errorMessage?: string;
  }
): Promise<T> {
  const delay = options?.delay ?? getRandomDelay();
  const errorRate = options?.errorRate ?? MOCK_CONFIG.errorRate;
  
  if (MOCK_CONFIG.debug) {
    console.log(`[MOCK API] Simulating call with ${delay}ms delay...`);
  }
  
  await new Promise((resolve) => setTimeout(resolve, delay));
  
  // Simulation d'erreur aléatoire
  if (Math.random() < errorRate) {
    const error = new Error(options?.errorMessage ?? "Simulated API Error");
    if (MOCK_CONFIG.debug) {
      console.error("[MOCK API] Simulated error:", error);
    }
    throw error;
  }
  
  const data = dataFn();
  
  if (MOCK_CONFIG.debug) {
    console.log("[MOCK API] Response:", data);
  }
  
  return data;
}
