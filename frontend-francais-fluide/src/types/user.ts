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
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      exerciseTypes?: Array<'grammar' | 'vocabulary' | 'writing' | 'comprehension' | 'listening'>;
    };
    statistics: UserStatistics;
  }
  
  export interface UserStatistics {
    totalExercises: number;
    averageScore: number;
    totalTimeSpent: number;
    currentStreak: number;
    bestStreak: number;
    accuracyRate: number;
    level: number;
    xp: number;
    nextLevelXp: number;
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