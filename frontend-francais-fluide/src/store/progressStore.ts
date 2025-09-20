// src/store/progressStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Achievement, Mission } from '@/types/gamification';

interface ProgressState {
  // Points et niveaux
  experience: number;
  level: number;
  points: number;
  
  // Séquences
  dailyStreak: number;
  bestStreak: number;
  lastPracticeDate: Date | null;
  
  // Achievements et missions
  achievements: Achievement[];
  unlockedAchievements: string[];
  missions: Mission[];
  completedMissions: string[];
  
  // Statistiques détaillées
  statistics: {
    totalWords: number;
    totalSentences: number;
    totalParagraphs: number;
    perfectSentences: number;
    averageAccuracy: number;
    timeSpent: number;
    favoriteTimeOfDay: string;
    strongestCategory: string;
    weakestCategory: string;
    improvementRate: number;
  };
  
  // Historique
  history: DailyProgress[];

  // Actions
  addExperience: (amount: number) => void;
  unlockAchievement: (achievementId: string) => void;
  completeMission: (missionId: string) => void;
  updateStreak: () => void;
  addDailyProgress: (progress: DailyProgress) => void;
  updateStatistics: (stats: Partial<ProgressState['statistics']>) => void;
}

interface DailyProgress {
  date: Date;
  wordsWritten: number;
  errorsFixed: number;
  accuracy: number;
  timeSpent: number;
  exercisesCompleted: number;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    immer((set, get) => ({
      experience: 0,
      level: 1,
      points: 0,
      dailyStreak: 0,
      bestStreak: 0,
      lastPracticeDate: null,
      achievements: [],
      unlockedAchievements: [],
      missions: [],
      completedMissions: [],
      statistics: {
        totalWords: 0,
        totalSentences: 0,
        totalParagraphs: 0,
        perfectSentences: 0,
        averageAccuracy: 100,
        timeSpent: 0,
        favoriteTimeOfDay: 'matin',
        strongestCategory: 'orthographe',
        weakestCategory: 'accord',
        improvementRate: 0,
      },
      history: [],

      addExperience: (amount) =>
        set((state) => {
          state.experience += amount;
          state.points += amount;
          
          // Calcul du niveau (100 XP par niveau avec courbe progressive)
          const requiredXP = state.level * 100 * (1 + state.level * 0.1);
          if (state.experience >= requiredXP) {
            state.level++;
            // Bonus de points pour level up
            state.points += 50 * state.level;
          }
        }),

      unlockAchievement: (achievementId) =>
        set((state) => {
          if (!state.unlockedAchievements.includes(achievementId)) {
            state.unlockedAchievements.push(achievementId);
            // Bonus de points pour achievement
            state.points += 100;
            state.experience += 50;
          }
        }),

      completeMission: (missionId) =>
        set((state) => {
          if (!state.completedMissions.includes(missionId)) {
            state.completedMissions.push(missionId);
            const mission = state.missions.find(m => m.id === missionId);
            if (mission) {
              // Appliquer les récompenses
              if (mission.reward.type === 'points') {
                state.points += mission.reward.value as number;
                state.experience += (mission.reward.value as number) / 2;
              }
            }
          }
        }),

      updateStreak: () =>
        set((state) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (state.lastPracticeDate) {
            const lastPractice = new Date(state.lastPracticeDate);
            lastPractice.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.floor(
              (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (daysDiff === 0) {
              // Déjà pratiqué aujourd'hui
              return;
            } else if (daysDiff === 1) {
              // Pratiqué hier, continuer la séquence
              state.dailyStreak++;
              if (state.dailyStreak > state.bestStreak) {
                state.bestStreak = state.dailyStreak;
              }
              // Bonus pour la séquence
              state.points += 10 * Math.min(state.dailyStreak, 30);
            } else {
              // Séquence brisée
              state.dailyStreak = 1;
            }
          } else {
            // Première pratique
            state.dailyStreak = 1;
          }
          
          state.lastPracticeDate = today;
        }),

      addDailyProgress: (progress) =>
        set((state) => {
          state.history.push(progress);
          
          // Garder seulement les 30 derniers jours
          if (state.history.length > 30) {
            state.history = state.history.slice(-30);
          }
          
          // Mettre à jour les statistiques globales
          state.statistics.totalWords += progress.wordsWritten;
          state.statistics.timeSpent += progress.timeSpent;
          
          // Recalculer la moyenne de précision
          const totalAccuracy = state.history.reduce((sum, h) => sum + h.accuracy, 0);
          state.statistics.averageAccuracy = Math.round(totalAccuracy / state.history.length);
        }),

      updateStatistics: (stats) =>
        set((state) => {
          Object.assign(state.statistics, stats);
        }),
    })),
    {
      name: 'progress-storage',
      partialize: (state) => ({
        experience: state.experience,
        level: state.level,
        points: state.points,
        dailyStreak: state.dailyStreak,
        bestStreak: state.bestStreak,
        lastPracticeDate: state.lastPracticeDate,
        unlockedAchievements: state.unlockedAchievements,
        completedMissions: state.completedMissions,
        statistics: state.statistics,
        history: state.history.slice(-7), // Garder seulement 7 jours en storage
      }),
    }
  )
);