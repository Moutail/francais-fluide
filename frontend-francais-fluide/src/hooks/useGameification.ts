// src/hooks/useGameification.ts
import { useState, useCallback, useEffect } from 'react';
import type { Achievement, Mission } from '@/types/gamification';

export function useGameification() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);

  // Calculer les points pour une action
  const calculatePoints = useCallback((action: string, value?: number) => {
    const pointsMap: Record<string, number> = {
      word_written: 1,
      error_corrected: 5,
      perfect_sentence: 10,
      daily_login: 20,
      mission_completed: 50,
      achievement_unlocked: 100,
    };

    return pointsMap[action] || 0;
  }, []);

  // Ajouter des points et gérer le niveau
  const addPoints = useCallback(
    (amount: number) => {
      setPoints(prev => {
        const newPoints = prev + amount;

        // Calculer le nouveau niveau (100 points par niveau)
        const newLevel = Math.floor(newPoints / 100) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          // Déclencher une animation de level up
          console.log('Level up!', newLevel);
        }

        return newPoints;
      });

      setExperience(prev => prev + amount);
    },
    [level]
  );

  // Vérifier et débloquer les achievements
  const checkAchievements = useCallback((stats: any) => {
    setAchievements(prev => {
      return prev.map(achievement => {
        // Logique de vérification selon le type
        if (
          achievement.requirement.type === 'words_written' &&
          stats.totalWords >= achievement.requirement.value &&
          !achievement.unlockedAt
        ) {
          return {
            ...achievement,
            unlockedAt: new Date(),
            progress: achievement.requirement.value,
            maxProgress: achievement.requirement.value,
          };
        }

        return achievement;
      });
    });
  }, []);

  // Compléter un objectif de mission
  const completeObjective = useCallback(
    (missionId: string, objectiveId: string) => {
      setMissions(prev => {
        return prev.map(mission => {
          if (mission.id !== missionId) return mission;

          const updatedObjectives = mission.objectives.map(obj => {
            if (obj.id === objectiveId) {
              return { ...obj, completed: true, current: obj.target };
            }
            return obj;
          });

          // Vérifier si toute la mission est complète
          const allCompleted = updatedObjectives.every(obj => obj.completed);

          if (allCompleted && !mission.completedAt) {
            addPoints(calculatePoints('mission_completed'));
            return {
              ...mission,
              objectives: updatedObjectives,
              completedAt: new Date(),
            };
          }

          return { ...mission, objectives: updatedObjectives };
        });
      });
    },
    [addPoints, calculatePoints]
  );

  return {
    achievements,
    missions,
    points,
    level,
    experience,
    addPoints,
    checkAchievements,
    completeObjective,
    calculatePoints,
  };
}
