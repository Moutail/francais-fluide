import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/dictations - Récupérer toutes les dictées
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');

    const where: any = {};
    if (difficulty) where.difficulty = difficulty;
    if (category) where.category = category;

    const dictations = await prisma.dictation.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: dictations
    });

  } catch (error) {
    console.error('Erreur récupération dictées:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/dictations - Créer une nouvelle dictée
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, difficulty, duration, text, category, tags } = body;

    const dictation = await prisma.dictation.create({
      data: {
        title,
        description,
        difficulty,
        duration,
        text,
        category,
        tags: JSON.stringify(tags || [])
      }
    });

    return NextResponse.json({
      success: true,
      data: dictation
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création dictée:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
