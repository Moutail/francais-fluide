// Service pour l'intégration de l'API LanguageTool
// Documentation: https://languagetool.org/http-api/

export interface LanguageToolError {
  message: string;
  shortMessage: string;
  replacements: Array<{ value: string }>;
  offset: number;
  length: number;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  rule: {
    id: string;
    description: string;
    issueType: string;
    category: {
      id: string;
      name: string;
    };
  };
  sentence: string;
}

export interface LanguageToolResponse {
  software: {
    name: string;
    version: string;
    buildDate: string;
    apiVersion: number;
    status: string;
    premium: boolean;
  };
  warnings: {
    incompleteResults: boolean;
  };
  language: {
    name: string;
    code: string;
    detectedLanguage: {
      name: string;
      code: string;
      confidence: number;
    };
  };
  matches: LanguageToolError[];
}

class LanguageToolService {
  private baseUrl = 'https://api.languagetool.org/v2';
  private maxRetries = 3;
  private retryDelay = 1000;

  /**
   * Vérifier la grammaire d'un texte
   */
  async checkGrammar(text: string, language: string = 'fr'): Promise<LanguageToolError[]> {
    if (!text.trim()) {
      return [];
    }

    try {
      const response = await this.makeRequest('/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          language: language,
          enabledOnly: 'false',
          level: 'picky'
        })
      });

      const data: LanguageToolResponse = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Erreur LanguageTool:', error);
      return [];
    }
  }

  /**
   * Vérifier la grammaire avec retry automatique
   */
  async checkGrammarWithRetry(text: string, language: string = 'fr'): Promise<LanguageToolError[]> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const errors = await this.checkGrammar(text, language);
        return errors;
      } catch (error) {
        console.warn(`Tentative ${attempt}/${this.maxRetries} échouée:`, error);
        
        if (attempt === this.maxRetries) {
          console.error('Toutes les tentatives ont échoué');
          return [];
        }
        
        // Attendre avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
    
    return [];
  }

  /**
   * Obtenir les langues supportées
   */
  async getSupportedLanguages(): Promise<any[]> {
    try {
      const response = await this.makeRequest('/languages');
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération langues:', error);
      return [];
    }
  }

  /**
   * Vérifier la santé de l'API
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/languages');
      return response.ok;
    } catch (error) {
      console.error('LanguageTool API non disponible:', error);
      return false;
    }
  }

  /**
   * Effectuer une requête avec gestion d'erreurs
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'FrançaisFluide/1.0',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`LanguageTool API error: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  /**
   * Formater les erreurs pour l'affichage
   */
  formatErrors(errors: LanguageToolError[]): Array<{
    id: string;
    message: string;
    shortMessage: string;
    suggestions: string[];
    start: number;
    end: number;
    type: 'grammar' | 'spelling' | 'style' | 'typos';
    severity: 'error' | 'warning' | 'info';
  }> {
    return errors.map((error, index) => ({
      id: `lt-${index}-${error.rule.id}`,
      message: error.message,
      shortMessage: error.shortMessage,
      suggestions: error.replacements.map(r => r.value),
      start: error.offset,
      end: error.offset + error.length,
      type: this.getErrorType(error.rule.category.id),
      severity: this.getErrorSeverity(error.rule.issueType)
    }));
  }

  /**
   * Déterminer le type d'erreur
   */
  private getErrorType(categoryId: string): 'grammar' | 'spelling' | 'style' | 'typos' {
    switch (categoryId) {
      case 'TYPOS':
        return 'typos';
      case 'GRAMMAR':
        return 'grammar';
      case 'STYLE':
        return 'style';
      case 'SPELLING':
        return 'spelling';
      default:
        return 'grammar';
    }
  }

  /**
   * Déterminer la sévérité de l'erreur
   */
  private getErrorSeverity(issueType: string): 'error' | 'warning' | 'info' {
    switch (issueType) {
      case 'misspelling':
      case 'grammar':
        return 'error';
      case 'style':
      case 'typography':
        return 'warning';
      default:
        return 'info';
    }
  }

  /**
   * Analyser un texte et retourner des métriques
   */
  async analyzeText(text: string, language: string = 'fr'): Promise<{
    errors: LanguageToolError[];
    metrics: {
      totalErrors: number;
      grammarErrors: number;
      spellingErrors: number;
      styleErrors: number;
      typoErrors: number;
      accuracy: number;
      suggestions: number;
    };
  }> {
    const errors = await this.checkGrammarWithRetry(text, language);
    const formattedErrors = this.formatErrors(errors);

    const metrics = {
      totalErrors: errors.length,
      grammarErrors: formattedErrors.filter(e => e.type === 'grammar').length,
      spellingErrors: formattedErrors.filter(e => e.type === 'spelling').length,
      styleErrors: formattedErrors.filter(e => e.type === 'style').length,
      typoErrors: formattedErrors.filter(e => e.type === 'typos').length,
      accuracy: text.length > 0 ? Math.max(0, 100 - (errors.length / text.split(/\s+/).length) * 100) : 100,
      suggestions: formattedErrors.reduce((sum, e) => sum + e.suggestions.length, 0)
    };

    return { errors, metrics };
  }
}

// Instance singleton
export const languageToolService = new LanguageToolService();

// Hook React pour utiliser LanguageTool
export function useLanguageTool() {
  const [isChecking, setIsChecking] = React.useState(false);
  const [isAvailable, setIsAvailable] = React.useState<boolean | null>(null);

  // Vérifier la disponibilité de l'API
  React.useEffect(() => {
    languageToolService.checkHealth().then(setIsAvailable);
  }, []);

  const checkGrammar = React.useCallback(async (text: string, language: string = 'fr') => {
    if (!isAvailable) return { errors: [], metrics: { totalErrors: 0, accuracy: 100 } };
    
    setIsChecking(true);
    try {
      const result = await languageToolService.analyzeText(text, language);
      return result;
    } finally {
      setIsChecking(false);
    }
  }, [isAvailable]);

  return {
    checkGrammar,
    isChecking,
    isAvailable,
    isReady: isAvailable === true
  };
}

// Import React pour le hook
import React from 'react';
