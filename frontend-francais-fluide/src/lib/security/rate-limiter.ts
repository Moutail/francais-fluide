// src/lib/security/rate-limiter.ts

export interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // en millisecondes
}

export class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 10, timeWindow: 60000 }) {
    this.config = config;
  }

  /**
   * Vérifie si une requête peut être effectuée
   */
  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];

    // Filtrer les requêtes dans la fenêtre de temps
    const recentRequests = requests.filter(time => now - time < this.config.timeWindow);

    if (recentRequests.length >= this.config.maxRequests) {
      console.warn(`⚠️ Rate limit atteint pour ${endpoint}`);
      return false;
    }

    recentRequests.push(now);
    this.requests.set(endpoint, recentRequests);
    return true;
  }

  /**
   * Obtenir le nombre de requêtes restantes
   */
  getRemainingRequests(endpoint: string): number {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];
    const recentRequests = requests.filter(time => now - time < this.config.timeWindow);
    return Math.max(0, this.config.maxRequests - recentRequests.length);
  }

  /**
   * Obtenir le temps avant le prochain reset
   */
  getTimeUntilReset(endpoint: string): number {
    const requests = this.requests.get(endpoint) || [];
    if (requests.length === 0) return 0;

    const oldestRequest = Math.min(...requests);
    const resetTime = oldestRequest + this.config.timeWindow;
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Réinitialiser les compteurs pour un endpoint
   */
  reset(endpoint: string): void {
    this.requests.delete(endpoint);
  }

  /**
   * Réinitialiser tous les compteurs
   */
  resetAll(): void {
    this.requests.clear();
  }
}

// Instance globale
export const globalRateLimiter = new ClientRateLimiter({
  maxRequests: 10,
  timeWindow: 60000, // 1 minute
});

// Rate limiters spécifiques
export const apiRateLimiter = new ClientRateLimiter({
  maxRequests: 30,
  timeWindow: 60000, // 30 requêtes par minute
});

export const grammarCheckRateLimiter = new ClientRateLimiter({
  maxRequests: 5,
  timeWindow: 60000, // 5 vérifications par minute
});

export const dictationRateLimiter = new ClientRateLimiter({
  maxRequests: 3,
  timeWindow: 300000, // 3 dictées toutes les 5 minutes
});
