import { NextRequest, NextResponse } from 'next/server';
import { grammarBackendService } from '@/lib/grammar/backend-service';
import type { ApiResponse, TextAnalysis } from '@/types';

// Configuration
const MAX_TEXT_LENGTH = 10000;

// Fonction pour obtenir l'IP du client
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

// Endpoint POST
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    const body = await request.json();
    const { text, action = 'analyze', corrections, useLanguageTool = true, maxErrors = 50 } = body;

    // Validation
    if (!text || typeof text !== 'string') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Le texte est requis et doit être une chaîne de caractères',
        },
        { status: 400 }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Le texte ne peut pas dépasser ${MAX_TEXT_LENGTH} caractères`,
        },
        { status: 400 }
      );
    }

    if (text.trim().length < 3) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Le texte doit contenir au moins 3 caractères',
        },
        { status: 400 }
      );
    }

    let result: TextAnalysis;

    if (action === 'analyze') {
      // Analyser le texte
      result = await grammarBackendService.analyzeText(text, {
        useLanguageTool,
        maxErrors,
        clientIP,
      });
    } else if (action === 'correct' && corrections) {
      // Appliquer les corrections
      const correctedText = grammarBackendService.correctText(text, corrections);
      result = await grammarBackendService.analyzeText(correctedText, {
        useLanguageTool,
        maxErrors,
        clientIP,
      });
    } else {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Action non valide. Utilisez "analyze" ou "correct"',
        },
        { status: 400 }
      );
    }

    // Calculer des métriques supplémentaires
    const wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;
    const errorDensity = wordCount > 0 ? result.errors.length / wordCount : 0;
    const accuracy = Math.max(0, 100 - errorDensity * 100);

    const response: ApiResponse<{
      analysis: TextAnalysis;
      metrics: {
        wordCount: number;
        errorCount: number;
        errorDensity: number;
        accuracy: number;
        cacheSize: number;
        rateLimitRemaining: number;
      };
    }> = {
      success: true,
      data: {
        analysis: result,
        metrics: {
          wordCount,
          errorCount: result.errors.length,
          errorDensity: Math.round(errorDensity * 1000) / 1000,
          accuracy: Math.round(accuracy),
          cacheSize: grammarBackendService.getCacheSize(),
          rateLimitRemaining: grammarBackendService.getRateLimitRemaining(clientIP),
        },
      },
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Remaining': grammarBackendService.getRateLimitRemaining(clientIP).toString(),
        'X-Cache-Size': grammarBackendService.getCacheSize().toString(),
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'analyse grammaticale:", error);

    // Gestion spécifique des erreurs de rate limiting
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Trop de requêtes. Veuillez patienter.',
          message: 'Limite de requêtes atteinte. Réessayez dans une minute.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Erreur interne du serveur lors de l'analyse grammaticale",
      },
      { status: 500 }
    );
  }
}

// Endpoint GET pour les informations sur l'API
export async function GET() {
  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      version: '2.0.0',
      supportedLanguages: ['fr'],
      maxTextLength: MAX_TEXT_LENGTH,
      features: {
        localDetection: true,
        languageToolIntegration: true,
        caching: true,
        rateLimiting: true,
        advancedGrammarRules: true,
      },
      cache: {
        size: grammarBackendService.getCacheSize(),
      },
      grammarRules: {
        total: 25, // Nombre approximatif de règles
        categories: ['grammar', 'spelling', 'punctuation', 'style'],
        advanced: [
          'Concordance des temps',
          'Subjonctif',
          'Participes passés complexes',
          'Barbarismes courants',
          'Anglicismes',
          'Pléonasmes',
          'Conjonctions et connecteurs',
        ],
      },
    },
  });
}

// Endpoint DELETE pour vider le cache
export async function DELETE() {
  grammarBackendService.clearCache();

  return NextResponse.json<ApiResponse>({
    success: true,
    message: 'Cache vidé avec succès',
  });
}
