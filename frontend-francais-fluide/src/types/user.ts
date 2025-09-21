// src/types/user.ts
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  nativeLanguage?: string;
  weaknesses: string[];
  strengths: string[];
  preferences: {
    realTimeCorrection: boolean;
    soundEffects: boolean;
    animations: boolean;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    exerciseTypes?: ('grammar' | 'vocabulary' | 'writing' | 'comprehension' | 'listening')[];
    notifications?: boolean;
  };
  statistics: UserStatistics;
}
  
export interface UserStatistics {
  // Legacy fields used in some pages
  totalExercises?: number;
  averageScore?: number;
  totalTimeSpent?: number;
  currentStreak?: number;
  bestStreak?: number;
  level?: number;

  // Newer, more granular metrics
  totalWords: number;
  totalErrors: number;
  totalCorrections: number;
  accuracyRate: number;
  dailyStreak: number;
  bestStreak: number;
  totalPracticeTime: number; // seconds
  lastPracticeDate: Date;
  progressByCategory: Record<string, number>;
  completedExercises: number;
  xp: number;
  nextLevelXp: number;
}
  