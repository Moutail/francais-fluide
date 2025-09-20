// Export de tous les types de l'application
export * from './user';
export * from './grammar';
export * from './gamification';
export * from './api';

// Types communs
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProgressMetrics {
  wordsWritten: number;
  errorsDetected: number;
  errorsCorrected: number;
  accuracyRate: number;
  streakCount: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les exercices
export type ExerciseType = 'grammar' | 'vocabulary' | 'writing' | 'comprehension' | 'listening';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  difficulty: Difficulty;
  category: string;
  instructions: string;
  content: ExerciseContent;
  expectedResult?: string;
  hints?: string[];
  timeLimit?: number; // en minutes
  points: number;
  isCompleted?: boolean;
  completedAt?: Date;
  score?: number;
}

export interface ExerciseContent {
  text?: string;
  questions?: Question[];
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'fill-in-the-blank' | 'true-false' | 'open-ended';
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
}

// Types pour la progression
export interface ProgressData {
  userId: string;
  exerciseId: string;
  score: number;
  timeSpent: number;
  completedAt: Date;
  errors: string[];
  improvements: string[];
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  exercises: string[]; // IDs des exercices
  estimatedDuration: number; // en heures
  prerequisites?: string[];
  isCompleted?: boolean;
  progress?: number; // 0-100
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'achievement' | 'reminder' | 'progress' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionText?: string;
}

// Types pour les paramètres
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    achievements: boolean;
    reminders: boolean;
  };
  editor: {
    fontSize: number;
    fontFamily: string;
    autoSave: boolean;
    realTimeCorrection: boolean;
  };
  gamification: {
    showAnimations: boolean;
    soundEffects: boolean;
    showProgress: boolean;
  };
}
