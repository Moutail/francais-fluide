// src/types/gamification.ts
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'writing' | 'accuracy' | 'streak' | 'speed' | 'special' | 'exercise';
  requirement: {
    type: string;
    value: number;
  };
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
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

