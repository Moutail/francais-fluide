// src/lib/ai/advanced-corrections.ts

/**
 * Système de corrections avancées avec IA pour FrançaisFluide
 * Intégration OpenAI GPT-4, Claude API avec fallback LanguageTool
 */

import { GrammarError, CorrectionResult, TextAnalysis } from '@/types/grammar';

// Types pour les APIs IA
export interface AIProvider {
  name: 'openai' | 'claude' | 'languageTool';
  priority: number;
  cost: number;
  available: boolean;
}

export interface AICorrectionRequest {
  text: string;
  context?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  focus?: 'grammar' | 'spelling' | 'style' | 'all';
  maxCorrections?: number;
}

export interface AICorrectionResponse {
  provider: string;
  corrections: AICorrection[];
  suggestions: string[];
  explanations: string[];
  confidence: number;
  processingTime: number;
  cost: number;
}

export interface AICorrection {
  original: string;
  corrected: string;
  type: 'grammar' | 'spelling' | 'style' | 'punctuation';
  explanation: string;
  confidence: number;
  alternatives?: string[];
}

// Configuration des providers IA
const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'openai',
    priority: 1,
    cost: 0.002, // $0.002 per 1K tokens
    available: true
  },
  {
    name: 'claude',
    priority: 2,
    cost: 0.0015, // $0.0015 per 1K tokens
    available: true
  },
  {
    name: 'languageTool',
    priority: 3,
    cost: 0, // Gratuit
    available: true
  }
];

// Prompts optimisés pour la correction française
const FRENCH_CORRECTION_PROMPTS = {
  openai: `Tu es un expert en grammaire française. Analyse ce texte et fournis des corrections précises.

TEXTE À CORRIGER:
"{text}"

CONTEXTE: {context}
NIVEAU: {level}

Fournis une réponse JSON avec cette structure:
{
  "corrections": [
    {
      "original": "texte incorrect",
      "corrected": "texte corrigé",
      "type": "grammar|spelling|style|punctuation",
      "explanation": "explication pédagogique",
      "confidence": 0.95,
      "alternatives": ["alternative1", "alternative2"]
    }
  ],
  "suggestions": ["suggestion globale 1", "suggestion globale 2"],
  "explanations": ["explication détaillée 1", "explication détaillée 2"],
  "confidence": 0.9
}

Règles:
- Sois précis et pédagogique
- Explique pourquoi la correction est nécessaire
- Propose des alternatives quand approprié
- Adapte le niveau d'explication au niveau de l'utilisateur`,

  claude: `En tant qu'expert en français, corrige ce texte avec des explications pédagogiques.

TEXTE: "{text}"
CONTEXTE: {context}
NIVEAU: {level}

Réponds en JSON:
{
  "corrections": [
    {
      "original": "erreur",
      "corrected": "correction",
      "type": "grammar|spelling|style|punctuation",
      "explanation": "Pourquoi cette correction est nécessaire",
      "confidence": 0.9,
      "alternatives": ["option1", "option2"]
    }
  ],
  "suggestions": ["Amélioration globale"],
  "explanations": ["Explication détaillée"],
  "confidence": 0.85
}

Priorités:
1. Corrections grammaticales essentielles
2. Explications claires et pédagogiques
3. Adaptations au niveau de l'utilisateur`,

  languageTool: `Analyse grammaticale française pour: "{text}"`
};

class AdvancedAICorrector {
  private providers: AIProvider[];
  private cache: Map<string, AICorrectionResponse>;
  private rateLimiters: Map<string, { count: number; resetTime: number }>;
  private costs: Map<string, number>;
  private fallbackDetector: any; // LanguageTool instance

  constructor() {
    this.providers = [...AI_PROVIDERS];
    this.cache = new Map();
    this.rateLimiters = new Map();
    this.costs = new Map();
    this.initializeFallback();
  }

  /**
   * Initialise le fallback LanguageTool
   */
  private initializeFallback(): void {
    // Simulation d'initialisation LanguageTool
    // En production, utiliser la vraie API LanguageTool
    this.fallbackDetector = {
      check: async (text: string) => {
        // Simulation des corrections LanguageTool
        return {
          matches: [],
          language: { name: 'French', code: 'fr' }
        };
      }
    };
  }

  /**
   * Effectue une correction avec IA
   */
  public async correctText(request: AICorrectionRequest): Promise<AICorrectionResponse> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(request);

    // Vérifier le cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return { ...cached, processingTime: performance.now() - startTime };
    }

    // Essayer les providers par ordre de priorité
    for (const provider of this.providers) {
      if (!provider.available) continue;

      try {
        const response = await this.correctWithProvider(provider, request);
        if (response) {
          response.processingTime = performance.now() - startTime;
          
          // Mettre en cache
          this.cache.set(cacheKey, response);
          
          // Mettre à jour les coûts
          this.updateCosts(provider.name, response.cost);
          
          return response;
        }
      } catch (error) {
        console.error(`Erreur avec ${provider.name}:`, error);
        provider.available = false;
        continue;
      }
    }

    // Fallback vers LanguageTool
    return this.fallbackToLanguageTool(request, startTime);
  }

  /**
   * Corrige avec un provider spécifique
   */
  private async correctWithProvider(
    provider: AIProvider, 
    request: AICorrectionRequest
  ): Promise<AICorrectionResponse | null> {
    // Vérifier le rate limiting
    if (!this.checkRateLimit(provider.name)) {
      throw new Error(`Rate limit atteint pour ${provider.name}`);
    }

    switch (provider.name) {
      case 'openai':
        return this.correctWithOpenAI(request);
      case 'claude':
        return this.correctWithClaude(request);
      default:
        return null;
    }
  }

  /**
   * Correction avec OpenAI GPT-4
   */
  private async correctWithOpenAI(request: AICorrectionRequest): Promise<AICorrectionResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    const prompt = this.buildPrompt('openai', request);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en grammaire française. Réponds uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parser la réponse JSON
    const parsed = JSON.parse(content);
    
    // Estimer le coût (approximatif)
    const cost = this.estimateCost('openai', prompt.length, content.length);

    return {
      provider: 'openai',
      corrections: parsed.corrections || [],
      suggestions: parsed.suggestions || [],
      explanations: parsed.explanations || [],
      confidence: parsed.confidence || 0.8,
      processingTime: 0, // Sera défini par l'appelant
      cost
    };
  }

  /**
   * Correction avec Claude API
   */
  private async correctWithClaude(request: AICorrectionRequest): Promise<AICorrectionResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Clé API Claude non configurée');
    }

    const prompt = this.buildPrompt('claude', request);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur Claude: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parser la réponse JSON
    const parsed = JSON.parse(content);
    
    // Estimer le coût
    const cost = this.estimateCost('claude', prompt.length, content.length);

    return {
      provider: 'claude',
      corrections: parsed.corrections || [],
      suggestions: parsed.suggestions || [],
      explanations: parsed.explanations || [],
      confidence: parsed.confidence || 0.85,
      processingTime: 0,
      cost
    };
  }

  /**
   * Fallback vers LanguageTool
   */
  private async fallbackToLanguageTool(
    request: AICorrectionRequest, 
    startTime: number
  ): Promise<AICorrectionResponse> {
    try {
      const response = await this.fallbackDetector.check(request.text);
      
      const corrections: AICorrection[] = response.matches.map((match: any) => ({
        original: match.context.text,
        corrected: match.replacements?.[0]?.value || match.context.text,
        type: this.mapLanguageToolCategory(match.rule.category.id),
        explanation: match.message,
        confidence: 0.7,
        alternatives: match.replacements?.map((r: any) => r.value) || []
      }));

      return {
        provider: 'languageTool',
        corrections,
        suggestions: ['Utilisez LanguageTool comme fallback'],
        explanations: ['Corrections basées sur LanguageTool'],
        confidence: 0.7,
        processingTime: performance.now() - startTime,
        cost: 0
      };
    } catch (error) {
      console.error('Erreur LanguageTool fallback:', error);
      
      // Dernier recours : corrections basiques
      return this.getBasicFallback(request, startTime);
    }
  }

  /**
   * Fallback basique en cas d'échec total
   */
  private getBasicFallback(
    request: AICorrectionRequest, 
    startTime: number
  ): AICorrectionResponse {
    return {
      provider: 'fallback',
      corrections: [],
      suggestions: ['Service temporairement indisponible'],
      explanations: ['Veuillez réessayer plus tard'],
      confidence: 0.1,
      processingTime: performance.now() - startTime,
      cost: 0
    };
  }

  /**
   * Construit le prompt pour un provider
   */
  private buildPrompt(provider: 'openai' | 'claude' | 'languageTool', request: AICorrectionRequest): string {
    const template = FRENCH_CORRECTION_PROMPTS[provider];
    
    return template
      .replace('{text}', request.text)
      .replace('{context}', request.context || 'Général')
      .replace('{level}', request.level || 'intermediate');
  }

  /**
   * Vérifie le rate limiting
   */
  private checkRateLimit(provider: string): boolean {
    const now = Date.now();
    const limit = this.rateLimiters.get(provider) || { count: 0, resetTime: now + 60000 };
    
    if (now > limit.resetTime) {
      limit.count = 0;
      limit.resetTime = now + 60000; // Reset toutes les minutes
    }
    
    const maxRequests = provider === 'openai' ? 60 : provider === 'claude' ? 50 : 100;
    
    if (limit.count >= maxRequests) {
      return false;
    }
    
    limit.count++;
    this.rateLimiters.set(provider, limit);
    return true;
  }

  /**
   * Génère une clé de cache
   */
  private generateCacheKey(request: AICorrectionRequest): string {
    return `${request.text}-${request.level}-${request.focus}-${request.maxCorrections}`;
  }

  /**
   * Vérifie si le cache est valide
   */
  private isCacheValid(response: AICorrectionResponse): boolean {
    const maxAge = 30 * 60 * 1000; // 30 minutes
    return response.processingTime < maxAge;
  }

  /**
   * Estime le coût d'une requête
   */
  private estimateCost(provider: string, inputTokens: number, outputTokens: number): number {
    const providerConfig = this.providers.find(p => p.name === provider);
    if (!providerConfig) return 0;
    
    const totalTokens = inputTokens + outputTokens;
    return (totalTokens / 1000) * providerConfig.cost;
  }

  /**
   * Met à jour les coûts
   */
  private updateCosts(provider: string, cost: number): void {
    const current = this.costs.get(provider) || 0;
    this.costs.set(provider, current + cost);
  }

  /**
   * Mappe les catégories LanguageTool vers nos types
   */
  private mapLanguageToolCategory(category: string): 'grammar' | 'spelling' | 'style' | 'punctuation' {
    const mapping: Record<string, 'grammar' | 'spelling' | 'style' | 'punctuation'> = {
      'GRAMMAR': 'grammar',
      'SPELLING': 'spelling',
      'STYLE': 'style',
      'PUNCTUATION': 'punctuation'
    };
    
    return mapping[category] || 'grammar';
  }

  /**
   * Obtient les statistiques des providers
   */
  public getProviderStats(): any {
    return {
      providers: this.providers.map(p => ({
        name: p.name,
        available: p.available,
        cost: this.costs.get(p.name) || 0
      })),
      cacheSize: this.cache.size,
      totalCost: Array.from(this.costs.values()).reduce((sum, cost) => sum + cost, 0)
    };
  }

  /**
   * Réinitialise un provider
   */
  public resetProvider(providerName: string): void {
    const provider = this.providers.find(p => p.name === providerName);
    if (provider) {
      provider.available = true;
    }
  }

  /**
   * Nettoie le cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

// Instance singleton
export const advancedAICorrector = new AdvancedAICorrector();

// Hook React pour utiliser le correcteur IA
export const useAICorrections = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastResponse, setLastResponse] = React.useState<AICorrectionResponse | null>(null);

  const correctText = React.useCallback(async (request: AICorrectionRequest) => {
    setIsLoading(true);
    try {
      const response = await advancedAICorrector.correctText(request);
      setLastResponse(response);
      return response;
    } catch (error) {
      console.error('Erreur correction IA:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStats = React.useCallback(() => {
    return advancedAICorrector.getProviderStats();
  }, []);

  return {
    correctText,
    isLoading,
    lastResponse,
    getStats,
    clearCache: advancedAICorrector.clearCache.bind(advancedAICorrector)
  };
};

// Import React pour les hooks
import React from 'react';
