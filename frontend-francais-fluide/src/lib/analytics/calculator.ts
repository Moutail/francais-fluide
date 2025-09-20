import { subDays, subWeeks, subMonths, format, isSameDay, isSameWeek, isSameMonth } from 'date-fns';
import type { ExerciseResult, ProgressData, UserProfile } from '@/types';

// Types pour les analytics
export interface LearningPattern {
  type: 'consistent' | 'sporadic' | 'intensive' | 'declining';
  description: string;
  confidence: number;
  recommendations: string[];
}

export interface EngagementScore {
  overall: number;
  regularity: number;
  intensity: number;
  improvement: number;
  consistency: number;
}

export interface ErrorAnalysis {
  category: string;
  count: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  severity: 'low' | 'medium' | 'high';
  lastOccurrence: Date;
}

export interface ProgressPrediction {
  nextWeek: number;
  nextMonth: number;
  nextQuarter: number;
  confidence: number;
  factors: string[];
}

export interface ActivityHeatmapData {
  date: string;
  value: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ComparisonData {
  user: {
    score: number;
    rank: number;
    percentile: number;
  };
  average: {
    score: number;
    trend: 'up' | 'down' | 'stable';
  };
  topPerformers: {
    score: number;
    gap: number;
  };
}

export interface AnalyticsData {
  totalExercises: number;
  totalTimeSpent: number;
  averageScore: number;
  currentStreak: number;
  bestStreak: number;
  accuracyRate: number;
  improvementRate: number;
  engagementScore: EngagementScore;
  errorAnalysis: ErrorAnalysis[];
  learningPattern: LearningPattern;
  progressPrediction: ProgressPrediction;
  activityHeatmap: ActivityHeatmapData[];
  comparison: ComparisonData;
}

// Calculateur d'analytics
export class AnalyticsCalculator {
  private userProfile: UserProfile;
  private exerciseResults: ExerciseResult[];
  private progressData: ProgressData[];

  constructor(userProfile: UserProfile, exerciseResults: ExerciseResult[], progressData: ProgressData[]) {
    this.userProfile = userProfile;
    this.exerciseResults = exerciseResults;
    this.progressData = progressData;
  }

  // Calculer toutes les analytics
  calculateAllAnalytics(): AnalyticsData {
    return {
      totalExercises: this.calculateTotalExercises(),
      totalTimeSpent: this.calculateTotalTimeSpent(),
      averageScore: this.calculateAverageScore(),
      currentStreak: this.calculateCurrentStreak(),
      bestStreak: this.calculateBestStreak(),
      accuracyRate: this.calculateAccuracyRate(),
      improvementRate: this.calculateImprovementRate(),
      engagementScore: this.calculateEngagementScore(),
      errorAnalysis: this.analyzeErrors(),
      learningPattern: this.detectLearningPattern(),
      progressPrediction: this.predictProgress(),
      activityHeatmap: this.generateActivityHeatmap(),
      comparison: this.calculateComparison()
    };
  }

  // Calculer le nombre total d'exercices
  private calculateTotalExercises(): number {
    return this.exerciseResults.length;
  }

  // Calculer le temps total passé
  private calculateTotalTimeSpent(): number {
    return this.exerciseResults.reduce((total, result) => total + result.timeSpent, 0);
  }

  // Calculer le score moyen
  private calculateAverageScore(): number {
    if (this.exerciseResults.length === 0) return 0;
    const totalScore = this.exerciseResults.reduce((sum, result) => sum + result.score, 0);
    return totalScore / this.exerciseResults.length;
  }

  // Calculer la série actuelle
  private calculateCurrentStreak(): number {
    const sortedResults = [...this.exerciseResults].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    let streak = 0;
    for (const result of sortedResults) {
      if (result.accuracy >= 0.7) { // Seuil de réussite
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Calculer la meilleure série
  private calculateBestStreak(): number {
    const sortedResults = [...this.exerciseResults].sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    let maxStreak = 0;
    let currentStreak = 0;

    for (const result of sortedResults) {
      if (result.accuracy >= 0.7) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return maxStreak;
  }

  // Calculer le taux de précision
  private calculateAccuracyRate(): number {
    if (this.exerciseResults.length === 0) return 0;
    const totalAccuracy = this.exerciseResults.reduce((sum, result) => sum + result.accuracy, 0);
    return totalAccuracy / this.exerciseResults.length;
  }

  // Calculer le taux d'amélioration
  private calculateImprovementRate(): number {
    if (this.exerciseResults.length < 2) return 0;

    const sortedResults = [...this.exerciseResults].sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    const firstHalf = sortedResults.slice(0, Math.floor(sortedResults.length / 2));
    const secondHalf = sortedResults.slice(Math.floor(sortedResults.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, result) => sum + result.score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, result) => sum + result.score, 0) / secondHalf.length;

    return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  }

  // Calculer le score d'engagement
  private calculateEngagementScore(): EngagementScore {
    const regularity = this.calculateRegularity();
    const intensity = this.calculateIntensity();
    const improvement = this.calculateImprovement();
    const consistency = this.calculateConsistency();

    const overall = (regularity + intensity + improvement + consistency) / 4;

    return {
      overall: Math.round(overall),
      regularity: Math.round(regularity),
      intensity: Math.round(intensity),
      improvement: Math.round(improvement),
      consistency: Math.round(consistency)
    };
  }

  // Calculer la régularité
  private calculateRegularity(): number {
    const last30Days = this.exerciseResults.filter(result => 
      new Date(result.completedAt) >= subDays(new Date(), 30)
    );

    if (last30Days.length === 0) return 0;

    // Compter les jours avec activité
    const activeDays = new Set(
      last30Days.map(result => format(new Date(result.completedAt), 'yyyy-MM-dd'))
    ).size;

    return (activeDays / 30) * 100;
  }

  // Calculer l'intensité
  private calculateIntensity(): number {
    const last7Days = this.exerciseResults.filter(result => 
      new Date(result.completedAt) >= subDays(new Date(), 7)
    );

    if (last7Days.length === 0) return 0;

    const totalTime = last7Days.reduce((sum, result) => sum + result.timeSpent, 0);
    const averageTimePerDay = totalTime / 7;

    // Score basé sur le temps moyen par jour (max 100 pour 2h/jour)
    return Math.min(100, (averageTimePerDay / 120) * 100);
  }

  // Calculer l'amélioration
  private calculateImprovement(): number {
    const improvementRate = this.calculateImprovementRate();
    return Math.max(0, Math.min(100, 50 + improvementRate));
  }

  // Calculer la consistance
  private calculateConsistency(): number {
    if (this.exerciseResults.length < 3) return 0;

    const scores = this.exerciseResults.map(result => result.score);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Score basé sur l'écart-type (plus bas = plus consistant)
    const coefficientOfVariation = standardDeviation / mean;
    return Math.max(0, 100 - (coefficientOfVariation * 100));
  }

  // Analyser les erreurs
  private analyzeErrors(): ErrorAnalysis[] {
    const errorCategories = new Map<string, { count: number; lastOccurrence: Date }>();

    this.exerciseResults.forEach(result => {
      result.answers.forEach(answer => {
        if (!answer.isCorrect) {
          // Simuler des catégories d'erreurs basées sur le type de question
          const category = this.categorizeError(answer);
          const existing = errorCategories.get(category) || { count: 0, lastOccurrence: new Date(0) };
          errorCategories.set(category, {
            count: existing.count + 1,
            lastOccurrence: new Date(result.completedAt) > existing.lastOccurrence 
              ? new Date(result.completedAt) 
              : existing.lastOccurrence
          });
        }
      });
    });

    const totalErrors = Array.from(errorCategories.values()).reduce((sum, cat) => sum + cat.count, 0);

    return Array.from(errorCategories.entries()).map(([category, data]) => {
      const percentage = (data.count / totalErrors) * 100;
      const trend = this.calculateErrorTrend(category);
      const severity = this.calculateErrorSeverity(data.count, percentage);

      return {
        category,
        count: data.count,
        percentage: Math.round(percentage * 100) / 100,
        trend,
        severity,
        lastOccurrence: data.lastOccurrence
      };
    }).sort((a, b) => b.count - a.count);
  }

  // Catégoriser une erreur
  private categorizeError(answer: any): string {
    // Simulation basée sur le contenu de la réponse
    const content = answer.answer.toLowerCase();
    
    if (content.includes('être') || content.includes('avoir')) return 'Conjugaison';
    if (content.includes('le ') || content.includes('la ')) return 'Articles';
    if (content.includes('s') || content.includes('x')) return 'Accords';
    if (content.includes('à') || content.includes('de')) return 'Prépositions';
    if (content.includes('et') || content.includes('ou')) return 'Conjonctions';
    
    return 'Autres';
  }

  // Calculer la tendance d'une erreur
  private calculateErrorTrend(category: string): 'increasing' | 'decreasing' | 'stable' {
    // Simulation basée sur les données récentes
    const recentErrors = this.exerciseResults
      .filter(result => new Date(result.completedAt) >= subWeeks(new Date(), 2))
      .flatMap(result => result.answers.filter(answer => !answer.isCorrect));

    const oldErrors = this.exerciseResults
      .filter(result => {
        const date = new Date(result.completedAt);
        return date >= subWeeks(new Date(), 4) && date < subWeeks(new Date(), 2);
      })
      .flatMap(result => result.answers.filter(answer => !answer.isCorrect));

    const recentCount = recentErrors.length;
    const oldCount = oldErrors.length;

    if (recentCount > oldCount * 1.1) return 'increasing';
    if (recentCount < oldCount * 0.9) return 'decreasing';
    return 'stable';
  }

  // Calculer la sévérité d'une erreur
  private calculateErrorSeverity(count: number, percentage: number): 'low' | 'medium' | 'high' {
    if (count >= 10 || percentage >= 30) return 'high';
    if (count >= 5 || percentage >= 15) return 'medium';
    return 'low';
  }

  // Détecter le pattern d'apprentissage
  private detectLearningPattern(): LearningPattern {
    const regularity = this.calculateRegularity();
    const intensity = this.calculateIntensity();
    const improvement = this.calculateImprovementRate();

    if (regularity >= 70 && intensity >= 60 && improvement > 0) {
      return {
        type: 'consistent',
        description: 'Vous maintenez une pratique régulière et intensive avec des améliorations constantes.',
        confidence: 0.9,
        recommendations: [
          'Continuez à maintenir ce rythme',
          'Essayez des exercices plus difficiles',
          'Partagez vos progrès avec d\'autres apprenants'
        ]
      };
    }

    if (regularity >= 80 && intensity < 40) {
      return {
        type: 'sporadic',
        description: 'Vous pratiquez régulièrement mais de manière légère.',
        confidence: 0.8,
        recommendations: [
          'Augmentez la durée de vos sessions',
          'Ajoutez des exercices plus intensifs',
          'Fixez-vous des objectifs quotidiens'
        ]
      };
    }

    if (intensity >= 80 && regularity < 50) {
      return {
        type: 'intensive',
        description: 'Vous pratiquez de manière intensive mais irrégulière.',
        confidence: 0.7,
        recommendations: [
          'Établissez une routine quotidienne',
          'Répartissez vos sessions sur la semaine',
          'Utilisez des rappels pour maintenir la régularité'
        ]
      };
    }

    if (improvement < -10) {
      return {
        type: 'declining',
        description: 'Vos performances semblent en déclin récemment.',
        confidence: 0.6,
        recommendations: [
          'Revoyez vos méthodes d\'apprentissage',
          'Consultez un tuteur ou un professeur',
          'Prenez une pause et revenez avec de nouveaux objectifs'
        ]
      };
    }

    return {
      type: 'consistent',
      description: 'Votre pattern d\'apprentissage est équilibré.',
      confidence: 0.5,
      recommendations: [
        'Continuez à pratiquer régulièrement',
        'Variez les types d\'exercices',
        'Fixez-vous des objectifs à court terme'
      ]
    };
  }

  // Prédire la progression
  private predictProgress(): ProgressPrediction {
    const recentScores = this.exerciseResults
      .filter(result => new Date(result.completedAt) >= subWeeks(new Date(), 4))
      .map(result => result.score)
      .sort((a, b) => a - b);

    if (recentScores.length < 3) {
      return {
        nextWeek: this.calculateAverageScore(),
        nextMonth: this.calculateAverageScore(),
        nextQuarter: this.calculateAverageScore(),
        confidence: 0.3,
        factors: ['Données insuffisantes']
      };
    }

    // Calculer la tendance linéaire
    const trend = this.calculateLinearTrend(recentScores);
    const currentScore = this.calculateAverageScore();

    const nextWeek = Math.max(0, Math.min(100, currentScore + trend * 7));
    const nextMonth = Math.max(0, Math.min(100, currentScore + trend * 30));
    const nextQuarter = Math.max(0, Math.min(100, currentScore + trend * 90));

    const confidence = Math.min(0.9, recentScores.length / 20);

    const factors = [];
    if (this.calculateRegularity() > 70) factors.push('Régularité élevée');
    if (this.calculateIntensity() > 60) factors.push('Intensité élevée');
    if (this.calculateImprovementRate() > 0) factors.push('Amélioration positive');

    return {
      nextWeek: Math.round(nextWeek),
      nextMonth: Math.round(nextMonth),
      nextQuarter: Math.round(nextQuarter),
      confidence: Math.round(confidence * 100) / 100,
      factors
    };
  }

  // Calculer la tendance linéaire
  private calculateLinearTrend(scores: number[]): number {
    const n = scores.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = scores;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  // Générer les données de heatmap d'activité
  private generateActivityHeatmap(): ActivityHeatmapData[] {
    const lastYear = subMonths(new Date(), 12);
    const activityMap = new Map<string, number>();

    this.exerciseResults.forEach(result => {
      const date = format(new Date(result.completedAt), 'yyyy-MM-dd');
      const existing = activityMap.get(date) || 0;
      activityMap.set(date, existing + 1);
    });

    const heatmapData: ActivityHeatmapData[] = [];
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const value = activityMap.get(dateStr) || 0;
      
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (value > 0) level = 1;
      if (value > 2) level = 2;
      if (value > 5) level = 3;
      if (value > 10) level = 4;

      heatmapData.push({
        date: dateStr,
        value,
        level
      });
    }

    return heatmapData.reverse();
  }

  // Calculer les comparaisons
  private calculateComparison(): ComparisonData {
    const userScore = this.calculateAverageScore();
    
    // Simulation des données de comparaison
    const averageScore = 75; // Score moyen des utilisateurs
    const topScore = 95; // Score des meilleurs utilisateurs
    
    const rank = Math.round((userScore / 100) * 1000); // Simulation du rang
    const percentile = Math.round((userScore / 100) * 100);
    
    const trend = userScore > averageScore ? 'up' : 'down';
    const gap = topScore - userScore;

    return {
      user: {
        score: Math.round(userScore),
        rank,
        percentile
      },
      average: {
        score: averageScore,
        trend
      },
      topPerformers: {
        score: topScore,
        gap: Math.round(gap)
      }
    };
  }
}

// Fonction utilitaire pour créer un calculateur
export function createAnalyticsCalculator(
  userProfile: UserProfile,
  exerciseResults: ExerciseResult[],
  progressData: ProgressData[]
): AnalyticsCalculator {
  return new AnalyticsCalculator(userProfile, exerciseResults, progressData);
}
