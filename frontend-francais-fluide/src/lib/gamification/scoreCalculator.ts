/**
 * Système de calcul de score et de progression pour FrançaisFluide
 * Gère les points, niveaux, streaks et métriques de performance
 */

export interface ScoreMetrics {
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  streakDays: number;
  perfectStreak: number;
  accuracyRate: number;
  wordsWritten: number;
  exercisesCompleted: number;
  errorsCorrected: number;
  achievementsUnlocked: number;
}

export interface LevelInfo {
  level: number;
  name: string;
  requiredPoints: number;
  color: string;
  icon: string;
}

export interface ScoreEvent {
  type: 'word_written' | 'error_corrected' | 'exercise_completed' | 'perfect_text' | 'achievement_unlocked';
  points: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class ScoreCalculator {
  private static readonly LEVELS: LevelInfo[] = [
    { level: 1, name: 'Débutant', requiredPoints: 0, color: 'gray', icon: '🌱' },
    { level: 2, name: 'Apprenti', requiredPoints: 100, color: 'blue', icon: '📚' },
    { level: 3, name: 'Étudiant', requiredPoints: 300, color: 'green', icon: '🎓' },
    { level: 4, name: 'Confirmé', requiredPoints: 600, color: 'yellow', icon: '⭐' },
    { level: 5, name: 'Expert', requiredPoints: 1000, color: 'orange', icon: '🔥' },
    { level: 6, name: 'Maître', requiredPoints: 1500, color: 'purple', icon: '👑' },
    { level: 7, name: 'Génie', requiredPoints: 2200, color: 'red', icon: '🧠' },
  ];

  private static readonly POINT_VALUES = {
    word_written: 1,
    error_corrected: 5,
    exercise_completed: 10,
    perfect_text: 15,
    achievement_unlocked: 25,
  };

  /**
   * Calcule le score total à partir d'une liste d'événements
   */
  public static calculateTotalScore(events: ScoreEvent[]): number {
    return events.reduce((total, event) => total + event.points, 0);
  }

  /**
   * Détermine le niveau actuel basé sur les points
   */
  public static getCurrentLevel(points: number): LevelInfo {
    for (let i = this.LEVELS.length - 1; i >= 0; i--) {
      if (points >= this.LEVELS[i].requiredPoints) {
        return this.LEVELS[i];
      }
    }
    return this.LEVELS[0];
  }

  /**
   * Calcule les points nécessaires pour le niveau suivant
   */
  public static getPointsToNextLevel(points: number): number {
    const currentLevel = this.getCurrentLevel(points);
    const nextLevel = this.LEVELS.find(level => level.level === currentLevel.level + 1);
    
    if (!nextLevel) {
      return 0; // Niveau maximum atteint
    }
    
    return nextLevel.requiredPoints - points;
  }

  /**
   * Calcule le streak de jours consécutifs
   */
  public static calculateStreakDays(events: ScoreEvent[]): number {
    if (events.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyEvents = this.groupEventsByDay(events);
    const sortedDays = Object.keys(dailyEvents).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;
    let currentDate = new Date(today);

    for (const day of sortedDays) {
      const dayDate = new Date(day);
      const dayDiff = Math.floor((currentDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 0 || dayDiff === 1) {
        streak++;
        currentDate = dayDate;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calcule le streak de textes parfaits consécutifs
   */
  public static calculatePerfectStreak(events: ScoreEvent[]): number {
    const perfectEvents = events
      .filter(e => e.type === 'perfect_text')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const event of perfectEvents) {
      const eventDate = new Date(event.timestamp);
      eventDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((currentDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 0 || dayDiff === 1) {
        streak++;
        currentDate = eventDate;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calcule le taux de précision global
   */
  public static calculateAccuracyRate(events: ScoreEvent[]): number {
    const wordsWritten = events.filter(e => e.type === 'word_written').length;
    const errorsCorrected = events.filter(e => e.type === 'error_corrected').length;
    
    if (wordsWritten === 0) return 100;
    
    const errorRate = (errorsCorrected / wordsWritten) * 100;
    return Math.max(0, 100 - errorRate);
  }

  /**
   * Génère des métriques complètes
   */
  public static generateMetrics(events: ScoreEvent[]): ScoreMetrics {
    const totalPoints = this.calculateTotalScore(events);
    const currentLevel = this.getCurrentLevel(totalPoints);
    const pointsToNextLevel = this.getPointsToNextLevel(totalPoints);
    const streakDays = this.calculateStreakDays(events);
    const perfectStreak = this.calculatePerfectStreak(events);
    const accuracyRate = this.calculateAccuracyRate(events);
    
    const wordsWritten = events.filter(e => e.type === 'word_written').length;
    const exercisesCompleted = events.filter(e => e.type === 'exercise_completed').length;
    const errorsCorrected = events.filter(e => e.type === 'error_corrected').length;
    const achievementsUnlocked = events.filter(e => e.type === 'achievement_unlocked').length;

    return {
      totalPoints,
      currentLevel: currentLevel.level,
      pointsToNextLevel,
      streakDays,
      perfectStreak,
      accuracyRate,
      wordsWritten,
      exercisesCompleted,
      errorsCorrected,
      achievementsUnlocked,
    };
  }

  /**
   * Crée un événement de score
   */
  public static createScoreEvent(
    type: ScoreEvent['type'],
    metadata?: Record<string, any>
  ): ScoreEvent {
    const points = this.POINT_VALUES[type] || 0;
    
    return {
      type,
      points,
      timestamp: new Date(),
      metadata,
    };
  }

  /**
   * Groupe les événements par jour
   */
  private static groupEventsByDay(events: ScoreEvent[]): Record<string, ScoreEvent[]> {
    return events.reduce((groups, event) => {
      const day = event.timestamp.toISOString().split('T')[0];
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(event);
      return groups;
    }, {} as Record<string, ScoreEvent[]>);
  }

  /**
   * Calcule le progrès vers le niveau suivant (0-1)
   */
  public static getLevelProgress(points: number): number {
    const currentLevel = this.getCurrentLevel(points);
    const nextLevel = this.LEVELS.find(level => level.level === currentLevel.level + 1);
    
    if (!nextLevel) {
      return 1; // Niveau maximum
    }
    
    const progressPoints = points - currentLevel.requiredPoints;
    const requiredPoints = nextLevel.requiredPoints - currentLevel.requiredPoints;
    
    return Math.min(1, Math.max(0, progressPoints / requiredPoints));
  }

  /**
   * Obtient tous les niveaux disponibles
   */
  public static getAllLevels(): LevelInfo[] {
    return [...this.LEVELS];
  }

  /**
   * Obtient les points pour un type d'événement
   */
  public static getPointsForEvent(type: ScoreEvent['type']): number {
    return this.POINT_VALUES[type] || 0;
  }

  /**
   * Valide qu'un événement est valide
   */
  public static isValidEvent(event: Partial<ScoreEvent>): boolean {
    return !!(
      event.type &&
      typeof event.points === 'number' &&
      event.timestamp instanceof Date &&
      event.points >= 0
    );
  }
}
