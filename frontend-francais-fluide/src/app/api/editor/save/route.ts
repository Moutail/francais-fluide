import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/editor/save - Sauvegarder un texte de l'éditeur
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { content, mode, metrics } = await request.json();

    // Créer ou mettre à jour le document
    const document = await prisma.document.upsert({
      where: {
        userId_type: {
          userId,
          type: 'editor'
        }
      },
      update: {
        content,
        metadata: JSON.stringify({
          mode,
          metrics,
          lastSaved: new Date().toISOString()
        })
      },
      create: {
        userId,
        title: `Document ${mode} - ${new Date().toLocaleDateString()}`,
        content,
        type: 'editor',
        metadata: JSON.stringify({
          mode,
          metrics,
          lastSaved: new Date().toISOString()
        })
      }
    });

    // Mettre à jour la progression utilisateur
    if (metrics) {
      await prisma.userProgress.upsert({
        where: { userId },
        update: {
          wordsWritten: metrics.wordsWritten || 0,
          accuracy: metrics.accuracyRate || 0,
          timeSpent: Math.floor(metrics.timeSpent || 0),
          lastActivity: new Date()
        },
        create: {
          userId,
          wordsWritten: metrics.wordsWritten || 0,
          accuracy: metrics.accuracyRate || 0,
          timeSpent: Math.floor(metrics.timeSpent || 0),
          lastActivity: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        document,
        message: 'Document sauvegardé avec succès'
      }
    });

  } catch (error) {
    console.error('Erreur sauvegarde éditeur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
