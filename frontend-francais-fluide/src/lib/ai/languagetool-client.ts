// src/lib/ai/languagetool-client.ts
import { AI_CONFIG } from './config';

export class LanguageToolClient {
  private static instance: LanguageToolClient;
  private cache = new Map<string, { data: any; timestamp: number }>();

  static getInstance(): LanguageToolClient {
    if (!LanguageToolClient.instance) {
      LanguageToolClient.instance = new LanguageToolClient();
    }
    return LanguageToolClient.instance;
  }

  private getCacheKey(text: string): string {
    return `lt:${Buffer.from(text).toString('base64')}`;
  }

  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < AI_CONFIG.CACHE_TTL * 1000) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    if (this.cache.size >= AI_CONFIG.MAX_CACHE_SIZE) {
      const iterator = this.cache.keys().next();
      if (!iterator.done) {
        this.cache.delete(iterator.value);
      }
    }

    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async checkGrammar(text: string): Promise<any> {
    const cacheKey = this.getCacheKey(text);
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(AI_CONFIG.LANGUAGETOOL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(AI_CONFIG.LANGUAGETOOL_API_KEY && {
            Authorization: `Bearer ${AI_CONFIG.LANGUAGETOOL_API_KEY}`,
          }),
        },
        body: new URLSearchParams({
          text: text,
          language: 'fr',
          enabledOnly: 'false',
        }),
      });

      if (!response.ok) {
        throw new Error(`LanguageTool API error: ${response.status}`);
      }

      const result = await response.json();

      // Convertir le format LanguageTool vers notre format
      const convertedResult = {
        corrected_text: text,
        errors:
          result.matches?.map((match: any) => ({
            original: match.context?.text?.substring(match.offset, match.offset + match.length),
            correction: match.replacements?.[0]?.value || '',
            explanation: match.message,
            type: this.getErrorType(match.rule?.category?.id),
            offset: match.offset,
            length: match.length,
          })) || [],
        suggestions:
          result.matches?.map((match: any) => match.replacements?.[0]?.value).filter(Boolean) || [],
      };

      this.setCache(cacheKey, convertedResult);
      return convertedResult;
    } catch (error) {
      console.error('Erreur LanguageTool:', error);
      throw new Error('Erreur lors de la vérification grammaticale');
    }
  }

  private getErrorType(categoryId: string): string {
    const typeMap: { [key: string]: string } = {
      TYPOS: 'orthographe',
      GRAMMAR: 'grammaire',
      PUNCTUATION: 'ponctuation',
      STYLE: 'style',
      TYPOGRAPHY: 'typographie',
    };
    return typeMap[categoryId] || 'autre';
  }
}
