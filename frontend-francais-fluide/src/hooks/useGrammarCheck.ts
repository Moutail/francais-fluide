// src/hooks/useGrammarCheck.ts
import { useState, useCallback, useRef } from 'react';
import { grammarDetector } from '@/lib/grammar/detector';
import type { GrammarError, TextAnalysis } from '@/types/grammar';

interface UseGrammarCheckOptions {
  enableCache?: boolean;
  maxErrors?: number;
  debounceMs?: number;
}

export function useGrammarCheck(options: UseGrammarCheckOptions = {}) {
  const {
    enableCache = true,
    maxErrors = 10,
    debounceMs = 500
  } = options;

  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<TextAnalysis | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkGrammar = useCallback(async (text: string): Promise<TextAnalysis> => {
    // Annuler la vérification précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Créer un nouveau controller pour cette vérification
    abortControllerRef.current = new AbortController();
    
    return new Promise((resolve, reject) => {
      // Debounce si nécessaire
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        setIsChecking(true);
        
        try {
          // Vérifier si la requête a été annulée
          if (abortControllerRef.current?.signal.aborted) {
            reject(new Error('Grammar check cancelled'));
            return;
          }

          // Analyser le texte
          const result = await grammarDetector.analyze(text);
          
          // Limiter le nombre d'erreurs si spécifié
          if (maxErrors && result.errors.length > maxErrors) {
            result.errors = result.errors.slice(0, maxErrors);
          }

          setLastResult(result);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          setIsChecking(false);
        }
      }, debounceMs);
    });
  }, [maxErrors, debounceMs]);

  const clearCache = useCallback(() => {
    grammarDetector.clearCache();
  }, []);

  const cancelCheck = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsChecking(false);
  }, []);

  return {
    checkGrammar,
    isChecking,
    lastResult,
    clearCache,
    cancelCheck
  };
}