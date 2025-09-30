// src/lib/ai/api-manager.ts

/**
 * Gestionnaire d'APIs IA pour FrançaisFluide
 * Intégration avec APIs gratuites et payantes, gestion des quotas et fallbacks
 */

import { aiSecurityManager } from './security';

// Types pour la gestion des APIs
export interface APIProvider {
  id: string;
  name: string;
  type: 'paid' | 'free' | 'freemium';
  priority: number;
  baseUrl: string;
  authType: 'bearer' | 'api-key' | 'none';
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  cost: {
    perRequest: number;
    perToken: number;
    freeQuota: number; // pour les APIs freemium
  };
  features: string[];
  status: 'active' | 'inactive' | 'quota_exceeded' | 'error';
  lastUsed: number;
  successRate: number;
  averageResponseTime: number;
}

export interface APIRequest {
  provider: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body?: any;
  timeout: number;
  retries: number;
}

export interface APIResponse {
  provider: string;
  success: boolean;
  data?: any;
  error?: string;
  statusCode: number;
  responseTime: number;
  cost: number;
  tokensUsed?: number;
  retryCount: number;
}

export interface QuotaInfo {
  provider: string;
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  resetTime: number;
  remaining: number;
}

// Configuration des providers d'API
const API_PROVIDERS: APIProvider[] = [
  // OpenAI (Payant)
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    type: 'paid',
    priority: 1,
    baseUrl: 'https://api.openai.com/v1',
    authType: 'bearer',
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 5000,
      requestsPerDay: 50000,
    },
    cost: {
      perRequest: 0.002,
      perToken: 0.00003,
      freeQuota: 0,
    },
    features: ['correction', 'explanation', 'content_generation', 'chat'],
    status: 'active',
    lastUsed: 0,
    successRate: 95,
    averageResponseTime: 1200,
  },

  // Claude (Payant)
  {
    id: 'claude',
    name: 'Anthropic Claude',
    type: 'paid',
    priority: 2,
    baseUrl: 'https://api.anthropic.com/v1',
    authType: 'api-key',
    rateLimit: {
      requestsPerMinute: 50,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
    },
    cost: {
      perRequest: 0.0015,
      perToken: 0.00002,
      freeQuota: 0,
    },
    features: ['correction', 'explanation', 'content_generation', 'chat'],
    status: 'active',
    lastUsed: 0,
    successRate: 92,
    averageResponseTime: 1500,
  },

  // LanguageTool (Gratuit avec limites)
  {
    id: 'languageTool',
    name: 'LanguageTool',
    type: 'freemium',
    priority: 3,
    baseUrl: 'https://api.languagetool.org/v2',
    authType: 'none',
    rateLimit: {
      requestsPerMinute: 20,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
    },
    cost: {
      perRequest: 0,
      perToken: 0,
      freeQuota: 10000,
    },
    features: ['correction', 'grammar_check'],
    status: 'active',
    lastUsed: 0,
    successRate: 85,
    averageResponseTime: 800,
  },

  // Hugging Face (Gratuit avec limites)
  {
    id: 'huggingface',
    name: 'Hugging Face Transformers',
    type: 'freemium',
    priority: 4,
    baseUrl: 'https://api-inference.huggingface.co/models',
    authType: 'bearer',
    rateLimit: {
      requestsPerMinute: 30,
      requestsPerHour: 500,
      requestsPerDay: 5000,
    },
    cost: {
      perRequest: 0,
      perToken: 0,
      freeQuota: 1000,
    },
    features: ['correction', 'explanation', 'translation'],
    status: 'active',
    lastUsed: 0,
    successRate: 80,
    averageResponseTime: 2000,
  },

  // LibreTranslate (Gratuit)
  {
    id: 'libretranslate',
    name: 'LibreTranslate',
    type: 'free',
    priority: 5,
    baseUrl: 'https://libretranslate.de/api',
    authType: 'none',
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerHour: 100,
      requestsPerDay: 1000,
    },
    cost: {
      perRequest: 0,
      perToken: 0,
      freeQuota: Infinity,
    },
    features: ['translation'],
    status: 'active',
    lastUsed: 0,
    successRate: 75,
    averageResponseTime: 3000,
  },
];

class APIManager {
  private providers: Map<string, APIProvider>;
  private quotaTracking: Map<string, QuotaInfo>;
  private requestHistory: Array<{ provider: string; timestamp: number; cost: number }>;
  private fallbackChain: string[];

  constructor() {
    this.providers = new Map();
    this.quotaTracking = new Map();
    this.requestHistory = [];
    this.fallbackChain = ['openai', 'claude', 'languageTool', 'huggingface', 'libretranslate'];

    this.initializeProviders();
    this.initializeQuotaTracking();
  }

  /**
   * Initialise les providers
   */
  private initializeProviders(): void {
    for (const provider of API_PROVIDERS) {
      this.providers.set(provider.id, { ...provider });
    }
  }

  /**
   * Initialise le suivi des quotas
   */
  private initializeQuotaTracking(): void {
    for (const provider of this.providers.values()) {
      this.quotaTracking.set(provider.id, {
        provider: provider.id,
        dailyUsed: 0,
        dailyLimit: provider.rateLimit.requestsPerDay,
        monthlyUsed: 0,
        monthlyLimit: provider.rateLimit.requestsPerDay * 30,
        resetTime: this.getNextResetTime(),
        remaining: provider.rateLimit.requestsPerDay,
      });
    }
  }

  /**
   * Fait une requête avec fallback automatique
   */
  public async makeRequest(
    request: Partial<APIRequest>,
    preferredProviders?: string[]
  ): Promise<APIResponse> {
    const providers = preferredProviders || this.getAvailableProviders();

    for (const providerId of providers) {
      try {
        const response = await this.callProvider(providerId, request);

        if (response.success) {
          // Mettre à jour les statistiques
          this.updateProviderStats(providerId, response);
          this.updateQuotaUsage(providerId, response.cost);

          return response;
        }
      } catch (error) {
        console.error(`Erreur avec ${providerId}:`, error);

        // Marquer le provider comme en erreur temporairement
        this.markProviderError(providerId);
        continue;
      }
    }

    // Si tous les providers ont échoué
    throw new Error("Tous les providers d'API sont indisponibles");
  }

  /**
   * Appelle un provider spécifique
   */
  private async callProvider(
    providerId: string,
    request: Partial<APIRequest>
  ): Promise<APIResponse> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} non trouvé`);
    }

    // Vérifier le statut du provider
    if (provider.status !== 'active') {
      throw new Error(`Provider ${providerId} non disponible`);
    }

    // Vérifier les quotas
    if (!this.checkQuota(providerId)) {
      throw new Error(`Quota dépassé pour ${providerId}`);
    }

    // Vérifier le rate limiting
    if (!aiSecurityManager.checkRateLimit(providerId)) {
      throw new Error(`Rate limit atteint pour ${providerId}`);
    }

    const startTime = Date.now();

    try {
      const apiKey = this.getApiKey(providerId);
      const fullRequest = this.buildRequest(provider, request, apiKey);

      const response = await fetch(fullRequest.url, {
        method: fullRequest.method,
        headers: fullRequest.headers,
        body: fullRequest.body ? JSON.stringify(fullRequest.body) : undefined,
        signal: AbortSignal.timeout(fullRequest.timeout),
      });

      const responseTime = Date.now() - startTime;
      const responseData = await response.json();

      const cost = this.calculateCost(provider, responseData);

      return {
        provider: providerId,
        success: response.ok,
        data: response.ok ? responseData : undefined,
        error: response.ok ? undefined : responseData.error?.message || 'Erreur API',
        statusCode: response.status,
        responseTime,
        cost,
        tokensUsed: responseData.usage?.total_tokens,
        retryCount: 0,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        provider: providerId,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        statusCode: 0,
        responseTime,
        cost: 0,
        retryCount: 0,
      };
    }
  }

  /**
   * Construit la requête complète
   */
  private buildRequest(
    provider: APIProvider,
    request: Partial<APIRequest>,
    apiKey?: string
  ): { url: string; method: string; headers: Record<string, string>; body?: any; timeout: number } {
    const url = `${provider.baseUrl}${request.endpoint || ''}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...request.headers,
    };

    // Ajouter l'authentification
    if (apiKey) {
      switch (provider.authType) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${apiKey}`;
          break;
        case 'api-key':
          headers['x-api-key'] = apiKey;
          break;
      }
    }

    return {
      url,
      method: request.method || 'POST',
      headers,
      body: request.body,
      timeout: request.timeout || 30000,
    };
  }

  /**
   * Obtient la clé API pour un provider
   */
  private getApiKey(providerId: string): string | undefined {
    const key = aiSecurityManager.getApiKey(providerId);
    return key ?? undefined;
  }

  /**
   * Calcule le coût d'une requête
   */
  private calculateCost(provider: APIProvider, responseData: any): number {
    const baseCost = provider.cost.perRequest;

    if (provider.cost.perToken > 0 && responseData.usage?.total_tokens) {
      return baseCost + responseData.usage.total_tokens * provider.cost.perToken;
    }

    return baseCost;
  }

  /**
   * Vérifie les quotas d'un provider
   */
  private checkQuota(providerId: string): boolean {
    const quota = this.quotaTracking.get(providerId);
    const provider = this.providers.get(providerId);

    if (!quota || !provider) return false;

    // Vérifier le quota quotidien
    if (quota.dailyUsed >= quota.dailyLimit) {
      return false;
    }

    // Vérifier le quota mensuel
    if (quota.monthlyUsed >= quota.monthlyLimit) {
      return false;
    }

    // Pour les providers freemium, vérifier le quota gratuit
    if (provider.type === 'freemium' && quota.dailyUsed >= provider.cost.freeQuota) {
      return false;
    }

    return true;
  }

  /**
   * Met à jour les statistiques d'un provider
   */
  private updateProviderStats(providerId: string, response: APIResponse): void {
    const provider = this.providers.get(providerId);
    if (!provider) return;

    provider.lastUsed = Date.now();

    // Mettre à jour le taux de succès
    const success = response.success ? 1 : 0;
    provider.successRate = provider.successRate * 0.9 + success * 0.1;

    // Mettre à jour le temps de réponse moyen
    provider.averageResponseTime = provider.averageResponseTime * 0.9 + response.responseTime * 0.1;

    this.providers.set(providerId, provider);
  }

  /**
   * Met à jour l'utilisation des quotas
   */
  private updateQuotaUsage(providerId: string, cost: number): void {
    const quota = this.quotaTracking.get(providerId);
    if (!quota) return;

    quota.dailyUsed += 1;
    quota.monthlyUsed += 1;
    quota.remaining = Math.max(0, quota.dailyLimit - quota.dailyUsed);

    this.quotaTracking.set(providerId, quota);

    // Enregistrer dans l'historique
    this.requestHistory.push({
      provider: providerId,
      timestamp: Date.now(),
      cost,
    });

    // Mettre à jour les coûts dans le gestionnaire de sécurité
    aiSecurityManager.updateCost(providerId, cost);
  }

  /**
   * Marque un provider comme en erreur
   */
  private markProviderError(providerId: string): void {
    const provider = this.providers.get(providerId);
    if (!provider) return;

    provider.status = 'error';
    this.providers.set(providerId, provider);

    // Réactiver après 5 minutes
    setTimeout(
      () => {
        const provider = this.providers.get(providerId);
        if (provider) {
          provider.status = 'active';
          this.providers.set(providerId, provider);
        }
      },
      5 * 60 * 1000
    );
  }

  /**
   * Obtient les providers disponibles
   */
  private getAvailableProviders(): string[] {
    const available = [];

    for (const provider of this.providers.values()) {
      if (provider.status === 'active' && this.checkQuota(provider.id)) {
        available.push(provider.id);
      }
    }

    // Trier par priorité
    return available.sort((a, b) => {
      const providerA = this.providers.get(a)!;
      const providerB = this.providers.get(b)!;
      return providerA.priority - providerB.priority;
    });
  }

  /**
   * Obtient le prochain temps de reset
   */
  private getNextResetTime(): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  /**
   * Réinitialise les quotas quotidiens
   */
  public resetDailyQuotas(): void {
    for (const quota of this.quotaTracking.values()) {
      quota.dailyUsed = 0;
      quota.remaining = quota.dailyLimit;
      quota.resetTime = this.getNextResetTime();
    }
  }

  /**
   * Obtient les statistiques des APIs
   */
  public getAPIStats(): any {
    const providerStats = Array.from(this.providers.values()).map(provider => ({
      id: provider.id,
      name: provider.name,
      type: provider.type,
      status: provider.status,
      successRate: provider.successRate,
      averageResponseTime: provider.averageResponseTime,
      lastUsed: provider.lastUsed,
      quota: this.quotaTracking.get(provider.id),
    }));

    const totalRequests = this.requestHistory.length;
    const totalCost = this.requestHistory.reduce((sum, req) => sum + req.cost, 0);

    const requestsByProvider = this.requestHistory.reduce(
      (counts, req) => {
        counts[req.provider] = (counts[req.provider] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    return {
      providers: providerStats,
      totalRequests,
      totalCost,
      requestsByProvider,
      fallbackChain: this.fallbackChain,
    };
  }

  /**
   * Obtient les informations de quota
   */
  public getQuotaInfo(providerId: string): QuotaInfo | null {
    return this.quotaTracking.get(providerId) || null;
  }

  /**
   * Met à jour la configuration d'un provider
   */
  public updateProviderConfig(providerId: string, config: Partial<APIProvider>): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      Object.assign(provider, config);
      this.providers.set(providerId, provider);
    }
  }

  /**
   * Désactive un provider
   */
  public disableProvider(providerId: string): void {
    this.updateProviderConfig(providerId, { status: 'inactive' });
  }

  /**
   * Active un provider
   */
  public enableProvider(providerId: string): void {
    this.updateProviderConfig(providerId, { status: 'active' });
  }
}

// Instance singleton
export const apiManager = new APIManager();

// Hook React pour utiliser le gestionnaire d'API
export const useAPIManager = () => {
  const [stats, setStats] = React.useState(apiManager.getAPIStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(apiManager.getAPIStats());
    }, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  const makeRequest = React.useCallback(
    (request: Partial<APIRequest>, preferredProviders?: string[]) => {
      return apiManager.makeRequest(request, preferredProviders);
    },
    []
  );

  const getQuotaInfo = React.useCallback((providerId: string) => {
    return apiManager.getQuotaInfo(providerId);
  }, []);

  const disableProvider = React.useCallback((providerId: string) => {
    apiManager.disableProvider(providerId);
  }, []);

  const enableProvider = React.useCallback((providerId: string) => {
    apiManager.enableProvider(providerId);
  }, []);

  return {
    stats,
    makeRequest,
    getQuotaInfo,
    disableProvider,
    enableProvider,
    resetDailyQuotas: apiManager.resetDailyQuotas.bind(apiManager),
  };
};

// Import React pour les hooks
import React from 'react';
