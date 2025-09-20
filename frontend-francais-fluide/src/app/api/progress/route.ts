import { NextRequest, NextResponse } from 'next/server';
import type { ProgressData, UserStatistics, ApiResponse, PaginatedResponse } from '@/types';

// Données mockées pour la progression
let mockProgressData: ProgressData[] = [
  {
    userId: '1',
    exerciseId: '1',
    score: 95,
    timeSpent: 8,
    completedAt: new Date('2024-01-15T10:30:00Z'),
    errors: ['accord_adjectif'],
    improvements: ['conjugaison_present']
  },
  {
    userId: '1',
    exerciseId: '2',
    score: 87,
    timeSpent: 12,
    completedAt: new Date('2024-01-16T14:20:00Z'),
    errors: ['conjugaison_present', 'accord_participe_passe'],
    improvements: ['vocabulaire']
  },
  {
    userId: '1',
    exerciseId: '3',
    score: 92,
    timeSpent: 6,
    completedAt: new Date('2024-01-17T09:15:00Z'),
    errors: ['ponctuation_espace'],
    improvements: ['accord_adjectif']
  }
];

let mockUserStatistics: UserStatistics = {
  totalWords: 15420,
  totalErrors: 342,
  totalCorrections: 298,
  accuracyRate: 87.5,
  dailyStreak: 12,
  bestStreak: 28,
  totalPracticeTime: 45.5,
  lastPracticeDate: new Date('2024-01-20T16:30:00Z'),
  progressByCategory: {
    'Grammaire': 75,
    'Vocabulaire': 90,
    'Conjugaison': 65,
    'Expression écrite': 80,
    'Compréhension': 85
  }
};

// Fonction pour calculer les statistiques à partir des données de progression
function calculateStatistics(userId: string, progressData: ProgressData[]): UserStatistics {
  const userProgress = progressData.filter(p => p.userId === userId);
  
  const totalWords = userProgress.reduce((sum, p) => sum + Math.floor(p.timeSpent * 20), 0); // Estimation: 20 mots/minute
  const totalErrors = userProgress.reduce((sum, p) => sum + p.errors.length, 0);
  const totalCorrections = userProgress.reduce((sum, p) => sum + p.improvements.length, 0);
  const accuracyRate = totalWords > 0 ? Math.max(0, 100 - (totalErrors / totalWords) * 100) : 100;
  
  // Calculer la série quotidienne (simulation)
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentProgress = userProgress.filter(p => p.completedAt >= lastWeek);
  const dailyStreak = Math.min(recentProgress.length, 7); // Simulation simple
  
  const totalPracticeTime = userProgress.reduce((sum, p) => sum + p.timeSpent, 0) / 60; // Convertir en heures
  
  // Calculer la progression par catégorie (simulation)
  const progressByCategory: Record<string, number> = {
    'Grammaire': 75,
    'Vocabulaire': 90,
    'Conjugaison': 65,
    'Expression écrite': 80,
    'Compréhension': 85
  };
  
  // Ajuster selon les erreurs et améliorations
  userProgress.forEach(p => {
    p.errors.forEach(error => {
      if (error.includes('grammaire') || error.includes('accord')) {
        progressByCategory['Grammaire'] = Math.max(0, progressByCategory['Grammaire'] - 2);
      }
      if (error.includes('conjugaison')) {
        progressByCategory['Conjugaison'] = Math.max(0, progressByCategory['Conjugaison'] - 2);
      }
    });
    
    p.improvements.forEach(improvement => {
      if (improvement.includes('vocabulaire')) {
        progressByCategory['Vocabulaire'] = Math.min(100, progressByCategory['Vocabulaire'] + 3);
      }
      if (improvement.includes('grammaire')) {
        progressByCategory['Grammaire'] = Math.min(100, progressByCategory['Grammaire'] + 3);
      }
    });
  });

  return {
    totalWords,
    totalErrors,
    totalCorrections,
    accuracyRate: Math.round(accuracyRate * 10) / 10,
    dailyStreak,
    bestStreak: Math.max(dailyStreak, 28), // Simulation
    totalPracticeTime: Math.round(totalPracticeTime * 10) / 10,
    lastPracticeDate: userProgress.length > 0 ? userProgress[userProgress.length - 1].completedAt : new Date(),
    progressByCategory
  };
}

// GET - Récupérer la progression de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '1';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const exerciseId = searchParams.get('exerciseId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Filtrer les données selon les paramètres
    let filteredData = mockProgressData.filter(p => p.userId === userId);

    if (exerciseId) {
      filteredData = filteredData.filter(p => p.exerciseId === exerciseId);
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredData = filteredData.filter(p => p.completedAt >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredData = filteredData.filter(p => p.completedAt <= end);
    }

    // Trier par date de completion (plus récent en premier)
    filteredData.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Calculer les statistiques
    const statistics = calculateStatistics(userId, mockProgressData);

    const response: PaginatedResponse<ProgressData> = {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erreur interne du serveur lors de la récupération de la progression'
    }, { status: 500 });
  }
}

// POST - Enregistrer une nouvelle progression
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, exerciseId, score, timeSpent, errors = [], improvements = [] } = body;

    // Validation des données
    if (!userId || !exerciseId || typeof score !== 'number' || typeof timeSpent !== 'number') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Les champs userId, exerciseId, score et timeSpent sont requis'
      }, { status: 400 });
    }

    if (score < 0 || score > 100) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Le score doit être entre 0 et 100'
      }, { status: 400 });
    }

    if (timeSpent < 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Le temps passé doit être positif'
      }, { status: 400 });
    }

    // Créer la nouvelle entrée de progression
    const newProgress: ProgressData = {
      userId,
      exerciseId,
      score,
      timeSpent,
      completedAt: new Date(),
      errors: Array.isArray(errors) ? errors : [],
      improvements: Array.isArray(improvements) ? improvements : []
    };

    // Ajouter aux données mockées
    mockProgressData.push(newProgress);

    // Mettre à jour les statistiques
    mockUserStatistics = calculateStatistics(userId, mockProgressData);

    // Calculer des points de récompense basés sur le score
    const basePoints = Math.floor(score / 10) * 10; // 10 points par tranche de 10%
    const timeBonus = timeSpent < 5 ? 5 : 0; // Bonus pour rapidité
    const accuracyBonus = score >= 90 ? 10 : 0; // Bonus pour précision
    const totalPoints = basePoints + timeBonus + accuracyBonus;

    // Déterminer les récompenses
    const rewards = [];
    if (score >= 100) rewards.push('Parfait!');
    if (score >= 90) rewards.push('Excellent travail!');
    if (timeSpent < 5) rewards.push('Rapide!');
    if (errors.length === 0) rewards.push('Aucune erreur!');

    const response: ApiResponse<{
      progress: ProgressData;
      points: number;
      rewards: string[];
      statistics: UserStatistics;
    }> = {
      success: true,
      data: {
        progress: newProgress,
        points: totalPoints,
        rewards,
        statistics: mockUserStatistics
      }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la progression:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erreur interne du serveur lors de l\'enregistrement de la progression'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour les statistiques de l'utilisateur
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, statistics } = body;

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Le userId est requis'
      }, { status: 400 });
    }

    // Mettre à jour les statistiques (simulation)
    if (statistics) {
      mockUserStatistics = { ...mockUserStatistics, ...statistics };
    }

    const response: ApiResponse<{ statistics: UserStatistics }> = {
      success: true,
      data: { statistics: mockUserStatistics }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erreur interne du serveur lors de la mise à jour des statistiques'
    }, { status: 500 });
  }
}

// DELETE - Supprimer des données de progression
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const exerciseId = searchParams.get('exerciseId');

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Le userId est requis'
      }, { status: 400 });
    }

    // Supprimer les données selon les critères
    if (exerciseId) {
      mockProgressData = mockProgressData.filter(p => !(p.userId === userId && p.exerciseId === exerciseId));
    } else {
      mockProgressData = mockProgressData.filter(p => p.userId !== userId);
    }

    // Recalculer les statistiques
    mockUserStatistics = calculateStatistics(userId, mockProgressData);

    const response: ApiResponse<{ deletedCount: number }> = {
      success: true,
      data: { deletedCount: mockProgressData.length }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la suppression de la progression:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Erreur interne du serveur lors de la suppression de la progression'
    }, { status: 500 });
  }
}
