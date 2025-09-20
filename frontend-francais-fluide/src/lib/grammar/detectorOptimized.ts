// src/lib/grammar/detectorOptimized.ts
import { GrammarRule, GrammarError, TextAnalysis } from '@/types/grammar';

/**
 * Système de détection de fautes optimisé pour le français
 * Utilise des regex précompilées, un cache intelligent et des optimisations de performance
 */

// Cache intelligent avec LRU (Last Recently Used)
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Déplacer vers la fin (plus récemment utilisé)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Supprimer le moins récemment utilisé (premier élément)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Regex précompilées pour de meilleures performances
const COMPILED_PATTERNS = {
  // Conjugaison
  conjugaison3pSingulier: /\b(il|elle|on)\s+([\w]+er|[\w]+ir|[\w]+re)\b/gi,
  
  // Orthographe
  aVsA: /\b(a|à)\s+(le|la|les|un|une|des|du)\b/gi,
  etVsEst: /\b(et|est)\s+(très|vraiment|super|trop|plus|moins)\b/gi,
  
  // Ponctuation
  espacePonctuationDouble: /(\w)([;:!?])/g,
  
  // Style
  repetitionMot: /\b(\w{4,})\s+(?:\w+\s+){0,3}\1\b/gi,
  
  // Homophones
  sesVsCes: /\bses\b(?=\s+(?:amis?|parents?|enfants?))/gi,
  caVsCes: /\bça\b(?=\s+(?:enfants?|personnes?|gens))/gi,
  ouVsOu: /\bou\b(?=\s+(?:est|sont|était|étaient))/gi,
  laVsLa: /\bla\b(?=\s+(?:bas|haut))/gi,
  
  // Anglicismes
  definitivement: /\b(dfinitivement|définitivement)\b/gi,
  supporter: /\b(supporter)\b/gi,
  opportunite: /\b(opportunité)\b(?=\s+de)/gi,
  
  // Expressions
  malgreQue: /\bmalgré\s+que\b/gi,
  pallierA: /\bpallier\s+à\b/gi,
  seRappelerDe: /\bse\s+rappeler\s+de\b/gi,
  
  // Analyse contextuelle
  voixPassive: /\b(est|sont|était|étaient|sera|seront)\s+(\w+é|ée|és|ées)\b/gi,
  phraseLongue: /[.!?]+/g,
  mots: /\s+/g,
  syllabes: /[aeiouy]/gi
};

// Base de règles grammaticales optimisées
export const OPTIMIZED_GRAMMAR_RULES: GrammarRule[] = [
  {
    id: 'conjugaison-3p-singulier',
    category: 'grammar',
    severity: 'critical',
    pattern: COMPILED_PATTERNS.conjugaison3pSingulier,
    check: (match: RegExpExecArray) => {
      const [, sujet, verbe] = match;
      
      if (verbe.endsWith('er') || verbe.endsWith('ir') || verbe.endsWith('re')) {
        const racine = verbe.slice(0, -2);
        const suggestions = verbe.endsWith('er') 
          ? [racine + 'e'] 
          : verbe.endsWith('ir')
          ? [racine + 'it']
          : [racine];
          
        return {
          message: `Le verbe "${verbe}" n'est pas conjugué avec "${sujet}"`,
          suggestions
        };
      }
      
      return null;
    }
  },
  {
    id: 'a-vs-à',
    category: 'spelling',
    severity: 'warning',
    pattern: COMPILED_PATTERNS.aVsA,
    check: (match: RegExpExecArray) => {
      const [, aOuA, article] = match;
      
      if (aOuA === 'à') {
        return {
          message: `"à" est une préposition, ici il faut le verbe "a"`,
          suggestions: ['a ' + article]
        };
      }
      
      return null;
    }
  },
  {
    id: 'et-vs-est',
    category: 'spelling',
    severity: 'warning',
    pattern: COMPILED_PATTERNS.etVsEst,
    check: (match: RegExpExecArray) => {
      const [, etOuEst, adverbe] = match;
      
      if (etOuEst === 'et') {
        return {
          message: `Avant un adverbe comme "${adverbe}", utilisez "est" (verbe être) et non "et" (conjonction)`,
          suggestions: ['est ' + adverbe]
        };
      }
      
      return null;
    }
  },
  {
    id: 'espace-ponctuation-double',
    category: 'punctuation',
    severity: 'suggestion',
    pattern: COMPILED_PATTERNS.espacePonctuationDouble,
    check: (match: RegExpExecArray) => {
      const [, mot, ponctuation] = match;
      return {
        message: `En français, il faut une espace avant "${ponctuation}"`,
        suggestions: [mot + ' ' + ponctuation]
      };
    }
  },
  {
    id: 'repetition-mot',
    category: 'style',
    severity: 'suggestion',
    pattern: COMPILED_PATTERNS.repetitionMot,
    check: (match: RegExpExecArray) => {
      const [fullMatch, motRepete] = match;
      
      // Ignorer les mots courants qui peuvent se répéter
      const motsAutorises = new Set(['pour', 'dans', 'avec', 'sans', 'mais', 'donc']);
      if (motsAutorises.has(motRepete.toLowerCase())) return null;
      
      return {
        message: `Le mot "${motRepete}" est répété rapidement`,
        suggestions: ['[Reformuler pour éviter la répétition]']
      };
    }
  }
];

/**
 * Classe de détection grammaticale optimisée
 */
export class OptimizedGrammarDetector {
  private rules: GrammarRule[];
  private customPatterns: Map<string, any>;
  private cache: LRUCache<string, GrammarError[]>;
  private statisticsCache: LRUCache<string, any>;
  private performanceMetrics: {
    totalChecks: number;
    cacheHits: number;
    averageTime: number;
  };

  constructor() {
    this.rules = [...OPTIMIZED_GRAMMAR_RULES];
    this.customPatterns = new Map();
    this.cache = new LRUCache<string, GrammarError[]>(200); // Cache plus grand
    this.statisticsCache = new LRUCache<string, any>(100);
    this.performanceMetrics = {
      totalChecks: 0,
      cacheHits: 0,
      averageTime: 0
    };
  }

  /**
   * Analyse complète d'un texte avec optimisations
   */
  public async analyze(text: string): Promise<TextAnalysis> {
    const startTime = performance.now();
    this.performanceMetrics.totalChecks++;

    // Vérifier le cache
    const cacheKey = this.getCacheKey(text);
    const cachedErrors = this.cache.get(cacheKey);
    
    if (cachedErrors) {
      this.performanceMetrics.cacheHits++;
      const endTime = performance.now();
      this.updateAverageTime(endTime - startTime);
      
      return {
        text,
        errors: cachedErrors,
        statistics: this.getCachedStatistics(text, cachedErrors)
      };
    }

    const errors: GrammarError[] = [];
    
    // 1. Appliquer les règles grammaticales (optimisées)
    errors.push(...this.findMatchesOptimized(text));

    // 2. Détecter les patterns d'erreurs (optimisés)
    errors.push(...this.detectPatternsOptimized(text));

    // 3. Analyse contextuelle (optimisée)
    errors.push(...this.contextualAnalysisOptimized(text));

    // Trier les erreurs par position
    errors.sort((a, b) => a.offset - b.offset);

    // Mettre en cache
    this.cache.set(cacheKey, errors);
    
    const endTime = performance.now();
    this.updateAverageTime(endTime - startTime);

    return {
      text,
      errors,
      statistics: this.calculateStatisticsOptimized(text, errors)
    };
  }

  /**
   * Recherche optimisée des correspondances
   */
  private findMatchesOptimized(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Paralléliser le traitement des règles
    for (const rule of this.rules) {
      let match;
      // Réinitialiser le lastIndex pour éviter les problèmes de concurrence
      rule.pattern.lastIndex = 0;
      
      while ((match = rule.pattern.exec(text)) !== null) {
        const checkResult = rule.check(match);
        
        if (checkResult) {
          errors.push({
            offset: match.index,
            length: match[0].length,
            message: checkResult.message,
            replacements: checkResult.suggestions,
            rule: {
              id: rule.id,
              category: rule.category,
              severity: rule.severity
            },
            context: {
              text: match[0],
              offset: 0,
              length: match[0].length
            }
          });
        }
      }
    }

    return errors;
  }

  /**
   * Détection optimisée des patterns d'erreurs
   */
  private detectPatternsOptimized(text: string): GrammarError[] {
    const errors: GrammarError[] = [];

    // Homophones
    const homophonePatterns = [
      { pattern: COMPILED_PATTERNS.sesVsCes, correct: 'ces', message: 'Confusion ses/ces' },
      { pattern: COMPILED_PATTERNS.caVsCes, correct: 'ces', message: 'Confusion ça/ces' },
      { pattern: COMPILED_PATTERNS.ouVsOu, correct: 'où', message: 'Confusion ou/où' },
      { pattern: COMPILED_PATTERNS.laVsLa, correct: 'là', message: 'Confusion la/là' }
    ];

    for (const homophone of homophonePatterns) {
      let match;
      homophone.pattern.lastIndex = 0;
      while ((match = homophone.pattern.exec(text)) !== null) {
        errors.push({
          offset: match.index,
          length: match[0].length,
          message: homophone.message,
          replacements: [homophone.correct],
          rule: {
            id: `homophone-${homophone.correct}`,
            category: 'spelling',
            severity: 'warning'
          },
          context: {
            text: match[0],
            offset: 0,
            length: match[0].length
          }
        });
      }
    }

    // Anglicismes
    const anglicismePatterns = [
      { pattern: COMPILED_PATTERNS.definitivement, suggestion: 'certainement', message: 'Anglicisme : "definitively"' },
      { pattern: COMPILED_PATTERNS.supporter, suggestion: 'soutenir', message: 'Anglicisme : préférez "soutenir"' },
      { pattern: COMPILED_PATTERNS.opportunite, suggestion: 'occasion', message: 'Anglicisme : préférez "occasion"' }
    ];

    for (const anglicisme of anglicismePatterns) {
      let match;
      anglicisme.pattern.lastIndex = 0;
      while ((match = anglicisme.pattern.exec(text)) !== null) {
        errors.push({
          offset: match.index,
          length: match[0].length,
          message: anglicisme.message,
          replacements: [anglicisme.suggestion],
          rule: {
            id: 'anglicisme',
            category: 'style',
            severity: 'suggestion'
          },
          context: {
            text: match[0],
            offset: 0,
            length: match[0].length
          }
        });
      }
    }

    // Expressions incorrectes
    const expressionPatterns = [
      { pattern: COMPILED_PATTERNS.malgreQue, suggestion: 'bien que', message: '"Malgré que" est incorrect' },
      { pattern: COMPILED_PATTERNS.pallierA, suggestion: 'pallier', message: 'On dit "pallier quelque chose", pas "pallier à"' },
      { pattern: COMPILED_PATTERNS.seRappelerDe, suggestion: 'se rappeler', message: 'On dit "se rappeler quelque chose"' }
    ];

    for (const expression of expressionPatterns) {
      let match;
      expression.pattern.lastIndex = 0;
      while ((match = expression.pattern.exec(text)) !== null) {
        errors.push({
          offset: match.index,
          length: match[0].length,
          message: expression.message,
          replacements: [expression.suggestion],
          rule: {
            id: 'expression-incorrecte',
            category: 'style',
            severity: 'suggestion'
          },
          context: {
            text: match[0],
            offset: 0,
            length: match[0].length
          }
        });
      }
    }

    return errors;
  }

  /**
   * Analyse contextuelle optimisée
   */
  private contextualAnalysisOptimized(text: string): GrammarError[] {
    const errors: GrammarError[] = [];

    // Détection de phrases trop longues (optimisé)
    const sentences = text.split(COMPILED_PATTERNS.phraseLongue);
    let currentOffset = 0;

    for (const sentence of sentences) {
      const wordCount = sentence.trim().split(COMPILED_PATTERNS.mots).length;
      
      if (wordCount > 35) {
        errors.push({
          offset: currentOffset,
          length: sentence.length,
          message: 'Cette phrase est très longue. Considérez la diviser pour plus de clarté.',
          replacements: [],
          rule: {
            id: 'phrase-trop-longue',
            category: 'style',
            severity: 'suggestion'
          },
          context: {
            text: sentence,
            offset: 0,
            length: sentence.length
          }
        });
      }
      
      currentOffset += sentence.length + 1;
    }

    // Détection de la voix passive excessive (optimisé)
    let passiveCount = 0;
    let match;
    COMPILED_PATTERNS.voixPassive.lastIndex = 0;

    while ((match = COMPILED_PATTERNS.voixPassive.exec(text)) !== null) {
      passiveCount++;
      
      if (passiveCount > 3) {
        errors.push({
          offset: match.index,
          length: match[0].length,
          message: 'Utilisation excessive de la voix passive. Privilégiez la voix active.',
          replacements: [],
          rule: {
            id: 'voix-passive-excessive',
            category: 'style',
            severity: 'suggestion'
          },
          context: {
            text: match[0],
            offset: 0,
            length: match[0].length
          }
        });
        break;
      }
    }

    return errors;
  }

  /**
   * Calcul des statistiques optimisé
   */
  private calculateStatisticsOptimized(text: string, errors: GrammarError[]): any {
    const cacheKey = `stats-${text.substring(0, 50)}-${errors.length}`;
    const cachedStats = this.statisticsCache.get(cacheKey);
    
    if (cachedStats) {
      return cachedStats;
    }

    const words = text.split(COMPILED_PATTERNS.mots).filter(w => w.length > 0);
    const sentences = text.split(COMPILED_PATTERNS.phraseLongue).filter(s => s.trim().length > 0);
    
    const stats = {
      wordCount: words.length,
      sentenceCount: sentences.length,
      averageWordLength: words.reduce((acc, w) => acc + w.length, 0) / words.length,
      averageSentenceLength: words.length / sentences.length,
      errorCount: errors.length,
      errorDensity: errors.length / words.length,
      errorsByCategory: this.groupErrorsByCategory(errors),
      readabilityScore: this.calculateReadabilityOptimized(text)
    };

    this.statisticsCache.set(cacheKey, stats);
    return stats;
  }

  /**
   * Score de lisibilité optimisé
   */
  private calculateReadabilityOptimized(text: string): number {
    const words = text.split(COMPILED_PATTERNS.mots).filter(w => w.length > 0);
    const sentences = text.split(COMPILED_PATTERNS.phraseLongue).filter(s => s.trim().length > 0);
    
    // Compter les syllabes de manière optimisée
    let syllableCount = 0;
    for (const word of words) {
      syllableCount += this.countSyllablesOptimized(word);
    }
    
    // Formule de Flesch adaptée au français
    const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllableCount / words.length);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Comptage de syllabes optimisé
   */
  private countSyllablesOptimized(word: string): number {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = COMPILED_PATTERNS.syllabes.test(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // Ajustements pour le français
    if (word.endsWith('e') && count > 1) count--;
    if (word.endsWith('es') && count > 1) count--;
    
    return Math.max(1, count);
  }

  /**
   * Groupe les erreurs par catégorie (optimisé)
   */
  private groupErrorsByCategory(errors: GrammarError[]): Record<string, number> {
    const categories: Record<string, number> = {};
    
    for (const error of errors) {
      categories[error.rule.category] = (categories[error.rule.category] || 0) + 1;
    }
    
    return categories;
  }

  /**
   * Clé de cache optimisée
   */
  private getCacheKey(text: string): string {
    // Utiliser un hash simple pour les textes longs
    if (text.length > 1000) {
      return `${text.length}-${text.charCodeAt(0)}-${text.charCodeAt(text.length - 1)}`;
    }
    return text.substring(0, 100) + text.length;
  }

  /**
   * Récupération des statistiques en cache
   */
  private getCachedStatistics(text: string, errors: GrammarError[]): any {
    const cacheKey = `stats-${text.substring(0, 50)}-${errors.length}`;
    return this.statisticsCache.get(cacheKey) || this.calculateStatisticsOptimized(text, errors);
  }

  /**
   * Mise à jour du temps moyen
   */
  private updateAverageTime(time: number): void {
    this.performanceMetrics.averageTime = 
      (this.performanceMetrics.averageTime * (this.performanceMetrics.totalChecks - 1) + time) / 
      this.performanceMetrics.totalChecks;
  }

  /**
   * Obtient les métriques de performance
   */
  public getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheHitRate: this.performanceMetrics.totalChecks > 0 
        ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalChecks) * 100 
        : 0,
      cacheSize: this.cache.size(),
      statisticsCacheSize: this.statisticsCache.size()
    };
  }

  /**
   * Ajoute une règle personnalisée
   */
  public addCustomRule(rule: GrammarRule): void {
    this.rules.push(rule);
    this.cache.clear(); // Invalider le cache
  }

  /**
   * Réinitialise les caches
   */
  public clearCache(): void {
    this.cache.clear();
    this.statisticsCache.clear();
  }

  /**
   * Optimise les performances en préchargeant les patterns
   */
  public warmupCache(): void {
    // Précharger les patterns les plus courants
    const commonTexts = [
      "Bonjour, comment allez-vous ?",
      "Il mange du pain avec du beurre.",
      "Elle est très belle et intelligente.",
      "Nous allons au parc pour jouer.",
      "Le chat dort sur le canapé."
    ];

    for (const text of commonTexts) {
      this.analyze(text);
    }
  }
}

// Export d'une instance singleton optimisée
export const optimizedGrammarDetector = new OptimizedGrammarDetector();
