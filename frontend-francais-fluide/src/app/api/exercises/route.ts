import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/exercises - Récupérer tous les exercices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        include: {
          questions: true,
          submissions: {
            take: 1,
            orderBy: { completedAt: 'desc' }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.exercise.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: exercises,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération exercices:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/exercises - Créer un nouvel exercice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, difficulty, level, questions } = body;

    const exercise = await prisma.exercise.create({
      data: {
        title,
        description,
        type,
        difficulty,
        level: level || 1,
        questions: {
          create: questions.map((q: any, index: number) => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            order: index
          }))
        }
      },
      include: {
        questions: true
      }
    });

    return NextResponse.json({
      success: true,
      data: exercise
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création exercice:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}