import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/exercises/generate - Générer un exercice avec l'IA
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, difficulty, level, topic } = body;

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

    // Générer l'exercice avec l'IA (simulation pour l'instant)
    const generatedExercise = await generateExerciseWithAI(type, difficulty, level, topic);

    // Sauvegarder l'exercice dans la base de données
    const exercise = await prisma.exercise.create({
      data: {
        title: generatedExercise.title,
        description: generatedExercise.description,
        type,
        difficulty,
        level: level || 1,
        questions: {
          create: generatedExercise.questions.map((q: any, index: number) => ({
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
    console.error('Erreur génération exercice:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Fonction pour générer un exercice avec l'IA (simulation)
async function generateExerciseWithAI(type: string, difficulty: string, level: number, topic?: string) {
  // Simulation de génération d'exercice
  const exerciseTemplates = {
    grammar: {
      title: `Exercice de grammaire - ${topic || 'Niveau ' + level}`,
      description: `Maîtrisez les règles de grammaire française au niveau ${difficulty}`,
      questions: [
        {
          question: 'Choisissez la forme correcte du verbe.',
          options: ['je vais', 'je va', 'je vas', 'je aller'],
          correctAnswer: 'je vais',
          explanation: 'Le verbe "aller" se conjugue : je vais, tu vas, il va, nous allons, vous allez, ils vont.'
        },
        {
          question: 'Quel est le bon accord de l\'adjectif ?',
          options: ['une belle maison', 'un belle maison', 'une beau maison', 'un beau maison'],
          correctAnswer: 'une belle maison',
          explanation: 'L\'adjectif "belle" s\'accorde avec le nom féminin "maison".'
        }
      ]
    },
    vocabulary: {
      title: `Vocabulaire - ${topic || 'Niveau ' + level}`,
      description: `Enrichissez votre vocabulaire français au niveau ${difficulty}`,
      questions: [
        {
          question: 'Quel est le synonyme de "rapidement" ?',
          options: ['lentement', 'vite', 'doucement', 'calmement'],
          correctAnswer: 'vite',
          explanation: '"Rapidement" signifie "vite", "à grande vitesse".'
        }
      ]
    },
    conjugation: {
      title: `Conjugaison - ${topic || 'Niveau ' + level}`,
      description: `Maîtrisez la conjugaison française au niveau ${difficulty}`,
      questions: [
        {
          question: 'Conjuguez "être" au présent : "Nous _____ heureux."',
          options: ['sommes', 'êtes', 'sont', 'suis'],
          correctAnswer: 'sommes',
          explanation: 'Le verbe "être" se conjugue : je suis, tu es, il est, nous sommes, vous êtes, ils sont.'
        }
      ]
    }
  };

  const template = exerciseTemplates[type as keyof typeof exerciseTemplates] || exerciseTemplates.grammar;
  
  return {
    title: template.title,
    description: template.description,
    questions: template.questions
  };
}
