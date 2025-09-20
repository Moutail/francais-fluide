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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsChecking(true);

    try {
      const result = await grammarDetector.analyze(text);
      
      if (result.errors.length > maxErrors) {
        result.errors = result.errors.slice(0, maxErrors);
      }

      setLastResult(result);
      return result;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur lors de la vérification:', error);
      }
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, [maxErrors]);

  const clearCache = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    checkGrammar,
    isChecking,
    lastResult,
    clearCache
  };
}