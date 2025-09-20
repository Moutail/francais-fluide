// src/types/grammar.ts
export interface GrammarRule {
    id: string;
    category: 'spelling' | 'grammar' | 'punctuation' | 'style';
    severity: 'critical' | 'warning' | 'suggestion';
    pattern: RegExp;
    check: (match: RegExpExecArray) => {
      message: string;
      suggestions: string[];
    } | null;
  }
  
  export interface GrammarError {
    offset: number;
    length: number;
    message: string;
    replacements: string[];
    rule: {
      id: string;
      category: string;
      severity: string;
    };
    context: {
      text: string;
      offset: number;
      length: number;
    };
  }
  
  export interface Suggestion {
    text: string;
    confidence: number;
    explanation?: string;
  }
  
  export interface CorrectionResult {
    original: string;
    corrected: string;
    errors: GrammarError[];
    suggestions: Suggestion[];
    confidence: number;
  }
  
  export interface TextAnalysis {
    text: string;
    errors: GrammarError[];
    statistics: {
      wordCount: number;
      sentenceCount: number;
      averageWordLength: number;
      averageSentenceLength: number;
      errorCount: number;
      errorDensity: number;
      errorsByCategory: Record<string, number>;
      readabilityScore: number;
    };
  }