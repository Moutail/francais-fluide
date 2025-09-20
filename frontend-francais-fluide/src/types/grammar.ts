// src/types/grammar.ts
export interface GrammarError {
  id: string;
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
  severity: 'critical' | 'warning' | 'suggestion';
  message: string;
  start: number;
  end: number;
  suggestions: string[];
  explanation?: string;
}

export interface Suggestion {
  text: string;
  confidence: number;
  explanation: string;
}

export interface CorrectionResult {
  originalText: string;
  correctedText: string;
  errors: GrammarError[];
  suggestions: Suggestion[];
  statistics: {
    totalErrors: number;
    errorsByType: Record<string, number>;
    confidence: number;
  };
}

export interface TextAnalysis {
  text: string;
  errors: GrammarError[];
  statistics: {
    wordCount: number;
    characterCount: number;
    errorRate: number;
    readabilityScore: number;
  };
  suggestions: Suggestion[];
}