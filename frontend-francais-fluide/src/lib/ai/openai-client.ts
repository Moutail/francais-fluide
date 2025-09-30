// src/lib/ai/openai-client.ts
import OpenAI from 'openai';
import { AI_CONFIG, AI_PROMPTS } from './config';

const openai = new OpenAI({
  apiKey: AI_CONFIG.OPENAI_API_KEY,
});

export class OpenAIClient {
  private static instance: OpenAIClient;
  private cache = new Map<string, { data: any; timestamp: number }>();

  static getInstance(): OpenAIClient {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAIClient();
    }
    return OpenAIClient.instance;
  }

  private getCacheKey(prompt: string, model: string): string {
    return `${model}:${Buffer.from(prompt).toString('base64')}`;
  }

  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < AI_CONFIG.CACHE_TTL * 1000) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    // Nettoyer le cache si il est trop grand
    if (this.cache.size >= AI_CONFIG.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      // firstKey peut être undefined si l'itérateur est vide (ex: taille max 0)
      if (typeof firstKey === 'string') {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async correctGrammar(text: string, userPlan: string = 'free'): Promise<any> {
    const cacheKey = this.getCacheKey(`grammar:${text}`, AI_CONFIG.OPENAI_MODEL);
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: AI_PROMPTS.GRAMMAR_CORRECTION,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        max_tokens: AI_CONFIG.OPENAI_MAX_TOKENS,
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur OpenAI:', error);
      throw new Error('Erreur lors de la correction grammaticale');
    }
  }

  async generateContent(topic: string, level: string, userPlan: string = 'free'): Promise<any> {
    const cacheKey = this.getCacheKey(`content:${topic}:${level}`, AI_CONFIG.OPENAI_MODEL);
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const prompt = AI_PROMPTS.CONTENT_GENERATION.replace('{level}', level).replace(
        '{topic}',
        topic
      );

      const response = await openai.chat.completions.create({
        model: AI_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
        max_tokens: AI_CONFIG.OPENAI_MAX_TOKENS,
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur OpenAI:', error);
      throw new Error('Erreur lors de la génération de contenu');
    }
  }

  async askQuestion(question: string, context: any, userPlan: string = 'free'): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: AI_PROMPTS.AI_ASSISTANT,
          },
          {
            role: 'user',
            content: `Contexte: ${JSON.stringify(context)}\n\nQuestion: ${question}`,
          },
        ],
        max_tokens: AI_CONFIG.OPENAI_MAX_TOKENS,
        temperature: 0.5,
      });

      return (
        response.choices[0].message.content || 'Désolé, je ne peux pas répondre à cette question.'
      );
    } catch (error) {
      console.error('Erreur OpenAI:', error);
      throw new Error('Erreur lors de la génération de la réponse');
    }
  }
}
