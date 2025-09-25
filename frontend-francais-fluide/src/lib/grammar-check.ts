// src/lib/grammar-check.ts
import { apiClient } from './api';

export interface GrammarError {
  original: string;
  corrected: string;
  explanation: string;
  position: number;
  type: string;
}

export interface GrammarCheckResult {
  originalText: string;
  correctedText: string;
  errors: GrammarError[];
  usage: {
    current: number;
    limit: number;
    remaining: number;
  };
}

export class GrammarCheckService {
  static async checkText(text: string, language: string = 'fr'): Promise<{
    success: boolean;
    data?: GrammarCheckResult;
    error?: string;
    upgradeRequired?: boolean;
  }> {
    try {
      const response = await apiClient.request<{
        success: boolean;
        data: GrammarCheckResult;
        error?: string;
        upgradeRequired?: boolean;
      }>('/api/grammar-check/check', {
        method: 'POST',
        body: JSON.stringify({ text, language })
      });

      return response;
    } catch (error) {
      console.error('Erreur correction grammaticale:', error);
      return {
        success: false,
        error: 'Erreur lors de la correction grammaticale'
      };
    }
  }

  static highlightErrors(text: string, errors: GrammarError[]): string {
    let highlightedText = text;
    
    // Trier les erreurs par position décroissante pour éviter les problèmes d'index
    const sortedErrors = errors.sort((a, b) => b.position - a.position);
    
    sortedErrors.forEach(error => {
      const before = highlightedText.substring(0, error.position);
      const after = highlightedText.substring(error.position + error.original.length);
      const highlighted = `<span class="grammar-error" data-error="${error.type}" title="${error.explanation}">${error.original}</span>`;
      
      highlightedText = before + highlighted + after;
    });
    
    return highlightedText;
  }

  static getErrorTypeColor(type: string): string {
    const colors = {
      'grammaire': 'text-red-600 bg-red-50 border-red-200',
      'orthographe': 'text-orange-600 bg-orange-50 border-orange-200',
      'conjugaison': 'text-blue-600 bg-blue-50 border-blue-200',
      'ponctuation': 'text-purple-600 bg-purple-50 border-purple-200',
      'accord': 'text-green-600 bg-green-50 border-green-200',
      'default': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    
    return colors[type as keyof typeof colors] || colors.default;
  }
}
