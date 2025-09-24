// src/app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Récupérer la progression de l'utilisateur
    const progress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    if (!progress) {
      // Créer une progression par défaut si elle n'existe pas
      const defaultProgress = await prisma.userProgress.create({
        data: {
          userId,
          wordsWritten: 0,
          accuracy: 0,
          exercisesCompleted: 0,
          currentStreak: 0,
          level: 1,
          xp: 0,
          totalTimeSpent: 0,
          weeklyGoal: 100,
          monthlyGoal: 500
        }
      });
      
      return NextResponse.json({
        success: true,
        data: defaultProgress
      });
    }

    return NextResponse.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Erreur API progression:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du chargement de la progression' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const body = await request.json();
    
    // Mettre à jour la progression en base
    const updatedProgress = await prisma.userProgress.upsert({
      where: { userId },
      update: {
        wordsWritten: body.wordsWritten || 0,
        accuracy: body.accuracy || 0,
        exercisesCompleted: body.exercisesCompleted || 0,
        currentStreak: body.currentStreak || 0,
        level: body.level || 1,
        xp: body.xp || 0,
        totalTimeSpent: body.timeSpent || 0,
      },
      create: {
        userId,
        wordsWritten: body.wordsWritten || 0,
        accuracy: body.accuracy || 0,
        exercisesCompleted: body.exercisesCompleted || 0,
        currentStreak: body.currentStreak || 0,
        level: body.level || 1,
        xp: body.xp || 0,
        totalTimeSpent: body.timeSpent || 0,
        weeklyGoal: 100,
        monthlyGoal: 500
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updatedProgress
    });
  } catch (error) {
    console.error('Erreur mise à jour progression:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour de la progression' 
      },
      { status: 500 }
    );
  }
}