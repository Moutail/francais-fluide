import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/exercises/submit - Soumettre une réponse d'exercice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exerciseId, answers, timeSpent } = body;

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

    // Récupérer l'exercice avec ses questions
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: { questions: true }
    });

    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }

    // Calculer le score
    let correctAnswers = 0;
    const totalQuestions = exercise.questions.length;

    exercise.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Créer la soumission
    const submission = await prisma.exerciseSubmission.create({
      data: {
        userId,
        exerciseId,
        answers: JSON.stringify(answers),
        score,
        timeSpent: timeSpent || 0
      }
    });

    // Mettre à jour la progression de l'utilisateur
    await prisma.userProgress.upsert({
      where: { userId },
      update: {
        exercisesCompleted: { increment: 1 },
        xp: { increment: score },
        lastActivity: new Date()
      },
      create: {
        userId,
        exercisesCompleted: 1,
        xp: score,
        lastActivity: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        submission,
        score,
        correctAnswers,
        totalQuestions
      }
    });

  } catch (error) {
    console.error('Erreur soumission exercice:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
