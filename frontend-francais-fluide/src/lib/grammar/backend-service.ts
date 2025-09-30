// src/lib/grammar/backend-service.ts
import { grammarDetector } from './detector';
import type { GrammarError, TextAnalysis, CorrectionResult, Suggestion } from '@/types';

// Configuration du service backend
export interface BackendServiceConfig {
  enableLanguageTool: boolean;
  enableCaching: boolean;
  maxTextLength: number;
  cacheTTL: number;
  rateLimitWindow: number;
  rateLimitMaxRequests: number;
}

const DEFAULT_CONFIG: BackendServiceConfig = {
  enableLanguageTool: true,
  enableCaching: true,
  maxTextLength: 10000,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  rateLimitWindow: 60 * 1000, // 1 minute
  rateLimitMaxRequests: 20, // Augmenté pour les tests
};

// Règles de grammaire françaises avancées
export const ADVANCED_GRAMMAR_RULES = [
  // === CONCORDANCE DES TEMPS ===
  {
    id: 'concordance-temps-sequence',
    category: 'grammar',
    severity: 'critical',
    pattern:
      /\b(quand|lorsque|après que|dès que|avant que)\s+[^,]+\s+(je|tu|il|elle|nous|vous|ils|elles)\s+(\w+ais?|avais?|étais?|faisais?)\b/gi,
    check: (match: RegExpExecArray) => {
      const [, conjonction, sujet, verbe] = match;
      const corrections: Record<string, string> = {
        quand: 'quand',
        lorsque: 'lorsque',
        'après que': 'après que',
        'dès que': 'dès que',
        'avant que': 'avant que',
      };

      return {
        message: `Concordance des temps : après "${conjonction}", utilisez le présent ou le futur`,
        suggestions: [
          verbe.replace(/ais?$/, 'e'),
          verbe.replace(/avais?$/, 'ai'),
          verbe.replace(/étais?$/, 'suis'),
          verbe.replace(/faisais?$/, 'fais'),
        ],
      };
    },
  },

  // === SUBJONCTIF AVANCÉ ===
  {
    id: 'subjonctif-expressions-obligation',
    category: 'grammar',
    severity: 'warning',
    pattern:
      /\b(il faut que|il est important que|il est nécessaire que|je veux que|je souhaite que|je désire que)\s+[^,]+\s+(je|tu|il|elle|nous|vous|ils|elles)\s+(\w+e|est|a|fait|va|peut)\b/gi,
    check: (match: RegExpExecArray) => {
      const [, expression, sujet, verbe] = match;
      const subjonctifForms: Record<string, string[]> = {
        e: ['e', 'es', 'e', 'ions', 'iez', 'ent'],
        est: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
        a: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
        fait: ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'],
        va: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
        peut: ['puisse', 'puisses', 'puisse', 'puissions', 'puissiez', 'puissent'],
      };

      const baseForm = Object.keys(subjonctifForms).find(form => verbe.includes(form));
      if (baseForm) {
        return {
          message: `Après "${expression}", utilisez le subjonctif`,
          suggestions: subjonctifForms[baseForm],
        };
      }
      return null;
    },
  },

  // === PARTICIPES PASSÉS COMPLEXES ===
  {
    id: 'participe-passe-accord-complexe',
    category: 'grammar',
    severity: 'critical',
    pattern: /\b(avoir|avait|avons|avez|ont)\s+(\w+é)\s+(\w+é)\s+(\w+é)\b/gi,
    check: (match: RegExpExecArray) => {
      return {
        message:
          'Avec "avoir", le participe passé ne s\'accorde pas avec le complément d\'objet placé avant',
        suggestions: ["Vérifiez l'accord des participes passés"],
      };
    },
  },

  // === BARBARISMES ET ANGLICISMES ===
  {
    id: 'anglicisme-au-final',
    category: 'style',
    severity: 'suggestion',
    pattern: /\bau\s+final\b/gi,
    check: () => ({
      message: 'Anglicisme : "au final" → "finalement" ou "en fin de compte"',
      suggestions: ['finalement', 'en fin de compte', 'en définitive'],
    }),
  },
  {
    id: 'anglicisme-probleme-avec',
    category: 'style',
    severity: 'suggestion',
    pattern: /\b(avoir|éprouver)\s+un\s+problème\s+avec\b/gi,
    check: () => ({
      message:
        'Expression plus française : "avoir un problème avec" → "éprouver des difficultés avec"',
      suggestions: [
        'éprouver des difficultés avec',
        'avoir des difficultés avec',
        'rencontrer des problèmes avec',
      ],
    }),
  },
  {
    id: 'anglicisme-être-confus',
    category: 'style',
    severity: 'warning',
    pattern: /\b(être|est|sont)\s+confus\b/gi,
    check: () => ({
      message: 'Anglicisme : "être confus" → "être confusé" ou "être troublé"',
      suggestions: ['être confusé', 'être troublé', 'être déconcerté'],
    }),
  },
  {
    id: 'anglicisme-avoir-un-probleme',
    category: 'style',
    severity: 'suggestion',
    pattern: /\bavoir\s+un\s+problème\s+avec\b/gi,
    check: () => ({
      message:
        'Expression plus française : "avoir un problème avec" → "éprouver des difficultés avec"',
      suggestions: ['éprouver des difficultés avec', 'rencontrer des difficultés avec'],
    }),
  },

  // === PLÉONASMES ===
  {
    id: 'pleonasme-monter-en-haut',
    category: 'style',
    severity: 'suggestion',
    pattern: /\bmonter\s+en\s+haut\b/gi,
    check: () => ({
      message: 'Pléonasme : "monter en haut" → "monter"',
      suggestions: ['monter'],
    }),
  },
  {
    id: 'pleonasme-descendre-en-bas',
    category: 'style',
    severity: 'suggestion',
    pattern: /\bdescendre\s+en\s+bas\b/gi,
    check: () => ({
      message: 'Pléonasme : "descendre en bas" → "descendre"',
      suggestions: ['descendre'],
    }),
  },
  {
    id: 'pleonasme-sortir-dehors',
    category: 'style',
    severity: 'suggestion',
    pattern: /\bsortir\s+dehors\b/gi,
    check: () => ({
      message: 'Pléonasme : "sortir dehors" → "sortir"',
      suggestions: ['sortir'],
    }),
  },

  // === CONJONCTIONS ET CONNECTEURS ===
  {
    id: 'conjonction-et-cependant',
    category: 'style',
    severity: 'warning',
    pattern: /\bet\s+cependant\b/gi,
    check: () => ({
      message: 'Redondance : "et cependant" → "cependant" ou "mais"',
      suggestions: ['cependant', 'mais', 'néanmoins'],
    }),
  },
  {
    id: 'conjonction-mais-cependant',
    category: 'style',
    severity: 'warning',
    pattern: /\bmais\s+cependant\b/gi,
    check: () => ({
      message: 'Redondance : "mais cependant" → "cependant" ou "mais"',
      suggestions: ['cependant', 'mais', 'néanmoins'],
    }),
  },

  // === PRÉPOSITIONS ===
  {
    id: 'preposition-differer-de',
    category: 'grammar',
    severity: 'warning',
    pattern: /\bdifférer\s+de\b/gi,
    check: () => ({
      message: 'On dit "différer de" (sans "à")',
      suggestions: ['différer de'],
    }),
  },
  {
    id: 'preposition-pallier-quelque-chose',
    category: 'grammar',
    severity: 'warning',
    pattern: /\bpallier\s+à\b/gi,
    check: () => ({
      message: 'On dit "pallier quelque chose" (sans "à")',
      suggestions: ['pallier'],
    }),
  },

  // === EXPRESSIONS COURANTES ===
  {
    id: 'expression-au-jour-d-aujourd-hui',
    category: 'style',
    severity: 'suggestion',
    pattern: /\bau\s+jour\s+d'aujourd'hui\b/gi,
    check: () => ({
      message: 'Redondance : "au jour d\'aujourd\'hui" → "aujourd\'hui"',
      suggestions: ["aujourd'hui"],
    }),
  },
  {
    id: 'expression-avoir-l-air-d-etre',
    category: 'style',
    severity: 'suggestion',
    pattern: /\bavoir\s+l'air\s+d'être\b/gi,
    check: () => ({
      message: 'Redondance : "avoir l\'air d\'être" → "avoir l\'air"',
      suggestions: ["avoir l'air"],
    }),
  },
  {
    id: 'barbarisme-malgre-que',
    category: 'grammar',
    severity: 'critical',
    pattern: /\bmalgré\s+que\b/gi,
    check: () => ({
      message: 'On dit "bien que" ou "quoique" (pas "malgré que")',
      suggestions: ['bien que', 'quoique', 'malgré le fait que'],
    }),
  },
  {
    id: 'barbarisme-pallier-a',
    category: 'grammar',
    severity: 'critical',
    pattern: /\bpallier\s+à\b/gi,
    check: () => ({
      message: 'On dit "pallier quelque chose" (sans "à")',
      suggestions: ['pallier'],
    }),
  },
];

// Classe principale du service backend
export class GrammarBackendService {
  private config: BackendServiceConfig;
  private cache = new Map<string, { data: TextAnalysis; timestamp: number }>();
  private rateLimitCache = new Map<string, { count: number; resetTime: number }>();

  constructor(config: Partial<BackendServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Méthode principale d'analyse
  async analyzeText(
    text: string,
    options: {
      useLanguageTool?: boolean;
      maxErrors?: number;
      clientIP?: string;
    } = {}
  ): Promise<TextAnalysis> {
    const {
      useLanguageTool = this.config.enableLanguageTool,
      maxErrors = 50,
      clientIP = 'unknown',
    } = options;

    // Vérifier le rate limiting
    if (!this.checkRateLimit(clientIP)) {
      throw new Error('Rate limit exceeded');
    }

    // Vérifier la longueur du texte
    if (text.length > this.config.maxTextLength) {
      throw new Error(`Text too long. Maximum ${this.config.maxTextLength} characters allowed.`);
    }

    // Vérifier le cache
    const cacheKey = `analysis_${text}_${useLanguageTool}`;
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Analyse locale avec le detector existant
    const localResult = await this.analyzeWithLocalDetector(text);

    // Analyse avec LanguageTool si activé
    let ltErrors: GrammarError[] = [];
    if (useLanguageTool) {
      try {
        ltErrors = await this.analyzeWithLanguageTool(text);
      } catch (error) {
        console.warn('LanguageTool analysis failed:', error);
      }
    }

    // Combiner les résultats
    const allErrors = [...localResult.errors, ...ltErrors];
    allErrors.sort((a, b) => a.start - b.start);

    // Limiter le nombre d'erreurs
    const limitedErrors = allErrors.slice(0, maxErrors);

    const result: TextAnalysis = {
      text,
      errors: limitedErrors,
      statistics: localResult.statistics,
      suggestions: this.buildSuggestions(limitedErrors),
    };

    // Mettre en cache
    if (this.config.enableCaching) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  // Analyse avec le detector local
  private async analyzeWithLocalDetector(text: string): Promise<TextAnalysis> {
    // Utiliser le detector existant
    const result = await grammarDetector.analyze(text);

    // Ajouter les règles avancées
    const advancedErrors: GrammarError[] = [];

    for (const rule of ADVANCED_GRAMMAR_RULES) {
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);

      while ((match = regex.exec(text)) !== null) {
        const checkResult = rule.check(match);
        if (checkResult) {
          advancedErrors.push({
            id: rule.id,
            type: rule.category as 'spelling' | 'grammar' | 'punctuation' | 'style',
            severity: rule.severity as 'critical' | 'warning' | 'suggestion',
            message: checkResult.message,
            start: match.index,
            end: match.index + match[0].length,
            suggestions: checkResult.suggestions,
          });
        }
      }
    }

    const combinedErrors: GrammarError[] = [...result.errors, ...advancedErrors];
    return {
      text,
      errors: combinedErrors,
      statistics: result.statistics,
      suggestions: this.buildSuggestions(combinedErrors),
    };
  }

  // Analyse avec LanguageTool
  private async analyzeWithLanguageTool(text: string): Promise<GrammarError[]> {
    try {
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          language: 'fr',
          enabledOnly: 'false',
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`LanguageTool API error: ${response.status}`);
      }

      const data = await response.json();

      return (
        data.matches?.map((match: any) => ({
          id: `lt_${match.rule?.id || 'unknown'}`,
          type:
            (match.rule?.category?.id as 'spelling' | 'grammar' | 'punctuation' | 'style') ||
            'grammar',
          severity: match.rule?.issueType === 'misspelling' ? 'critical' : 'warning',
          message: match.message,
          start: match.offset,
          end: match.offset + match.length,
          suggestions: match.replacements?.map((r: any) => r.value) || [],
        })) || []
      );
    } catch (error) {
      console.error('LanguageTool error:', error);
      return [];
    }
  }

  // Gestion du cache
  private getFromCache(key: string): TextAnalysis | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.config.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: TextAnalysis): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Rate limiting
  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = this.rateLimitCache.get(ip);

    if (!entry || now > entry.resetTime) {
      this.rateLimitCache.set(ip, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow,
      });
      return true;
    }

    if (entry.count >= this.config.rateLimitMaxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  // Méthodes utilitaires
  getCacheSize(): number {
    return this.cache.size;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getRateLimitRemaining(ip: string): number {
    const entry = this.rateLimitCache.get(ip);
    if (!entry) return this.config.rateLimitMaxRequests;

    const now = Date.now();
    if (now > entry.resetTime) {
      return this.config.rateLimitMaxRequests;
    }

    return Math.max(0, this.config.rateLimitMaxRequests - entry.count);
  }

  // Correction de texte
  correctText(
    text: string,
    corrections: { offset: number; length: number; replacement: string }[]
  ): string {
    const sortedCorrections = corrections.sort((a, b) => b.offset - a.offset);

    let correctedText = text;
    sortedCorrections.forEach(correction => {
      const before = correctedText.slice(0, correction.offset);
      const after = correctedText.slice(correction.offset + correction.length);
      correctedText = before + correction.replacement + after;
    });

    return correctedText;
  }

  // Génère des suggestions globales à partir des remplacements d'erreurs
  private buildSuggestions(errors: GrammarError[]): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const seen = new Set<string>();

    for (const err of errors) {
      const replacements: string[] = err.suggestions || (err as any).replacements || [];
      for (const rep of replacements) {
        const key = `${rep}|${err.message}`;
        if (rep && !seen.has(key)) {
          seen.add(key);
          suggestions.push({
            text: rep,
            confidence: 0.6,
            explanation: err.message,
          });
        }
      }
    }

    return suggestions;
  }
}

// Instance singleton
export const grammarBackendService = new GrammarBackendService();
