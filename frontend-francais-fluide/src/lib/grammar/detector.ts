// src/lib/grammar/detector.ts
import type { GrammarError, TextAnalysis } from '@/types/grammar';

export class GrammarDetector {
  private cache = new Map<string, TextAnalysis>();

  async analyze(text: string): Promise<TextAnalysis> {
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    const errors = this.findMatches(text);
    const statistics = this.calculateStatistics(text, errors);

    const analysis: TextAnalysis = {
      text,
      errors,
      statistics,
      suggestions: [],
    };

    this.cache.set(text, analysis);
    return analysis;
  }

  private findMatches(text: string): GrammarError[] {
    const errors: GrammarError[] = [];

    // Règles de base simulées
    const patterns = [
      {
        regex: /\b(je suis alle|tu es alle|il est alle)\b/gi,
        type: 'grammar' as const,
        message: 'Accord du participe passé manquant',
        suggestions: ['je suis allé', 'tu es allé', 'il est allé'],
      },
      {
        regex: /\b(ces|ses|ses)\s+(maison|voiture|livre)\b/gi,
        type: 'grammar' as const,
        message: "Confusion entre ces/ses/c'est",
        suggestions: ["c'est", 'ses', 'ces'],
      },
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        errors.push({
          id: `error-${match.index}`,
          type: pattern.type,
          severity: 'warning',
          message: pattern.message,
          start: match.index,
          end: match.index + match[0].length,
          suggestions: pattern.suggestions,
        });
      }
    });

    return errors;
  }

  private calculateStatistics(text: string, errors: GrammarError[]) {
    const words = text.trim().split(/\s+/).length;
    const characters = text.length;
    const errorRate = words > 0 ? (errors.length / words) * 100 : 0;

    return {
      wordCount: words,
      characterCount: characters,
      errorRate,
      readabilityScore: Math.max(0, 100 - errorRate),
    };
  }
}

export const grammarDetector = new GrammarDetector();
