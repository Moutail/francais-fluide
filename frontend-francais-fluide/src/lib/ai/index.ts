// src/lib/ai/index.ts

/**
 * Point d'entrée pour tous les outils IA de FrançaisFluide
 */

// Corrections avancées
export { advancedAICorrector, useAICorrections } from './advanced-corrections';
export type { 
  AIProvider, 
  AICorrectionRequest, 
  AICorrectionResponse, 
  AICorrection 
} from './advanced-corrections';

// Générateur de contenu
export { aiContentGenerator, useAIContentGenerator } from './content-generator';
export type { 
  ContentGenerationRequest, 
  UserProfile, 
  GeneratedExercise, 
  GeneratedText, 
  PedagogicalExplanation, 
  ReformulationSuggestion 
} from './content-generator';

// Gestionnaire de sécurité
export { aiSecurityManager, useAISecurity } from './security';
export type { 
  SecurityConfig, 
  RateLimitInfo, 
  CostInfo, 
  SecurityEvent 
} from './security';

// Gestionnaire d'API
export { apiManager, useAPIManager } from './api-manager';
export type { 
  APIProvider, 
  APIRequest, 
  APIResponse, 
  QuotaInfo 
} from './api-manager';

// Assistant IA
export { AIAssistant, AIAssistantButton } from '@/components/ai/AIAssistant';

// Fonction d'initialisation complète des services IA
import { apiManager } from './api-manager';
import { aiSecurityManager } from './security';

export function initializeAIServices(): void {
  console.log('🤖 Initialisation des services IA...');

  // Initialiser le gestionnaire de sécurité
  // Using apiManager and aiSecurityManager from local modules
  // They are imported/exported in their files
  aiSecurityManager.getConfig();
  console.log('🔒 Gestionnaire de sécurité initialisé');

  // Initialiser le gestionnaire d'API
  apiManager.getAPIStats();
  console.log('🌐 Gestionnaire d\'API initialisé');

  // Vérifier la disponibilité des providers
  const stats: any = apiManager.getAPIStats();
  const availableProviders = (stats?.providers || []).filter((p: any) => p.status === 'active');
  console.log(`📡 ${availableProviders.length} providers d'API disponibles`);

  // Afficher les quotas
  (stats?.providers || []).forEach((provider: any) => {
    const quota = provider.quota;
    if (quota) {
      console.log(`📊 ${provider.name}: ${quota.remaining}/${quota.dailyLimit} requêtes restantes`);
    }
  });

  console.log('✅ Services IA initialisés');
}

// Fonction de nettoyage
export function cleanupAIServices(): void {
  console.log('🧹 Nettoyage des services IA...');
  
  // Nettoyer les caches
  try { (advancedAICorrector as any).clearCache?.(); } catch {}
  try { (aiContentGenerator as any).clearCache?.(); } catch {}
  
  // Réinitialiser les quotas si nécessaire
  apiManager.resetDailyQuotas();
  
  console.log('✅ Nettoyage terminé');
}

// Hook React pour l'initialisation automatique
export function useAIInitialization(): void {
  React.useEffect(() => {
    initializeAIServices();
    
    return () => {
      cleanupAIServices();
    };
  }, []);
}

// Configuration par défaut pour les services IA
export const DEFAULT_AI_CONFIG = {
  // Corrections
  correction: {
    maxRetries: 3,
    timeout: 30000,
    fallbackToLocal: true
  },
  
  // Génération de contenu
  contentGeneration: {
    maxLength: 2000,
    temperature: 0.7,
    maxTokens: 1500
  },
  
  // Sécurité
  security: {
    enableRateLimiting: true,
    enableContentFiltering: true,
    maxRequestsPerMinute: 30
  },
  
  // API
  api: {
    preferredProviders: ['openai', 'claude', 'languageTool'],
    timeout: 30000,
    retryAttempts: 2
  }
};

// Import React pour les hooks
import React from 'react';
