// Types de gamification complémentaires
export interface ExerciseAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'exercise';
  requirement: {
    type: string;
    value: number;
  };
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ExerciseStats {
  totalExercises: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  bestStreak: number;
  accuracyRate: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'writing' | 'accuracy' | 'streak' | 'speed' | 'special' | 'exercise';
  xp?: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  objectives: Array<{ id: string; description: string; target: number; current: number; completed: boolean }>;
  reward: { type: 'points' | 'badge' | 'theme' | 'feature'; value: number | string; description: string };
  expiresAt: Date;
  completedAt?: Date;
}
