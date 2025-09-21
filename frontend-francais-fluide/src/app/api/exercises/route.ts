import { NextRequest, NextResponse } from 'next/server';
import type { Exercise, ExerciseType, Difficulty, ApiResponse, PaginatedResponse } from '@/types';

// Données mockées pour les exercices
const mockExercises: Exercise[] = [
  {
    id: '1',
    title: 'Accord des adjectifs',
    description: 'Maîtrisez l\'accord des adjectifs avec les noms masculins et féminins',
    type: 'grammar',
    difficulty: 'beginner',
    category: 'Grammaire',
    content: {
      text: 'Le chat ___ (noir) dort sur le canapé ___ (confortable).',
      instructions: 'Complétez les phrases avec la forme correcte de l\'adjectif'
    },
    questions: [
        {
          id: 'q1',
          text: 'Complétez la première phrase',
          type: 'fill-in-the-blank',
          correctAnswer: 'noir'
        },
        {
          id: 'q2',
          text: 'Complétez la deuxième phrase',
          type: 'fill-in-the-blank',
          correctAnswer: 'confortable'
        }
      ],
    estimatedTime: 10,
    scoring: { maxPoints: 50, timeBonus: 10, accuracyWeight: 0.8 },
    
    points: 50,
    timeLimit: 10,
    isCompleted: true,
    completedAt: new Date('2024-01-15'),
    // legacy score info moved to results; keeping for mock compatibility
    // @ts-ignore
    score: 95
  },
  {
    id: '2',
    title: 'Conjugaison du présent',
    description: 'Révisez la conjugaison des verbes réguliers au présent de l\'indicatif',
    type: 'grammar',
    difficulty: 'intermediate',
    category: 'Conjugaison',
    content: {
      text: 'Je (manger) ___ une pomme. Tu (finir) ___ tes devoirs. Il (vendre) ___ sa voiture.',
      instructions: 'Conjuguez les verbes entre parenthèses au présent'
    },
    questions: [
        {
          id: 'q1',
          text: 'Conjuguez "manger"',
          type: 'fill-in-the-blank',
          correctAnswer: 'mange'
        },
        {
          id: 'q2',
          text: 'Conjuguez "finir"',
          type: 'fill-in-the-blank',
          correctAnswer: 'finis'
        },
        {
          id: 'q3',
          text: 'Conjuguez "vendre"',
          type: 'fill-in-the-blank',
          correctAnswer: 'vend'
        }
      ],
    estimatedTime: 15,
    scoring: { maxPoints: 75, timeBonus: 15, accuracyWeight: 0.85 },
    
    points: 75,
    timeLimit: 15,
    isCompleted: false
  },
  {
    id: '3',
    title: 'Vocabulaire de la cuisine',
    description: 'Apprenez le vocabulaire essentiel de la cuisine française',
    type: 'vocabulary',
    difficulty: 'beginner',
    category: 'Vocabulaire',
    content: { instructions: 'Associez les mots à leurs définitions' },
    questions: [
        {
          id: 'q1',
          text: 'Qu\'est-ce qu\'un "économe" ?',
          type: 'multiple-choice',
          options: ['Un ustensile pour éplucher', 'Un appareil électrique', 'Une casserole'],
          correctAnswer: 'Un ustensile pour éplucher'
        },
        {
          id: 'q2',
          text: 'Que signifie "mijoter" ?',
          type: 'multiple-choice',
          options: ['Cuire à feu vif', 'Cuire doucement', 'Mélanger'],
          correctAnswer: 'Cuire doucement'
        },
        {
          id: 'q3',
          text: 'Quel est l\'outil pour battre les œufs ?',
          type: 'multiple-choice',
          options: ['Une cuillère', 'Un fouet', 'Un couteau'],
          correctAnswer: 'Un fouet'
        }
      ],
    estimatedTime: 8,
    scoring: { maxPoints: 40, timeBonus: 8, accuracyWeight: 0.9 },
    
    points: 40,
    timeLimit: 8,
    isCompleted: false
  },
  {
    id: '4',
    title: 'Rédaction créative',
    description: 'Écrivez un paragraphe sur votre ville idéale',
    type: 'writing',
    difficulty: 'advanced',
    category: 'Expression écrite',
    content: {
      text: 'Décrivez votre ville idéale en utilisant le vocabulaire approprié et en respectant la structure d\'un paragraphe.',
      instructions: 'Rédigez un paragraphe de 150-200 mots décrivant votre ville idéale'
    },
    estimatedTime: 30,
    scoring: { maxPoints: 100, timeBonus: 30, accuracyWeight: 0.8 },
    points: 100,
    timeLimit: 30,
    isCompleted: false
  },
  {
    id: '5',
    title: 'Compréhension orale',
    description: 'Écoutez et comprenez un dialogue de la vie quotidienne',
    type: 'listening',
    difficulty: 'intermediate',
    category: 'Compréhension',
    content: {
      audioUrl: '/sounds/dialogue-restaurant.mp3',
      instructions: 'Écoutez le dialogue et répondez aux questions'
    },
    questions: [
        {
          id: 'q1',
          text: 'Où se déroule la conversation ?',
          type: 'multiple-choice',
          options: ['Au restaurant', 'À la maison', 'Au bureau'],
          correctAnswer: 'Au restaurant'
        },
        {
          id: 'q2',
          text: 'Que commande le client ?',
          type: 'multiple-choice',
          options: ['Un café', 'Un thé', 'Un jus d\'orange'],
          correctAnswer: 'Un café'
        }
      ],
    estimatedTime: 12,
    scoring: { maxPoints: 60, timeBonus: 12, accuracyWeight: 0.8 },
    
    points: 60,
    timeLimit: 12,
    isCompleted: false
  },
  {
    id: '6',
    title: 'Accord du participe passé',
    description: 'Maîtrisez les règles d\'accord du participe passé',
    type: 'grammar',
    difficulty: 'advanced',
    category: 'Grammaire',
    content: {
      questions: [
        {
          id: 'q1',
          text: 'Les fleurs que j\'ai ___ (cueillir) sont belles.',
          type: 'multiple-choice',
          options: ['cueilli', 'cueillies', 'cueillis'],
          correctAnswer: 'cueillies'
        },
        {
          id: 'q2',
          text: 'Elle s\'est ___ (laver) les mains.',
          type: 'multiple-choice',
          options: ['lavé', 'lavée', 'lavés'],
          correctAnswer: 'lavée'
        }
      ]
    },
    estimatedTime: 20,
    scoring: { maxPoints: 80, timeBonus: 20, accuracyWeight: 0.9 },
    points: 80,
    timeLimit: 20,
    isCompleted: false
  },
  {
    id: '7',
    title: 'Vocabulaire des émotions',
    description: 'Apprenez à exprimer vos émotions en français',
    type: 'vocabulary',
    difficulty: 'intermediate',
    category: 'Vocabulaire',
    content: {
      questions: [
        {
          id: 'q1',
          text: 'Quel est le synonyme de "joyeux" ?',
          type: 'multiple-choice',
          options: ['Triste', 'Heureux', 'En colère'],
          correctAnswer: 'Heureux'
        },
        {
          id: 'q2',
          text: 'Que signifie "inquiet" ?',
          type: 'multiple-choice',
          options: ['Calme', 'Soucieux', 'Content'],
          correctAnswer: 'Soucieux'
        }
      ]
    },
    estimatedTime: 6,
    scoring: { maxPoints: 35, timeBonus: 6, accuracyWeight: 0.8 },
    points: 35,
    timeLimit: 6,
    isCompleted: false
  },
  {
    id: '8',
    title: 'Compréhension de texte',
    description: 'Lisez et comprenez un texte sur l\'environnement',
    type: 'comprehension',
    difficulty: 'intermediate',
    category: 'Compréhension',
    content: {
      text: 'La protection de l\'environnement est devenue une préoccupation majeure de notre société. Les changements climatiques, la pollution et la perte de biodiversité menacent notre planète. Chaque individu peut contribuer à la protection de l\'environnement par des gestes simples : réduire sa consommation d\'énergie, trier ses déchets, utiliser les transports en commun...',
      questions: [
        {
          id: 'q1',
          text: 'Quel est le thème principal du texte ?',
          type: 'multiple-choice',
          options: ['L\'économie', 'L\'environnement', 'La politique'],
          correctAnswer: 'L\'environnement'
        },
        {
          id: 'q2',
          text: 'Quels sont les problèmes mentionnés ?',
          type: 'multiple-choice',
          options: ['Le chômage', 'Les changements climatiques', 'L\'éducation'],
          correctAnswer: 'Les changements climatiques'
        }
      ]
    },
    points: 70,
    timeLimit: 15,
    isCompleted: false
  }
];

// Fonction pour filtrer les exercices
function filterExercises(
  exercises: Exercise[],
  search?: string,
  type?: ExerciseType,
  difficulty?: Difficulty,
  category?: string,
  completed?: boolean
): Exercise[] {
  return exercises.filter(exercise => {
    if (search && !exercise.title.toLowerCase().includes(search.toLowerCase()) && 
        !exercise.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    if (type && exercise.type !== type) {
      return false;
    }
    
    if (difficulty && exercise.difficulty !== difficulty) {
      return false;
    }
    
    if (category && exercise.category !== category) {
      return false;
    }
    
    if (completed !== undefined && exercise.isCompleted !== completed) {
      return false;
    }
    
    return true;
  });
}

// Fonction pour trier les exercices
function sortExercises(exercises: Exercise[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Exercise[] {
  return exercises.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        break;
      case 'points':
        comparison = (a.points || a.scoring?.maxPoints || 0) - (b.points || b.scoring?.maxPoints || 0);
        break;
      case 'timeLimit':
        comparison = (a.timeLimit || 0) - (b.timeLimit || 0);
        break;
      case 'createdAt':
        comparison = (a.completedAt || new Date(0)).getTime() - (b.completedAt || new Date(0)).getTime();
        break;
      default:
        return 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

// GET - Récupérer la liste des exercices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const type = searchParams.get('type') as ExerciseType;
    const difficulty = searchParams.get('difficulty') as Difficulty;
    const category = searchParams.get('category') || undefined;
    const completed = searchParams.get('completed') === 'true' ? true : searchParams.get('completed') === 'false' ? false : undefined;
    const sortBy = searchParams.get('sortBy') || 'title';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

    // Filtrer les exercices
    let filteredExercises = filterExercises(mockExercises, search || undefined, type, difficulty, category, completed);

    // Trier les exercices
    filteredExercises = sortExercises(filteredExercises, sortBy, sortOrder);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedExercises = filteredExercises.slice(startIndex, endIndex);

    // Calculer les métadonnées
    const totalExercises = filteredExercises.length;
    const totalPages = Math.ceil(totalExercises / limit);

    // Statistiques par catégorie
    const categoryStats = mockExercises.reduce((acc, exercise) => {
      const key = exercise.category || 'Autres';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Statistiques par difficulté
    const difficultyStats = mockExercises.reduce((acc, exercise) => {
      acc[exercise.difficulty] = (acc[exercise.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response: PaginatedResponse<Exercise> = {
      success: true,
      data: paginatedExercises,
      pagination: {
        page,
        limit,
        total: totalExercises,
        totalPages
      }
    };

    // Ajouter les métadonnées dans les headers
    const responseHeaders = new Headers();
    responseHeaders.set('X-Total-Count', totalExercises.toString());
    responseHeaders.set('X-Total-Pages', totalPages.toString());
    responseHeaders.set('X-Category-Stats', JSON.stringify(categoryStats));
    responseHeaders.set('X-Difficulty-Stats', JSON.stringify(difficultyStats));

    return NextResponse.json(response, { headers: responseHeaders });

  } catch (error) {
    console.error('Erreur lors de la récupération des exercices:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erreur interne du serveur lors de la récupération des exercices'
    }, { status: 500 });
  }
}

// POST - Créer un nouvel exercice (pour les administrateurs)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, difficulty, category, instructions, content, points, timeLimit } = body;

    // Validation des données requises
    if (!title || !description || !type || !difficulty || !category || !content) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Tous les champs obligatoires doivent être fournis'
      }, { status: 400 });
    }

    // Validation du type d'exercice
    const validTypes: ExerciseType[] = ['grammar', 'vocabulary', 'writing', 'comprehension', 'listening'];
    if (!validTypes.includes(type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Type d\'exercice non valide'
      }, { status: 400 });
    }

    // Validation de la difficulté
    const validDifficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Niveau de difficulté non valide'
      }, { status: 400 });
    }

    // Créer le nouvel exercice
    const newExercise: Exercise = {
      id: (mockExercises.length + 1).toString(),
      title,
      description,
      type,
      difficulty,
      category,
      content,
      estimatedTime: timeLimit || 10,
      scoring: { maxPoints: points || 50, timeBonus: timeLimit || 10, accuracyWeight: 0.8 },
      points: points || 50,
      timeLimit: timeLimit || 10,
      isCompleted: false
    };

    // Ajouter à la liste (simulation)
    mockExercises.push(newExercise);

    const response: ApiResponse<{ exercise: Exercise }> = {
      success: true,
      data: { exercise: newExercise },
      message: 'Exercice créé avec succès'
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de l\'exercice:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erreur interne du serveur lors de la création de l\'exercice'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour un exercice
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'L\'ID de l\'exercice est requis'
      }, { status: 400 });
    }

    // Trouver l'exercice
    const exerciseIndex = mockExercises.findIndex(ex => ex.id === id);
    if (exerciseIndex === -1) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Exercice non trouvé'
      }, { status: 404 });
    }

    // Mettre à jour l'exercice
    mockExercises[exerciseIndex] = { ...mockExercises[exerciseIndex], ...updateData };

    const response: ApiResponse<{ exercise: Exercise }> = {
      success: true,
      data: { exercise: mockExercises[exerciseIndex] },
      message: 'Exercice mis à jour avec succès'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'exercice:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erreur interne du serveur lors de la mise à jour de l\'exercice'
    }, { status: 500 });
  }
}

// DELETE - Supprimer un exercice
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'L\'ID de l\'exercice est requis'
      }, { status: 400 });
    }

    // Trouver l'exercice
    const exerciseIndex = mockExercises.findIndex(ex => ex.id === id);
    if (exerciseIndex === -1) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Exercice non trouvé'
      }, { status: 404 });
    }

    // Supprimer l'exercice
    const deletedExercise = mockExercises.splice(exerciseIndex, 1)[0];

    const response: ApiResponse<{ exercise: Exercise }> = {
      success: true,
      data: { exercise: deletedExercise },
      message: 'Exercice supprimé avec succès'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'exercice:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erreur interne du serveur lors de la suppression de l\'exercice'
    }, { status: 500 });
  }
}
