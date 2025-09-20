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
  
  // src/types/gamification.ts
  export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'writing' | 'accuracy' | 'streak' | 'speed' | 'special';
    requirement: {
      type: string;
      value: number;
    };
    unlockedAt?: Date;
    progress: number;
    maxProgress: number;
  }
  
  export interface Mission {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'special';
    objectives: Objective[];
    reward: Reward;
    expiresAt: Date;
    completedAt?: Date;
  }
  
  export interface Objective {
    id: string;
    description: string;
    target: number;
    current: number;
    completed: boolean;
  }
  
  export interface Reward {
    type: 'points' | 'badge' | 'theme' | 'feature';
    value: number | string;
    description: string;
  }