// src/app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    // Récupérer la progression de l'utilisateur
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId: decoded.userId }
    });

    if (!userProgress) {
      return NextResponse.json(
        { error: 'Progression non trouvée' },
        { status: 404 }
      );
    }

    // Calculer les statistiques
    const stats = {
      wordsWritten: userProgress.wordsWritten,
      accuracy: userProgress.accuracy,
      timeSpent: userProgress.timeSpent,
      exercisesCompleted: userProgress.exercisesCompleted,
      currentStreak: userProgress.currentStreak,
      level: userProgress.level,
      xp: userProgress.xp,
      nextLevelXp: userProgress.level * 1000, // Calculer le prochain niveau
      averageAccuracy: userProgress.accuracy,
      recentChecks: userProgress.recentChecks || 0
    };

    return NextResponse.json({
      success: true,
      progress: stats
    });

  } catch (error) {
    console.error('Erreur de récupération de progression:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const { wordsWritten, accuracy, timeSpent, exercisesCompleted } = await request.json();

    // Mettre à jour la progression
    const updatedProgress = await prisma.userProgress.update({
      where: { userId: decoded.userId },
      data: {
        wordsWritten: { increment: wordsWritten || 0 },
        accuracy: accuracy || 0,
        timeSpent: { increment: timeSpent || 0 },
        exercisesCompleted: { increment: exercisesCompleted || 0 },
        lastActivity: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      progress: updatedProgress
    });

  } catch (error) {
    console.error('Erreur de mise à jour de progression:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}