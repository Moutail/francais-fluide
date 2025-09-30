/**
 * Tests complets pour le système de gamification
 * Teste le calcul de scores, niveaux, streaks et métriques
 */

import {
  ScoreCalculator,
  type ScoreEvent,
  type ScoreMetrics,
} from '@/lib/gamification/scoreCalculator';

describe('ScoreCalculator', () => {
  const mockEvents: ScoreEvent[] = [
    {
      type: 'word_written',
      points: 1,
      timestamp: new Date('2024-01-01T10:00:00Z'),
    },
    {
      type: 'error_corrected',
      points: 5,
      timestamp: new Date('2024-01-01T10:30:00Z'),
    },
    {
      type: 'exercise_completed',
      points: 10,
      timestamp: new Date('2024-01-01T11:00:00Z'),
    },
    {
      type: 'perfect_text',
      points: 15,
      timestamp: new Date('2024-01-02T09:00:00Z'),
    },
    {
      type: 'achievement_unlocked',
      points: 25,
      timestamp: new Date('2024-01-02T10:00:00Z'),
    },
  ];

  describe('Calcul du score total', () => {
    it('calcule correctement le score total', () => {
      const totalScore = ScoreCalculator.calculateTotalScore(mockEvents);
      expect(totalScore).toBe(56); // 1 + 5 + 10 + 15 + 25
    });

    it('retourne 0 pour une liste vide', () => {
      const totalScore = ScoreCalculator.calculateTotalScore([]);
      expect(totalScore).toBe(0);
    });

    it('gère les événements avec des points négatifs', () => {
      const eventsWithNegative = [
        { type: 'word_written' as const, points: -5, timestamp: new Date() },
        { type: 'word_written' as const, points: 10, timestamp: new Date() },
      ];

      const totalScore = ScoreCalculator.calculateTotalScore(eventsWithNegative);
      expect(totalScore).toBe(5);
    });
  });

  describe('Détermination des niveaux', () => {
    it('retourne le niveau 1 pour 0 points', () => {
      const level = ScoreCalculator.getCurrentLevel(0);
      expect(level.level).toBe(1);
      expect(level.name).toBe('Débutant');
      expect(level.color).toBe('gray');
    });

    it('retourne le niveau 2 pour 100 points', () => {
      const level = ScoreCalculator.getCurrentLevel(100);
      expect(level.level).toBe(2);
      expect(level.name).toBe('Apprenti');
      expect(level.color).toBe('blue');
    });

    it('retourne le niveau 7 pour 3000 points', () => {
      const level = ScoreCalculator.getCurrentLevel(3000);
      expect(level.level).toBe(7);
      expect(level.name).toBe('Génie');
      expect(level.color).toBe('red');
    });

    it('retourne le bon niveau pour des points intermédiaires', () => {
      const level = ScoreCalculator.getCurrentLevel(150);
      expect(level.level).toBe(2); // Toujours niveau 2 car 150 < 300
    });
  });

  describe('Calcul des points vers le niveau suivant', () => {
    it('calcule correctement les points manquants', () => {
      const pointsToNext = ScoreCalculator.getPointsToNextLevel(50);
      expect(pointsToNext).toBe(50); // 100 - 50 = 50
    });

    it('retourne 0 pour le niveau maximum', () => {
      const pointsToNext = ScoreCalculator.getPointsToNextLevel(3000);
      expect(pointsToNext).toBe(0);
    });

    it('calcule correctement pour le niveau 1', () => {
      const pointsToNext = ScoreCalculator.getPointsToNextLevel(0);
      expect(pointsToNext).toBe(100);
    });
  });

  describe('Calcul des streaks', () => {
    it('calcule le streak de jours consécutifs', () => {
      const consecutiveEvents: ScoreEvent[] = [
        {
          type: 'word_written',
          points: 1,
          timestamp: new Date('2024-01-01T10:00:00Z'),
        },
        {
          type: 'word_written',
          points: 1,
          timestamp: new Date('2024-01-02T10:00:00Z'),
        },
        {
          type: 'word_written',
          points: 1,
          timestamp: new Date('2024-01-03T10:00:00Z'),
        },
      ];

      const streak = ScoreCalculator.calculateStreakDays(consecutiveEvents);
      expect(streak).toBeGreaterThan(0);
    });

    it('retourne 0 pour une liste vide', () => {
      const streak = ScoreCalculator.calculateStreakDays([]);
      expect(streak).toBe(0);
    });

    it('calcule le streak de textes parfaits', () => {
      const perfectEvents: ScoreEvent[] = [
        {
          type: 'perfect_text',
          points: 15,
          timestamp: new Date('2024-01-01T10:00:00Z'),
        },
        {
          type: 'perfect_text',
          points: 15,
          timestamp: new Date('2024-01-02T10:00:00Z'),
        },
        {
          type: 'word_written',
          points: 1,
          timestamp: new Date('2024-01-02T11:00:00Z'),
        },
      ];

      const perfectStreak = ScoreCalculator.calculatePerfectStreak(perfectEvents);
      expect(perfectStreak).toBeGreaterThan(0);
    });
  });

  describe('Calcul du taux de précision', () => {
    it('calcule un taux de précision de 100% sans erreurs', () => {
      const perfectEvents: ScoreEvent[] = [
        { type: 'word_written', points: 1, timestamp: new Date() },
        { type: 'word_written', points: 1, timestamp: new Date() },
        { type: 'word_written', points: 1, timestamp: new Date() },
      ];

      const accuracy = ScoreCalculator.calculateAccuracyRate(perfectEvents);
      expect(accuracy).toBe(100);
    });

    it('calcule un taux de précision avec des erreurs', () => {
      const eventsWithErrors: ScoreEvent[] = [
        { type: 'word_written', points: 1, timestamp: new Date() },
        { type: 'word_written', points: 1, timestamp: new Date() },
        { type: 'word_written', points: 1, timestamp: new Date() },
        { type: 'error_corrected', points: 5, timestamp: new Date() },
        { type: 'error_corrected', points: 5, timestamp: new Date() },
      ];

      const accuracy = ScoreCalculator.calculateAccuracyRate(eventsWithErrors);
      expect(accuracy).toBeLessThan(100);
      expect(accuracy).toBeGreaterThan(0);
    });

    it('retourne 100% pour une liste vide', () => {
      const accuracy = ScoreCalculator.calculateAccuracyRate([]);
      expect(accuracy).toBe(100);
    });
  });

  describe('Génération des métriques complètes', () => {
    it('génère des métriques correctes', () => {
      const metrics = ScoreCalculator.generateMetrics(mockEvents);

      expect(metrics.totalPoints).toBe(56);
      expect(metrics.currentLevel).toBe(1); // 56 points = niveau 1
      expect(metrics.wordsWritten).toBe(1);
      expect(metrics.exercisesCompleted).toBe(1);
      expect(metrics.errorsCorrected).toBe(1);
      expect(metrics.achievementsUnlocked).toBe(1);
      expect(metrics.accuracyRate).toBeGreaterThanOrEqual(0);
      expect(metrics.accuracyRate).toBeLessThanOrEqual(100);
    });

    it('génère des métriques pour une liste vide', () => {
      const metrics = ScoreCalculator.generateMetrics([]);

      expect(metrics.totalPoints).toBe(0);
      expect(metrics.currentLevel).toBe(1);
      expect(metrics.wordsWritten).toBe(0);
      expect(metrics.exercisesCompleted).toBe(0);
      expect(metrics.errorsCorrected).toBe(0);
      expect(metrics.achievementsUnlocked).toBe(0);
      expect(metrics.accuracyRate).toBe(100);
    });
  });

  describe("Création d'événements de score", () => {
    it('crée un événement de mot écrit', () => {
      const event = ScoreCalculator.createScoreEvent('word_written');

      expect(event.type).toBe('word_written');
      expect(event.points).toBe(1);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it("crée un événement de correction d'erreur", () => {
      const event = ScoreCalculator.createScoreEvent('error_corrected');

      expect(event.type).toBe('error_corrected');
      expect(event.points).toBe(5);
    });

    it("crée un événement d'exercice complété", () => {
      const event = ScoreCalculator.createScoreEvent('exercise_completed');

      expect(event.type).toBe('exercise_completed');
      expect(event.points).toBe(10);
    });

    it('crée un événement de texte parfait', () => {
      const event = ScoreCalculator.createScoreEvent('perfect_text');

      expect(event.type).toBe('perfect_text');
      expect(event.points).toBe(15);
    });

    it("crée un événement d'achievement débloqué", () => {
      const event = ScoreCalculator.createScoreEvent('achievement_unlocked');

      expect(event.type).toBe('achievement_unlocked');
      expect(event.points).toBe(25);
    });

    it('ajoute des métadonnées si fournies', () => {
      const metadata = { exerciseId: 'test-123', difficulty: 'easy' };
      const event = ScoreCalculator.createScoreEvent('exercise_completed', metadata);

      expect(event.metadata).toEqual(metadata);
    });
  });

  describe('Calcul du progrès de niveau', () => {
    it('calcule un progrès de 0% au début du niveau', () => {
      const progress = ScoreCalculator.getLevelProgress(0);
      expect(progress).toBe(0);
    });

    it('calcule un progrès de 50% au milieu du niveau', () => {
      const progress = ScoreCalculator.getLevelProgress(50);
      expect(progress).toBe(0.5);
    });

    it('calcule un progrès de 100% à la fin du niveau', () => {
      const progress = ScoreCalculator.getLevelProgress(100);
      expect(progress).toBe(1);
    });

    it('retourne 1 pour le niveau maximum', () => {
      const progress = ScoreCalculator.getLevelProgress(3000);
      expect(progress).toBe(1);
    });
  });

  describe('Utilitaires', () => {
    it('retourne tous les niveaux disponibles', () => {
      const levels = ScoreCalculator.getAllLevels();

      expect(levels).toHaveLength(7);
      expect(levels[0].level).toBe(1);
      expect(levels[6].level).toBe(7);
    });

    it("retourne les points pour chaque type d'événement", () => {
      expect(ScoreCalculator.getPointsForEvent('word_written')).toBe(1);
      expect(ScoreCalculator.getPointsForEvent('error_corrected')).toBe(5);
      expect(ScoreCalculator.getPointsForEvent('exercise_completed')).toBe(10);
      expect(ScoreCalculator.getPointsForEvent('perfect_text')).toBe(15);
      expect(ScoreCalculator.getPointsForEvent('achievement_unlocked')).toBe(25);
    });

    it("retourne 0 pour un type d'événement inconnu", () => {
      const points = ScoreCalculator.getPointsForEvent('unknown_type' as any);
      expect(points).toBe(0);
    });
  });

  describe('Validation des événements', () => {
    it('valide un événement correct', () => {
      const validEvent: Partial<ScoreEvent> = {
        type: 'word_written',
        points: 1,
        timestamp: new Date(),
      };

      expect(ScoreCalculator.isValidEvent(validEvent)).toBe(true);
    });

    it('rejette un événement sans type', () => {
      const invalidEvent: Partial<ScoreEvent> = {
        points: 1,
        timestamp: new Date(),
      };

      expect(ScoreCalculator.isValidEvent(invalidEvent)).toBe(false);
    });

    it('rejette un événement avec des points négatifs', () => {
      const invalidEvent: Partial<ScoreEvent> = {
        type: 'word_written',
        points: -1,
        timestamp: new Date(),
      };

      expect(ScoreCalculator.isValidEvent(invalidEvent)).toBe(false);
    });

    it('rejette un événement sans timestamp', () => {
      const invalidEvent: Partial<ScoreEvent> = {
        type: 'word_written',
        points: 1,
      };

      expect(ScoreCalculator.isValidEvent(invalidEvent)).toBe(false);
    });

    it('rejette un événement avec un timestamp invalide', () => {
      const invalidEvent: Partial<ScoreEvent> = {
        type: 'word_written',
        points: 1,
        timestamp: 'invalid' as any,
      };

      expect(ScoreCalculator.isValidEvent(invalidEvent)).toBe(false);
    });
  });

  describe('Cas limites et edge cases', () => {
    it('gère les événements avec des dates très anciennes', () => {
      const oldEvents: ScoreEvent[] = [
        {
          type: 'word_written',
          points: 1,
          timestamp: new Date('2020-01-01T00:00:00Z'),
        },
      ];

      const streak = ScoreCalculator.calculateStreakDays(oldEvents);
      expect(streak).toBe(0);
    });

    it('gère les événements avec des dates futures', () => {
      const futureEvents: ScoreEvent[] = [
        {
          type: 'word_written',
          points: 1,
          timestamp: new Date('2030-01-01T00:00:00Z'),
        },
      ];

      const streak = ScoreCalculator.calculateStreakDays(futureEvents);
      expect(streak).toBeGreaterThanOrEqual(0);
    });

    it('gère les événements avec des points très élevés', () => {
      const highScoreEvents: ScoreEvent[] = [
        {
          type: 'achievement_unlocked',
          points: 1000000,
          timestamp: new Date(),
        },
      ];

      const totalScore = ScoreCalculator.calculateTotalScore(highScoreEvents);
      expect(totalScore).toBe(1000000);
    });

    it('gère les métadonnées complexes', () => {
      const metadata = {
        exerciseId: 'test-123',
        difficulty: 'hard',
        timeSpent: 120,
        errors: ['grammar', 'spelling'],
        hints: ['first_letter', 'definition'],
      };

      const event = ScoreCalculator.createScoreEvent('exercise_completed', metadata);
      expect(event.metadata).toEqual(metadata);
    });
  });
});
