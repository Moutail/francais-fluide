// src/lib/grammar/detector.ts
import { GrammarRule, GrammarError, TextAnalysis } from '@/types/grammar';

/**
 * Système de détection de fautes extensible pour le français
 * Utilise une approche multi-couches avec règles, patterns et ML
 */

// Base de règles grammaticales françaises
export const GRAMMAR_RULES: GrammarRule[] = [
  // === ACCORDS ===
  // Règle temporairement désactivée à cause de faux positifs
  /*
  {
    id: 'accord-adjectif-nom',
    category: 'grammar',
    severity: 'critical',
    pattern: /\b(un|une|le|la|ce|cette)\s+(\w+)\s+(\w+e?s?)\b/gi,
    check: (match: RegExpExecArray) => {
      const [, determinant, nom, adjectif] = match;
      const isFemininDeterminant = ['une', 'la', 'cette'].includes(determinant.toLowerCase());
      const isPluralNom = nom.endsWith('s') || nom.endsWith('x');
      
      // Dictionnaire de noms communs pour éviter les faux positifs (v2)
      const nomsCommuns = new Set([
        'maison', 'voiture', 'table', 'chaise', 'porte', 'fenêtre', 'fleur', 'plante',
        'personne', 'femme', 'fille', 'mère', 'sœur', 'tante', 'grand-mère',
        'ville', 'rue', 'place', 'école', 'université', 'bibliothèque', 'librairie',
        'boutique', 'magasin', 'restaurant', 'café', 'hôtel', 'appartement',
        'chambre', 'cuisine', 'salle', 'pièce', 'bureau', 'jardin', 'parc', 'forêt',
        'montagne', 'rivière', 'mer', 'océan', 'lac', 'étang', 'plage', 'sable',
        'pierre', 'roche', 'terre', 'sol', 'herbe', 'arbre', 'feuille',
        'oiseau', 'chat', 'chien', 'cheval', 'vache', 'mouton', 'cochon', 'poule',
        'poisson', 'serpent', 'araignée', 'abeille', 'papillon', 'mouche', 'moustique'
      ]);
      
      // Ne pas traiter les noms communs comme des adjectifs
      if (nomsCommuns.has(nom.toLowerCase())) {
        return null;
      }
      
      // Vérification simplifiée - à enrichir avec dictionnaire
      if (isFemininDeterminant && !adjectif.endsWith('e') && !adjectif.endsWith('es')) {
        return {
          message: `L'adjectif "${adjectif}" devrait s'accorder avec le nom féminin "${nom}"`,
          suggestions: [adjectif + 'e', adjectif + 's']
        };
      }
      
      if (isPluralNom && !adjectif.endsWith('s') && !adjectif.endsWith('x')) {
        return {
          message: `L'adjectif "${adjectif}" devrait être au pluriel pour s'accorder avec "${nom}"`,
          suggestions: [adjectif + 's']
        };
      }
      
      return null;
    }
  },
  */
  
  // === CONJUGAISON ===
  {
    id: 'conjugaison-3p-singulier',
    category: 'grammar',
    severity: 'critical',
    pattern: /\b(il|elle|on)\s+([\w]+er|[\w]+ir|[\w]+re)\b/gi,
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

  // === ORTHOGRAPHE ===
  {
    id: 'a-vs-à',
    category: 'spelling',
    severity: 'warning',
    pattern: /\b(a|à)\s+(le|la|les|un|une|des|du)\b/gi,
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
    pattern: /\b(et|est)\s+(très|vraiment|super|trop|plus|moins)\b/gi,
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

  // === PONCTUATION ===
  {
    id: 'espace-ponctuation-double',
    category: 'punctuation',
    severity: 'suggestion',
    pattern: /(\w)([;:!?])/g,
    check: (match: RegExpExecArray) => {
      const [, mot, ponctuation] = match;
      return {
        message: `En français, il faut une espace avant "${ponctuation}"`,
        suggestions: [mot + ' ' + ponctuation]
      };
    }
  },

  // === STYLE ===
  {
    id: 'repetition-mot',
    category: 'style',
    severity: 'suggestion',
    pattern: /\b(\w{4,})\s+(?:\w+\s+){0,3}\1\b/gi,
    check: (match: RegExpExecArray) => {
      const [fullMatch, motRepete] = match;
      
      // Ignorer les mots courants qui peuvent se répéter
      const motsAutorises = ['pour', 'dans', 'avec', 'sans', 'mais', 'donc'];
      if (motsAutorises.includes(motRepete.toLowerCase())) return null;
      
      return {
        message: `Le mot "${motRepete}" est répété rapidement`,
        suggestions: ['[Reformuler pour éviter la répétition]']
      };
    }
  }
];

// Patterns d'erreurs fréquents (extensible via ML)
export const ERROR_PATTERNS = {
  // Confusion homophones
  homophones: [
    { wrong: /\bses\b(?=\s+(?:amis?|parents?|enfants?))/gi, correct: 'ces', message: 'Confusion ses/ces' },
    { wrong: /\bça\b(?=\s+(?:enfants?|personnes?|gens))/gi, correct: 'ces', message: 'Confusion ça/ces' },
    { wrong: /\bou\b(?=\s+(?:est|sont|était|étaient))/gi, correct: 'où', message: 'Confusion ou/où' },
    { wrong: /\bla\b(?=\s+(?:bas|haut))/gi, correct: 'là', message: 'Confusion la/là' }
  ],
  
  // Anglicismes courants
  anglicismes: [
    { pattern: /\b(dfinitivement|définitivement)\b/gi, suggestion: 'certainement', message: 'Anglicisme : "definitively"' },
    { pattern: /\b(supporter)\b/gi, suggestion: 'soutenir', message: 'Anglicisme : préférez "soutenir"' },
    { pattern: /\b(opportunité)\b(?=\s+de)/gi, suggestion: 'occasion', message: 'Anglicisme : préférez "occasion"' }
  ],

  // Expressions incorrectes
  expressions: [
    { pattern: /\bmalgré\s+que\b/gi, suggestion: 'bien que', message: '"Malgré que" est incorrect' },
    { pattern: /\bpallier\s+à\b/gi, suggestion: 'pallier', message: 'On dit "pallier quelque chose", pas "pallier à"' },
    { pattern: /\bse\s+rappeler\s+de\b/gi, suggestion: 'se rappeler', message: 'On dit "se rappeler quelque chose"' }
  ]
};

/**
 * Classe principale de détection grammaticale
 */
export class GrammarDetector {
  private rules: GrammarRule[];
  private customPatterns: Map<string, any>;
  private cache: Map<string, GrammarError[]>;

  constructor() {
    this.rules = [...GRAMMAR_RULES];
    this.customPatterns = new Map();
    this.cache = new Map();
  }

  /**
   * Analyse complète d'un texte
   */
  public async analyze(text: string): Promise<TextAnalysis> {
    // Vérifier le cache
    const cacheKey = this.getCacheKey(text);
    if (this.cache.has(cacheKey)) {
      return {
        text,
        errors: this.cache.get(cacheKey)!,
        statistics: this.calculateStatistics(text, this.cache.get(cacheKey)!)
      };
    }

    const errors: GrammarError[] = [];
    
    // 1. Appliquer les règles grammaticales
    for (const rule of this.rules) {
      const matches = this.findMatches(text, rule);
      errors.push(...matches);
    }

    // 2. Détecter les patterns d'erreurs
    errors.push(...this.detectPatterns(text));

    // 3. Analyse contextuelle avancée
    errors.push(...await this.contextualAnalysis(text));

    // Trier les erreurs par position
    errors.sort((a, b) => a.offset - b.offset);

    // Mettre en cache
    this.cache.set(cacheKey, errors);

    return {
      text,
      errors,
      statistics: this.calculateStatistics(text, errors)
    };
  }

  /**
   * Trouve les correspondances pour une règle donnée
   */
  private findMatches(text: string, rule: GrammarRule): GrammarError[] {
    const errors: GrammarError[] = [];
    let match;

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

    return errors;
  }

  /**
   * Détecte les patterns d'erreurs connus
   */
  private detectPatterns(text: string): GrammarError[] {
    const errors: GrammarError[] = [];

    // Homophones
    for (const homophone of ERROR_PATTERNS.homophones) {
      let match;
      while ((match = homophone.wrong.exec(text)) !== null) {
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
    for (const anglicisme of ERROR_PATTERNS.anglicismes) {
      let match;
      while ((match = anglicisme.pattern.exec(text)) !== null) {
        errors.push({
          offset: match.index,
          length: match[0].length,
          message: anglicisme.message,
          replacements: [anglicisme.suggestion],
          rule: {
            id: `anglicisme`,
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
   * Analyse contextuelle avancée (pour future intégration ML)
   */
  private async contextualAnalysis(text: string): Promise<GrammarError[]> {
    const errors: GrammarError[] = [];

    // Détection de phrases trop longues
    const sentences = text.split(/[.!?]+/);
    let currentOffset = 0;

    for (const sentence of sentences) {
      const wordCount = sentence.trim().split(/\s+/).length;
      
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

    // Détection de la voix passive excessive
    const passivePattern = /\b(est|sont|était|étaient|sera|seront)\s+(\w+é|ée|és|ées)\b/gi;
    let passiveCount = 0;
    let match;

    while ((match = passivePattern.exec(text)) !== null) {
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
   * Calcule les statistiques du texte
   */
  private calculateStatistics(text: string, errors: GrammarError[]): any {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      averageWordLength: words.reduce((acc, w) => acc + w.length, 0) / words.length,
      averageSentenceLength: words.length / sentences.length,
      errorCount: errors.length,
      errorDensity: errors.length / words.length,
      errorsByCategory: this.groupErrorsByCategory(errors),
      readabilityScore: this.calculateReadability(text)
    };
  }

  /**
   * Groupe les erreurs par catégorie
   */
  private groupErrorsByCategory(errors: GrammarError[]): Record<string, number> {
    return errors.reduce((acc, error) => {
      acc[error.rule.category] = (acc[error.rule.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calcule un score de lisibilité (Flesch adapté au français)
   */
  private calculateReadability(text: string): number {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const syllables = words.reduce((acc, word) => acc + this.countSyllables(word), 0);
    
    // Formule de Flesch adaptée au français
    const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Compte les syllabes dans un mot (approximation)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = /[aeiouy]/.test(word[i]);
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
   * Génère une clé de cache pour un texte
   */
  private getCacheKey(text: string): string {
    return text.substring(0, 100) + text.length;
  }

  /**
   * Ajoute une règle personnalisée
   */
  public addCustomRule(rule: GrammarRule): void {
    this.rules.push(rule);
    this.cache.clear(); // Invalider le cache
  }

  /**
   * Réinitialise le cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

// Export d'une instance singleton
export const grammarDetector = new GrammarDetector();