// Export de tous les types de l'application
export * from './user';
export * from './grammar';
export * from './gamification';
export * from './api';
export * from './persistence';

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
  estimatedTime?: number; // en minutes
  content: ExerciseContent;
  scoring?: ExerciseScoring;
  tags?: string[];
  category?: string;
  // Champs utilisés dans le code
  instructions?: string;
  points?: number;
  timeLimit?: number;
  isCompleted?: boolean;
  completedAt?: Date;
  score?: number;
}

export interface ExerciseContent {
  text?: string;
  instructions?: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
  questions?: Question[];
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-in-the-blank' | 'correction' | 'true-false' | 'open-ended';
  text: string;
  correctAnswer: string;
  options?: string[];
  explanation?: string;
}

export interface ExerciseScoring {
  maxPoints: number;
  timeBonus: number;
  accuracyWeight: number;
}

export interface ExerciseAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface ExerciseResult {
  exerciseId: string;
  score: number;
  maxScore: number;
  timeSpent: number; // en secondes
  answers: ExerciseAnswer[];
  completedAt: string;
  accuracy: number;
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
