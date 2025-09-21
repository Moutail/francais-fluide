// src/types/grammar.ts
export interface GrammarError {
  id?: string;
  type?: 'spelling' | 'grammar' | 'punctuation' | 'style';
  severity?: 'critical' | 'warning' | 'suggestion';
  message: string;

  // Position - support both start/end and offset/length used across codebase
  start?: number;
  end?: number;
  offset?: number;
  length?: number;

  // Suggestions (aka replacements)
  suggestions?: string[];
  replacements?: string[];

  // Optional rule metadata
  rule?: {
    id: string;
    category: string;
    severity: 'critical' | 'warning' | 'suggestion';
  };

  // Optional context information
  context?: {
    text: string;
    offset: number;
    length: number;
    before?: string;
    after?: string;
  };

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