// lib/ai-recommendations.ts - Service IA pour recommandations personnalisées
import { telemetry } from './telemetry';

interface UserProfile {
  userId: string;
  errorPatterns: string[];
  averageResponseTime: number;
  accuracyRate: number;
  preferredExerciseTypes: string[];
  learningStreak: number;
  totalExercisesCompleted: number;
}

interface AIRecommendation {
  type: 'exercise' | 'study_plan' | 'difficulty_adjustment' | 'focus_area';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  data: any;
  reasoning: string;
}

class AIRecommendationService {
  private baseUrl = '/api/ai-enhanced';

  // Analyser les données de télémétrie pour créer un profil utilisateur
  async analyzeUserProfile(userId: string): Promise<UserProfile> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) return this.getDefaultProfile(userId);

      // Récupérer les analytics de télémétrie
      const response = await fetch('/api/telemetry', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return this.getDefaultProfile(userId);

      const analytics = await response.json();
      if (!analytics.success) return this.getDefaultProfile(userId);

      const { errorPatterns, averageResponseTimes } = analytics.data;

      // Analyser les patterns d'erreur
      const errorTypes = Object.keys(errorPatterns).map(key => {
        const pattern = errorPatterns[key];
        return pattern.type;
      });

      // Calculer le temps de réponse moyen
      const avgResponseTime = Object.values(averageResponseTimes).reduce((acc: number, stats: any) => {
        return acc + (stats.average || 0);
      }, 0) / Object.keys(averageResponseTimes).length;

      // Calculer le taux de précision (basé sur les patterns)
      const totalErrors = Object.values(errorPatterns).reduce((acc: number, pattern: any) => {
        return acc + pattern.count;
      }, 0);
      const accuracyRate = Math.max(0, 1 - (totalErrors / 100)); // Estimation

      return {
        userId,
        errorPatterns: errorTypes,
        averageResponseTime: avgResponseTime || 30000,
        accuracyRate: Math.min(1, accuracyRate),
        preferredExerciseTypes: this.extractPreferredTypes(errorPatterns),
        learningStreak: 0, // À récupérer depuis l'API progress
        totalExercisesCompleted: analytics.data.totalEvents || 0
      };
    } catch (error) {
      console.error('Erreur analyse profil utilisateur:', error);
      return this.getDefaultProfile(userId);
    }
  }

  // Générer des recommandations personnalisées
  async generateRecommendations(userId: string): Promise<AIRecommendation[]> {
    const profile = await this.analyzeUserProfile(userId);
    const recommendations: AIRecommendation[] = [];

    // 1. Recommandations basées sur les erreurs fréquentes
    const errorRecommendations = this.generateErrorBasedRecommendations(profile);
    recommendations.push(...errorRecommendations);

    // 2. Recommandations de difficulté
    const difficultyRecommendations = this.generateDifficultyRecommendations(profile);
    recommendations.push(...difficultyRecommendations);

    // 3. Recommandations de focus
    const focusRecommendations = this.generateFocusRecommendations(profile);
    recommendations.push(...focusRecommendations);

    // 4. Recommandations de plan d'étude
    const studyPlanRecommendations = this.generateStudyPlanRecommendations(profile);
    recommendations.push(...studyPlanRecommendations);

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Recommandations basées sur les erreurs
  private generateErrorBasedRecommendations(profile: UserProfile): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Analyser les types d'erreurs les plus fréquents
    const errorCounts = profile.errorPatterns.reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    mostCommonErrors.forEach(([errorType, count]) => {
      if (count > 2) { // Seuil d'erreurs fréquentes
        recommendations.push({
          type: 'focus_area',
          title: `Focus sur ${this.getErrorTypeLabel(errorType)}`,
          description: `Vous avez ${count} erreurs de ce type. Concentrez-vous sur cette compétence.`,
          priority: count > 5 ? 'high' : 'medium',
          data: { errorType, count },
          reasoning: `Pattern d'erreur détecté: ${errorType} (${count} occurrences)`
        });
      }
    });

    return recommendations;
  }

  // Recommandations de difficulté
  private generateDifficultyRecommendations(profile: UserProfile): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Si temps de réponse trop long
    if (profile.averageResponseTime > 60000) { // Plus d'1 minute
      recommendations.push({
        type: 'difficulty_adjustment',
        title: 'Réduire la difficulté',
        description: 'Vos temps de réponse sont élevés. Essayez des exercices plus faciles.',
        priority: 'high',
        data: { currentTime: profile.averageResponseTime, suggestedTime: 30000 },
        reasoning: `Temps de réponse moyen: ${Math.round(profile.averageResponseTime/1000)}s (recommandé: <30s)`
      });
    }

    // Si précision trop faible
    if (profile.accuracyRate < 0.6) {
      recommendations.push({
        type: 'difficulty_adjustment',
        title: 'Améliorer la précision',
        description: 'Votre taux de réussite est faible. Concentrez-vous sur les bases.',
        priority: 'high',
        data: { currentAccuracy: profile.accuracyRate, targetAccuracy: 0.8 },
        reasoning: `Taux de précision: ${Math.round(profile.accuracyRate * 100)}% (objectif: >80%)`
      });
    }

    return recommendations;
  }

  // Recommandations de focus
  private generateFocusRecommendations(profile: UserProfile): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Si pas assez d'exercices complétés
    if (profile.totalExercisesCompleted < 10) {
      recommendations.push({
        type: 'study_plan',
        title: 'Augmenter la pratique',
        description: 'Complétez plus d\'exercices pour améliorer vos compétences.',
        priority: 'medium',
        data: { current: profile.totalExercisesCompleted, target: 20 },
        reasoning: `Seulement ${profile.totalExercisesCompleted} exercices complétés`
      });
    }

    // Si pas de streak
    if (profile.learningStreak < 3) {
      recommendations.push({
        type: 'study_plan',
        title: 'Maintenir la régularité',
        description: 'Pratiquez quotidiennement pour maintenir votre progression.',
        priority: 'medium',
        data: { currentStreak: profile.learningStreak, targetStreak: 7 },
        reasoning: `Série actuelle: ${profile.learningStreak} jours (objectif: 7 jours)`
      });
    }

    return recommendations;
  }

  // Recommandations de plan d'étude
  private generateStudyPlanRecommendations(profile: UserProfile): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Plan personnalisé basé sur les erreurs
    if (profile.errorPatterns.length > 0) {
      recommendations.push({
        type: 'study_plan',
        title: 'Plan d\'étude personnalisé',
        description: 'Un plan adapté à vos difficultés spécifiques a été créé.',
        priority: 'high',
        data: {
          focusAreas: profile.errorPatterns.slice(0, 3),
          estimatedDuration: '2-3 semaines',
          exercisesPerDay: 3
        },
        reasoning: `Basé sur ${profile.errorPatterns.length} types d'erreurs identifiés`
      });
    }

    return recommendations;
  }

  // Utilitaires
  private getDefaultProfile(userId: string): UserProfile {
    return {
      userId,
      errorPatterns: [],
      averageResponseTime: 30000,
      accuracyRate: 0.8,
      preferredExerciseTypes: ['grammar', 'vocabulary'],
      learningStreak: 0,
      totalExercisesCompleted: 0
    };
  }

  private extractPreferredTypes(errorPatterns: any): string[] {
    const types = new Set<string>();
    Object.values(errorPatterns).forEach((pattern: any) => {
      if (pattern.data && pattern.data.exerciseType) {
        types.add(pattern.data.exerciseType);
      }
    });
    return Array.from(types);
  }

  private getErrorTypeLabel(errorType: string): string {
    const labels: Record<string, string> = {
      'answer_selected': 'Sélection de réponses',
      'answer_changed': 'Changements de réponse',
      'question_skipped': 'Questions ignorées',
      'question_completed': 'Questions complétées'
    };
    return labels[errorType] || errorType;
  }

  // Envoyer des recommandations à l'IA pour génération d'exercices
  async generatePersonalizedExercises(userId: string, count: number = 3) {
    const recommendations = await this.generateRecommendations(userId);
    const focusAreas = recommendations
      .filter(r => r.type === 'focus_area')
      .map(r => r.data.errorType);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) return [];

      const response = await fetch(`${this.baseUrl}/generate-exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          count,
          focusAreas,
          difficulty: this.calculateOptimalDifficulty(recommendations),
          userProfile: await this.analyzeUserProfile(userId)
        })
      });

      const data = await response.json();
      return data.success ? data.exercises : [];
    } catch (error) {
      console.error('Erreur génération exercices personnalisés:', error);
      return [];
    }
  }

  private calculateOptimalDifficulty(recommendations: AIRecommendation[]): string {
    const difficultyRec = recommendations.find(r => r.type === 'difficulty_adjustment');
    if (difficultyRec) {
      return difficultyRec.data.suggestedTime < 30000 ? 'easy' : 'medium';
    }
    return 'medium';
  }
}

export const aiRecommendations = new AIRecommendationService();
export default aiRecommendations;
