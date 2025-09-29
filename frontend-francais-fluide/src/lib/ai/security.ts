// src/lib/ai/security.ts

/**
 * Configuration de sécurité et rate limiting pour les services IA
 * Protection contre l'abus, rotation des clés API, monitoring des coûts
 */

// Types pour la sécurité
export interface SecurityConfig {
  rateLimiting: {
    enabled: boolean;
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
    maxRequestsPerDay: number;
    windowSize: number; // en millisecondes
  };
  
  apiKeys: {
    rotationEnabled: boolean;
    rotationInterval: number; // en heures
    maxKeysPerProvider: number;
    fallbackKeys: string[];
  };
  
  costMonitoring: {
    enabled: boolean;
    dailyBudget: number; // en USD
    monthlyBudget: number; // en USD
    alertThreshold: number; // pourcentage
    autoDisableOnLimit: boolean;
  };
  
  contentFiltering: {
    enabled: boolean;
    blockInappropriate: boolean;
    blockPersonalInfo: boolean;
    maxInputLength: number;
    allowedLanguages: string[];
  };
  
  fallback: {
    enabled: boolean;
    fallbackProvider: 'languageTool' | 'local' | 'cached';
    degradedMode: boolean;
    cachedResponsesOnly: boolean;
  };
}

export interface RateLimitInfo {
  provider: string;
  requestsCount: number;
  windowStart: number;
  isLimited: boolean;
  resetTime: number;
}

export interface CostInfo {
  provider: string;
  dailyCost: number;
  monthlyCost: number;
  totalRequests: number;
  averageCostPerRequest: number;
  budgetRemaining: number;
  isOverBudget: boolean;
}

export interface SecurityEvent {
  id: string;
  type: 'rate_limit' | 'cost_limit' | 'content_filter' | 'api_error' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  provider?: string;
  userId?: string;
  metadata?: any;
}

// Types de statistiques de sécurité renvoyées par le gestionnaire
export interface SecurityStats {
  rateLimiting: {
    activeLimiters: number;
    blockedUsers: number;
  };
  costTracking: Record<string, CostInfo>;
  securityEvents: {
    total: number;
    recent: number;
    weekly: number;
    byType: Record<SecurityEvent['type'], number>;
    bySeverity: Record<SecurityEvent['severity'], number>;
  };
  apiKeys: {
    providers: string[];
    rotationEnabled: boolean;
  };
}

// Configuration par défaut
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  rateLimiting: {
    enabled: true,
    maxRequestsPerMinute: 30,
    maxRequestsPerHour: 100,
    maxRequestsPerDay: 500,
    windowSize: 60000 // 1 minute
  },
  
  apiKeys: {
    rotationEnabled: true,
    rotationInterval: 24, // 24 heures
    maxKeysPerProvider: 3,
    fallbackKeys: []
  },
  
  costMonitoring: {
    enabled: true,
    dailyBudget: 10, // $10 par jour
    monthlyBudget: 200, // $200 par mois
    alertThreshold: 80, // 80%
    autoDisableOnLimit: true
  },
  
  contentFiltering: {
    enabled: true,
    blockInappropriate: true,
    blockPersonalInfo: true,
    maxInputLength: 4000,
    allowedLanguages: ['fr', 'en']
  },
  
  fallback: {
    enabled: true,
    fallbackProvider: 'languageTool',
    degradedMode: true,
    cachedResponsesOnly: false
  }
};

class AISecurityManager {
  private config: SecurityConfig;
  private rateLimiters: Map<string, RateLimitInfo>;
  private costTracking: Map<string, CostInfo>;
  private securityEvents: SecurityEvent[];
  private apiKeys: Map<string, string[]>;
  private keyRotationTimes: Map<string, number>;
  private blockedUsers: Set<string>;
  private suspiciousPatterns: RegExp[];

  constructor() {
    this.config = { ...DEFAULT_SECURITY_CONFIG };
    this.rateLimiters = new Map();
    this.costTracking = new Map();
    this.securityEvents = [];
    this.apiKeys = new Map();
    this.keyRotationTimes = new Map();
    this.blockedUsers = new Set();
    this.suspiciousPatterns = [
      /password|mot de passe|mdp/i,
      /credit card|carte de crédit|numéro de carte/i,
      /ssn|social security|sécurité sociale/i,
      /personal info|informations personnelles/i
    ];

    this.initializeApiKeys();
    this.startMonitoring();
  }

  /**
   * Initialise les clés API
   */
  private initializeApiKeys(): void {
    // Charger les clés API depuis les variables d'environnement
    const openaiKeys = [
      process.env.OPENAI_API_KEY,
      process.env.OPENAI_API_KEY_BACKUP,
      process.env.OPENAI_API_KEY_BACKUP2
    ].filter(Boolean) as string[];

    const claudeKeys = [
      process.env.ANTHROPIC_API_KEY,
      process.env.ANTHROPIC_API_KEY_BACKUP,
      process.env.ANTHROPIC_API_KEY_BACKUP2
    ].filter(Boolean) as string[];

    this.apiKeys.set('openai', openaiKeys);
    this.apiKeys.set('claude', claudeKeys);
    
    // Initialiser les temps de rotation
    this.keyRotationTimes.set('openai', Date.now());
    this.keyRotationTimes.set('claude', Date.now());
  }

  /**
   * Démarre le monitoring de sécurité
   */
  private startMonitoring(): void {
    // Vérifier la rotation des clés toutes les heures
    setInterval(() => {
      this.checkKeyRotation();
    }, 60 * 60 * 1000);

    // Vérifier les coûts toutes les 5 minutes
    setInterval(() => {
      this.checkCostLimits();
    }, 5 * 60 * 1000);

    // Nettoyer les événements anciens toutes les heures
    setInterval(() => {
      this.cleanupOldEvents();
    }, 60 * 60 * 1000);
  }

  /**
   * Vérifie le rate limiting
   */
  public checkRateLimit(provider: string, userId?: string): boolean {
    if (!this.config.rateLimiting.enabled) return true;

    // Vérifier si l'utilisateur est bloqué
    if (userId && this.blockedUsers.has(userId)) {
      this.logSecurityEvent({
        type: 'rate_limit',
        severity: 'high',
        message: `Utilisateur bloqué tentant d'accéder au service: ${userId}`,
        userId
      });
      return false;
    }

    const now = Date.now();
    const key = userId ? `${provider}:${userId}` : provider;
    const limitInfo = this.rateLimiters.get(key) || {
      provider,
      requestsCount: 0,
      windowStart: now,
      isLimited: false,
      resetTime: now + this.config.rateLimiting.windowSize
    };

    // Vérifier si la fenêtre de temps a expiré
    if (now > limitInfo.resetTime) {
      limitInfo.requestsCount = 0;
      limitInfo.windowStart = now;
      limitInfo.resetTime = now + this.config.rateLimiting.windowSize;
      limitInfo.isLimited = false;
    }

    // Vérifier les limites
    const limits = this.config.rateLimiting;
    if (limitInfo.requestsCount >= limits.maxRequestsPerMinute) {
      limitInfo.isLimited = true;
      
      this.logSecurityEvent({
        type: 'rate_limit',
        severity: 'medium',
        message: `Rate limit atteint pour ${provider}: ${limitInfo.requestsCount} requêtes`,
        provider,
        userId
      });

      return false;
    }

    // Incrémenter le compteur
    limitInfo.requestsCount++;
    this.rateLimiters.set(key, limitInfo);

    return true;
  }

  /**
   * Vérifie les limites de coût
   */
  public checkCostLimits(): void {
    if (!this.config.costMonitoring.enabled) return;

    for (const [provider, costInfo] of this.costTracking.entries()) {
      const config = this.config.costMonitoring;
      
      // Vérifier le budget quotidien
      if (costInfo.dailyCost >= config.dailyBudget) {
        this.logSecurityEvent({
          type: 'cost_limit',
          severity: 'high',
          message: `Budget quotidien dépassé pour ${provider}: $${costInfo.dailyCost}`,
          provider
        });

        if (config.autoDisableOnLimit) {
          this.disableProvider(provider);
        }
      }

      // Vérifier le budget mensuel
      if (costInfo.monthlyCost >= config.monthlyBudget) {
        this.logSecurityEvent({
          type: 'cost_limit',
          severity: 'critical',
          message: `Budget mensuel dépassé pour ${provider}: $${costInfo.monthlyCost}`,
          provider
        });

        if (config.autoDisableOnLimit) {
          this.disableProvider(provider);
        }
      }

      // Vérifier le seuil d'alerte
      const dailyThreshold = config.dailyBudget * (config.alertThreshold / 100);
      if (costInfo.dailyCost >= dailyThreshold && costInfo.dailyCost < config.dailyBudget) {
        this.logSecurityEvent({
          type: 'cost_limit',
          severity: 'medium',
          message: `Seuil d'alerte atteint pour ${provider}: $${costInfo.dailyCost}`,
          provider
        });
      }
    }
  }

  /**
   * Filtre le contenu entrant
   */
  public filterContent(content: string, userId?: string): { allowed: boolean; reason?: string } {
    if (!this.config.contentFiltering.enabled) {
      return { allowed: true };
    }

    const config = this.config.contentFiltering;

    // Vérifier la longueur
    if (content.length > config.maxInputLength) {
      this.logSecurityEvent({
        type: 'content_filter',
        severity: 'low',
        message: `Contenu trop long: ${content.length} caractères`,
        userId
      });
      return { allowed: false, reason: 'Contenu trop long' };
    }

    // Vérifier les patterns suspects
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        this.logSecurityEvent({
          type: 'content_filter',
          severity: 'high',
          message: `Pattern suspect détecté: ${pattern.source}`,
          userId,
          metadata: { pattern: pattern.source, content: content.substring(0, 100) }
        });
        return { allowed: false, reason: 'Contenu suspect détecté' };
      }
    }

    return { allowed: true };
  }

  /**
   * Obtient une clé API avec rotation
   */
  public getApiKey(provider: string): string | null {
    const keys = this.apiKeys.get(provider);
    if (!keys || keys.length === 0) {
      return null;
    }

    // Si la rotation est activée, vérifier si il faut changer de clé
    if (this.config.apiKeys.rotationEnabled) {
      const lastRotation = this.keyRotationTimes.get(provider) || 0;
      const rotationInterval = this.config.apiKeys.rotationInterval * 60 * 60 * 1000;
      
      if (Date.now() - lastRotation > rotationInterval) {
        this.rotateApiKey(provider);
      }
    }

    // Retourner la première clé disponible
    return keys[0] || null;
  }

  /**
   * Fait tourner les clés API
   */
  private rotateApiKey(provider: string): void {
    const keys = this.apiKeys.get(provider);
    if (!keys || keys.length <= 1) return;

    // Déplacer la première clé vers la fin
    const rotatedKeys = [...keys.slice(1), keys[0]];
    this.apiKeys.set(provider, rotatedKeys);
    this.keyRotationTimes.set(provider, Date.now());

    this.logSecurityEvent({
      type: 'api_error',
      severity: 'low',
      message: `Rotation de clé API pour ${provider}`,
      provider
    });
  }

  /**
   * Met à jour les coûts
   */
  public updateCost(provider: string, cost: number): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const month = new Date(now.getFullYear(), now.getMonth(), 1);

    const costInfo = this.costTracking.get(provider) || {
      provider,
      dailyCost: 0,
      monthlyCost: 0,
      totalRequests: 0,
      averageCostPerRequest: 0,
      budgetRemaining: this.config.costMonitoring.dailyBudget,
      isOverBudget: false
    };

    // Réinitialiser les coûts quotidiens si c'est un nouveau jour
    const lastUpdate = new Date(costInfo.dailyCost > 0 ? costInfo.dailyCost : today.getTime());
    if (lastUpdate.getDate() !== today.getDate()) {
      costInfo.dailyCost = 0;
    }

    // Réinitialiser les coûts mensuels si c'est un nouveau mois
    if (lastUpdate.getMonth() !== month.getMonth()) {
      costInfo.monthlyCost = 0;
    }

    costInfo.dailyCost += cost;
    costInfo.monthlyCost += cost;
    costInfo.totalRequests += 1;
    costInfo.averageCostPerRequest = costInfo.monthlyCost / costInfo.totalRequests;
    costInfo.budgetRemaining = this.config.costMonitoring.dailyBudget - costInfo.dailyCost;
    costInfo.isOverBudget = costInfo.dailyCost >= this.config.costMonitoring.dailyBudget;

    this.costTracking.set(provider, costInfo);
  }

  /**
   * Désactive un provider
   */
  private disableProvider(provider: string): void {
    // Logique pour désactiver un provider
    this.logSecurityEvent({
      type: 'cost_limit',
      severity: 'critical',
      message: `Provider ${provider} désactivé automatiquement`,
      provider
    });
  }

  /**
   * Enregistre un événement de sécurité
   */
  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: `security-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...event
    };

    this.securityEvents.push(securityEvent);

    // Limiter le nombre d'événements en mémoire
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-500);
    }

    // Envoyer des alertes pour les événements critiques
    if (event.severity === 'critical') {
      this.sendAlert(securityEvent);
    }

    // Log en console en développement
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔒 Security Event:', securityEvent);
    }
  }

  /**
   * Envoie une alerte pour les événements critiques
   */
  private sendAlert(event: SecurityEvent): void {
    // En production, envoyer vers un service d'alertes
    if (process.env.NODE_ENV === 'production') {
      // fetch('/api/security/alerts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // }).catch(console.error);
    }
  }

  /**
   * Vérifie la rotation des clés
   */
  private checkKeyRotation(): void {
    if (!this.config.apiKeys.rotationEnabled) return;

    for (const provider of this.apiKeys.keys()) {
      const lastRotation = this.keyRotationTimes.get(provider) || 0;
      const rotationInterval = this.config.apiKeys.rotationInterval * 60 * 60 * 1000;
      
      if (Date.now() - lastRotation > rotationInterval) {
        this.rotateApiKey(provider);
      }
    }
  }

  /**
   * Nettoie les événements anciens
   */
  private cleanupOldEvents(): void {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.securityEvents = this.securityEvents.filter(event => event.timestamp > oneWeekAgo);
  }

  /**
   * Obtient les statistiques de sécurité
   */
  public getSecurityStats(): SecurityStats {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    const recentEvents = this.securityEvents.filter(event => event.timestamp > oneDayAgo);
    const weeklyEvents = this.securityEvents.filter(event => event.timestamp > oneWeekAgo);

    const eventCounts = recentEvents.reduce((counts, event) => {
      counts[event.type] = (counts[event.type] || 0) + 1;
      return counts;
    }, {} as Record<SecurityEvent['type'], number>);

    const severityCounts = recentEvents.reduce((counts, event) => {
      counts[event.severity] = (counts[event.severity] || 0) + 1;
      return counts;
    }, {} as Record<SecurityEvent['severity'], number>);

    return {
      rateLimiting: {
        activeLimiters: this.rateLimiters.size,
        blockedUsers: this.blockedUsers.size
      },
      costTracking: Object.fromEntries(this.costTracking),
      securityEvents: {
        total: this.securityEvents.length,
        recent: recentEvents.length,
        weekly: weeklyEvents.length,
        byType: eventCounts,
        bySeverity: severityCounts
      },
      apiKeys: {
        providers: Array.from(this.apiKeys.keys()),
        rotationEnabled: this.config.apiKeys.rotationEnabled
      }
    };
  }

  /**
   * Met à jour la configuration
   */
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    this.logSecurityEvent({
      type: 'api_error',
      severity: 'low',
      message: 'Configuration de sécurité mise à jour',
      metadata: { newConfig }
    });
  }

  /**
   * Bloque un utilisateur
   */
  public blockUser(userId: string, reason: string): void {
    this.blockedUsers.add(userId);
    
    this.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      message: `Utilisateur bloqué: ${reason}`,
      userId,
      metadata: { reason }
    });
  }

  /**
   * Débloque un utilisateur
   */
  public unblockUser(userId: string): void {
    this.blockedUsers.delete(userId);
    
    this.logSecurityEvent({
      type: 'api_error',
      severity: 'low',
      message: `Utilisateur débloqué`,
      userId
    });
  }

  /**
   * Obtient la configuration actuelle
   */
  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Réinitialise les compteurs de rate limiting
   */
  public resetRateLimits(): void {
    this.rateLimiters.clear();
    
    this.logSecurityEvent({
      type: 'api_error',
      severity: 'low',
      message: 'Rate limits réinitialisés'
    });
  }
}

// Instance singleton
export const aiSecurityManager = new AISecurityManager();

// Hook React pour utiliser le gestionnaire de sécurité
export const useAISecurity = () => {
  const [stats, setStats] = React.useState<SecurityStats>(aiSecurityManager.getSecurityStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(aiSecurityManager.getSecurityStats());
    }, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = React.useCallback((provider: string, userId?: string) => {
    return aiSecurityManager.checkRateLimit(provider, userId);
  }, []);

  const filterContent = React.useCallback((content: string, userId?: string) => {
    return aiSecurityManager.filterContent(content, userId);
  }, []);

  const getApiKey = React.useCallback((provider: string) => {
    return aiSecurityManager.getApiKey(provider);
  }, []);

  const updateCost = React.useCallback((provider: string, cost: number) => {
    aiSecurityManager.updateCost(provider, cost);
  }, []);

  return {
    stats,
    checkRateLimit,
    filterContent,
    getApiKey,
    updateCost,
    getConfig: aiSecurityManager.getConfig.bind(aiSecurityManager),
    updateConfig: aiSecurityManager.updateConfig.bind(aiSecurityManager),
    blockUser: aiSecurityManager.blockUser.bind(aiSecurityManager),
    unblockUser: aiSecurityManager.unblockUser.bind(aiSecurityManager)
  };
};

// Import React pour les hooks
import React from 'react';
