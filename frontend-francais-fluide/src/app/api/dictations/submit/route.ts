import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/dictations/submit - Soumettre un résultat de dictée
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dictationId, score, userText } = body;

    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    // Mettre à jour la dictée avec le score
    const dictation = await prisma.dictation.update({
      where: { id: dictationId },
      data: {
        completed: true,
        score: score,
        attempts: { increment: 1 }
      }
    });

    // Mettre à jour la progression de l'utilisateur
    await prisma.userProgress.upsert({
      where: { userId },
      update: {
        wordsWritten: { increment: userText.split(' ').length },
        accuracy: score,
        timeSpent: { increment: 5 }, // 5 minutes par dictée
        lastActivity: new Date()
      },
      create: {
        userId,
        wordsWritten: userText.split(' ').length,
        accuracy: score,
        timeSpent: 5,
        lastActivity: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        dictation,
        score,
        wordsWritten: userText.split(' ').length
      }
    });

  } catch (error) {
    console.error('Erreur soumission dictée:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
