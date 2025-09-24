import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/missions - Récupérer les missions de l'utilisateur
export async function GET(request: NextRequest) {
  try {
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

    // Récupérer la progression de l'utilisateur
    const progress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'Progression non trouvée' },
        { status: 404 }
      );
    }

    // Générer les missions dynamiques basées sur la progression
    const missions = [
      {
        id: 'daily-words',
        title: 'Écrire 200 mots',
        description: 'Écrivez au moins 200 mots aujourd\'hui',
        type: 'daily',
        difficulty: 'easy',
        points: 25,
        status: progress.wordsWritten >= 200 ? 'completed' : 'in_progress',
        progress: Math.min(progress.wordsWritten, 200),
        requirement: 200,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        rewards: { xp: 50, coins: 10 },
        category: 'writing'
      },
      {
        id: 'daily-exercises',
        title: 'Compléter 3 exercices',
        description: 'Terminez 3 exercices de grammaire',
        type: 'daily',
        difficulty: 'medium',
        points: 40,
        status: progress.exercisesCompleted >= 3 ? 'completed' : 'in_progress',
        progress: Math.min(progress.exercisesCompleted, 3),
        requirement: 3,
        rewards: { xp: 75, coins: 15 },
        category: 'exercises'
      },
      {
        id: 'weekly-accuracy',
        title: 'Précision 85%',
        description: 'Maintenez 85% de précision pendant la semaine',
        type: 'weekly',
        difficulty: 'hard',
        points: 100,
        status: progress.accuracy >= 85 ? 'completed' : 'in_progress',
        progress: Math.min(progress.accuracy, 85),
        requirement: 85,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        rewards: { xp: 150, coins: 30, badge: 'Precision Master' },
        category: 'accuracy'
      },
      {
        id: 'monthly-streak',
        title: 'Série de 20 jours',
        description: 'Connectez-vous 20 jours consécutifs',
        type: 'monthly',
        difficulty: 'hard',
        points: 200,
        status: progress.currentStreak >= 20 ? 'completed' : 'in_progress',
        progress: Math.min(progress.currentStreak, 20),
        requirement: 20,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        rewards: { xp: 300, coins: 50, badge: 'Streak Master' },
        category: 'consistency'
      }
    ];

    return NextResponse.json({
      success: true,
      data: missions
    });

  } catch (error) {
    console.error('Erreur récupération missions:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
