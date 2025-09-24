import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/exercises/[id] - Récupérer un exercice spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        submissions: {
          take: 5,
          orderBy: { completedAt: 'desc' },
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }

    // Parser les options JSON
    const exerciseWithParsedQuestions = {
      ...exercise,
      questions: exercise.questions.map(q => ({
        ...q,
        options: JSON.parse(q.options)
      }))
    };

    return NextResponse.json({
      success: true,
      data: exerciseWithParsedQuestions
    });

  } catch (error) {
    console.error('Erreur récupération exercice:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/exercises/[id] - Mettre à jour un exercice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, type, difficulty, level, questions } = body;

    const exercise = await prisma.exercise.update({
      where: { id: params.id },
      data: {
        title,
        description,
        type,
        difficulty,
        level: level || 1,
        questions: {
          deleteMany: {},
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
    });

  } catch (error) {
    console.error('Erreur mise à jour exercice:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises/[id] - Supprimer un exercice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.exercise.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Exercice supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression exercice:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
