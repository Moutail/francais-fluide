import { useState, useEffect, useCallback } from 'react';
import { languageToolService, LanguageToolError } from '@/services/languageToolService';

export interface GrammarCheckResult {
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
}

export function useLanguageTool() {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<GrammarCheckResult | null>(null);

  // Vérifier la disponibilité de l'API au démarrage
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = await languageToolService.checkHealth();
        setIsAvailable(available);
      } catch (error) {
        console.error('Erreur vérification LanguageTool:', error);
        setIsAvailable(false);
      }
    };

    checkAvailability();
  }, []);

  // Fonction principale de vérification grammaticale
  const checkGrammar = useCallback(
    async (text: string, language: string = 'fr'): Promise<GrammarCheckResult> => {
      if (!isAvailable || !text.trim()) {
        return {
          errors: [],
          metrics: {
            totalErrors: 0,
            grammarErrors: 0,
            spellingErrors: 0,
            styleErrors: 0,
            typoErrors: 0,
            accuracy: 100,
            suggestions: 0,
          },
        };
      }

      setIsChecking(true);
      try {
        const result = await languageToolService.analyzeText(text, language);
        setLastCheck(result);
        return result;
      } catch (error) {
        console.error('Erreur vérification grammaticale:', error);
        return {
          errors: [],
          metrics: {
            totalErrors: 0,
            grammarErrors: 0,
            spellingErrors: 0,
            styleErrors: 0,
            typoErrors: 0,
            accuracy: 100,
            suggestions: 0,
          },
        };
      } finally {
        setIsChecking(false);
      }
    },
    [isAvailable]
  );

  // Vérification avec debounce pour éviter trop de requêtes
  const checkGrammarDebounced = useCallback(debounce(checkGrammar, 1000), [checkGrammar]);

  // Obtenir les langues supportées
  const getSupportedLanguages = useCallback(async () => {
    try {
      return await languageToolService.getSupportedLanguages();
    } catch (error) {
      console.error('Erreur récupération langues:', error);
      return [];
    }
  }, []);

  return {
    checkGrammar,
    checkGrammarDebounced,
    getSupportedLanguages,
    isChecking,
    isAvailable,
    isReady: isAvailable === true,
    lastCheck,
  };
}

// Fonction debounce pour éviter trop de requêtes
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise(resolve => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, wait);
    });
  };
}
