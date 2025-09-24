import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/achievements - Récupérer les achievements de l'utilisateur
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

    // Récupérer tous les achievements avec le statut de l'utilisateur
    const achievements = await prisma.achievement.findMany({
      include: {
        userAchievements: {
          where: { userId },
          select: { earnedAt: true }
        }
      }
    });

    // Récupérer la progression de l'utilisateur
    const progress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    const achievementsWithStatus = achievements.map(achievement => {
      const userAchievement = achievement.userAchievements[0];
      const isEarned = !!userAchievement;
      
      // Vérifier si l'achievement peut être débloqué
      let canEarn = false;
      if (progress) {
        switch (achievement.type) {
          case 'words_written':
            canEarn = progress.wordsWritten >= achievement.threshold;
            break;
          case 'exercises_completed':
            canEarn = progress.exercisesCompleted >= achievement.threshold;
            break;
          case 'streak':
            canEarn = progress.currentStreak >= achievement.threshold;
            break;
          case 'level':
            canEarn = progress.level >= achievement.threshold;
            break;
          case 'accuracy':
            canEarn = progress.accuracy >= achievement.threshold;
            break;
        }
      }

      return {
        ...achievement,
        isEarned,
        canEarn: canEarn && !isEarned,
        earnedAt: userAchievement?.earnedAt || null
      };
    });

    return NextResponse.json({
      success: true,
      data: achievementsWithStatus
    });

  } catch (error) {
    console.error('Erreur récupération achievements:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
