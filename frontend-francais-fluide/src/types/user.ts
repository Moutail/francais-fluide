// src/types/user.ts
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  nativeLanguage?: string;
  weaknesses: string[];
  strengths: string[];
  preferences: {
    realTimeCorrection: boolean;
    soundEffects: boolean;
    animations: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  statistics: UserStatistics;
}

export interface UserStatistics {
  totalWords: number;
  totalErrors: number;
  totalCorrections: number;
  accuracyRate: number;
  dailyStreak: number;
  bestStreak: number;
  totalPracticeTime: number;
  lastPracticeDate: Date;
  progressByCategory: Record<string, number>;
}
