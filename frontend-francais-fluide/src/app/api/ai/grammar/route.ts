// src/app/api/ai/grammar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAIClient } from '@/lib/ai/openai-client';
import { LanguageToolClient } from '@/lib/ai/languagetool-client';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { text, userPlan = 'free' } = await request.json();
    const authHeader = request.headers.get('authorization');
    
    // Vérifier l'authentification
    let userId = null;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (error) {
        // Token invalide, continuer en mode anonyme
      }
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Texte requis pour la correction' },
        { status: 400 }
      );
    }

    let corrections;
    let usedService = '';

    try {
      // Essayer OpenAI en premier
      const openaiClient = OpenAIClient.getInstance();
      corrections = await openaiClient.correctGrammar(text, userPlan);
      usedService = 'openai';
    } catch (openaiError) {
      console.warn('OpenAI failed, trying LanguageTool:', openaiError);
      
      try {
        // Fallback sur LanguageTool
        const ltClient = LanguageToolClient.getInstance();
        corrections = await ltClient.checkGrammar(text);
        usedService = 'languagetool';
      } catch (ltError) {
        console.error('Both AI services failed:', ltError);
        
        // Fallback basique
        corrections = {
          corrected_text: text,
          errors: [],
          suggestions: []
        };
        usedService = 'fallback';
      }
    }

    // Enregistrer la correction dans la base de données
    if (userId) {
      await prisma.grammarCheck.create({
        data: {
          userId,
          text,
          errors: corrections.errors,
          suggestions: corrections.suggestions
        }
      });

      // Mettre à jour les statistiques utilisateur
      await prisma.userProgress.update({
        where: { userId },
        data: {
          wordsWritten: { increment: text.split(' ').length },
          lastActivity: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      corrections,
      usage: {
        plan: userPlan,
        service: usedService,
        remaining: userPlan === 'free' ? 4 : 999,
        resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur de correction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la correction' },
      { status: 500 }
    );
  }
}
