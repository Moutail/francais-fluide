// src/lib/api/endpoints.ts
import { apiRequest } from './client';
import type { UserProfile, GrammarError, TextAnalysis, Achievement, Mission } from '@/types';

/**
 * API Endpoints pour l'application FrançaisFluide
 */

// === AUTH ===
export const auth = {
  login: async (email: string, password: string) => {
    return apiRequest<{ token: string; user: UserProfile }>({
      method: 'POST',
      url: '/auth/login',
      data: { email, password },
    });
  },

  register: async (data: { email: string; password: string; name: string }) => {
    return apiRequest<{ token: string; user: UserProfile }>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
  },

  logout: async () => {
    return apiRequest({
      method: 'POST',
      url: '/auth/logout',
    });
  },

  refreshToken: async () => {
    return apiRequest<{ token: string }>({
      method: 'POST',
      url: '/auth/refresh',
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest({
      method: 'POST',
      url: '/auth/forgot-password',
      data: { email },
    });
  },
};

// === GRAMMAR ===
export const grammar = {
  check: async (
    text: string,
    options?: {
      language?: string;
      rules?: string[];
      context?: string;
    }
  ) => {
    return apiRequest<TextAnalysis>(
      {
        method: 'POST',
        url: '/grammar/check',
        data: { text, ...options },
      },
      {
        showLoading: true,
      }
    );
  },

  suggest: async (text: string, errorId: string) => {
    return apiRequest<{ suggestions: string[] }>({
      method: 'POST',
      url: '/grammar/suggest',
      data: { text, errorId },
    });
  },

  explain: async (errorId: string) => {
    return apiRequest<{
      rule: string;
      explanation: string;
      examples: string[];
    }>({
      method: 'GET',
      url: `/grammar/explain/${errorId}`,
    });
  },

  addCustomRule: async (rule: { pattern: string; message: string; category: string }) => {
    return apiRequest({
      method: 'POST',
      url: '/grammar/rules',
      data: rule,
    });
  },
};

// === USER ===
export const user = {
  getProfile: async () => {
    return apiRequest<UserProfile>({
      method: 'GET',
      url: '/user/profile',
    });
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    return apiRequest<UserProfile>({
      method: 'PATCH',
      url: '/user/profile',
      data: updates,
    });
  },

  getStatistics: async (period?: 'day' | 'week' | 'month' | 'all') => {
    return apiRequest<any>({
      method: 'GET',
      url: '/user/statistics',
      params: { period },
    });
  },

  updateSettings: async (settings: any) => {
    return apiRequest({
      method: 'PUT',
      url: '/user/settings',
      data: settings,
    });
  },

  deleteAccount: async (password: string) => {
    return apiRequest({
      method: 'DELETE',
      url: '/user/account',
      data: { password },
    });
  },
};

// === PROGRESS ===
export const progress = {
  getAchievements: async () => {
    return apiRequest<Achievement[]>({
      method: 'GET',
      url: '/progress/achievements',
    });
  },

  getMissions: async (type?: 'daily' | 'weekly' | 'special') => {
    return apiRequest<Mission[]>({
      method: 'GET',
      url: '/progress/missions',
      params: { type },
    });
  },

  completeMission: async (missionId: string) => {
    return apiRequest({
      method: 'POST',
      url: `/progress/missions/${missionId}/complete`,
    });
  },

  getLeaderboard: async (period: 'day' | 'week' | 'month' | 'all' = 'week') => {
    return apiRequest<
      Array<{
        userId: string;
        name: string;
        score: number;
        level: number;
        avatar?: string;
      }>
    >({
      method: 'GET',
      url: '/progress/leaderboard',
      params: { period },
    });
  },

  trackActivity: async (activity: { type: string; value: number; metadata?: any }) => {
    return apiRequest({
      method: 'POST',
      url: '/progress/activity',
      data: activity,
    });
  },
};

// === EXERCISES ===
export const exercises = {
  getList: async (filters?: { difficulty?: string; category?: string; limit?: number }) => {
    return apiRequest<
      Array<{
        id: string;
        title: string;
        description: string;
        difficulty: string;
        category: string;
        estimatedTime: number;
      }>
    >({
      method: 'GET',
      url: '/exercises',
      params: filters,
    });
  },

  getById: async (id: string) => {
    return apiRequest<{
      id: string;
      title: string;
      content: string;
      instructions: string;
      targetErrors?: string[];
    }>({
      method: 'GET',
      url: `/exercises/${id}`,
    });
  },

  submit: async (exerciseId: string, answer: string) => {
    return apiRequest<{
      score: number;
      feedback: string;
      corrections: GrammarError[];
      nextExercise?: string;
    }>({
      method: 'POST',
      url: `/exercises/${exerciseId}/submit`,
      data: { answer },
    });
  },

  generate: async (options: { difficulty: string; category: string; focusAreas?: string[] }) => {
    return apiRequest<{
      id: string;
      content: string;
      instructions: string;
    }>({
      method: 'POST',
      url: '/exercises/generate',
      data: options,
    });
  },
};

// === CONTENT ===
export const content = {
  getSavedTexts: async () => {
    return apiRequest<
      Array<{
        id: string;
        title: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        errorCount: number;
      }>
    >({
      method: 'GET',
      url: '/content/texts',
    });
  },

  saveText: async (text: { title: string; content: string; tags?: string[] }) => {
    return apiRequest<{ id: string }>({
      method: 'POST',
      url: '/content/texts',
      data: text,
    });
  },

  updateText: async (
    id: string,
    updates: {
      title?: string;
      content?: string;
      tags?: string[];
    }
  ) => {
    return apiRequest({
      method: 'PATCH',
      url: `/content/texts/${id}`,
      data: updates,
    });
  },

  deleteText: async (id: string) => {
    return apiRequest({
      method: 'DELETE',
      url: `/content/texts/${id}`,
    });
  },

  exportText: async (id: string, format: 'pdf' | 'docx' | 'txt') => {
    return apiRequest<{ url: string }>({
      method: 'GET',
      url: `/content/texts/${id}/export`,
      params: { format },
    });
  },
};

// === ANALYTICS ===
export const analytics = {
  track: async (event: { name: string; properties?: Record<string, any> }) => {
    // Fire and forget - pas besoin d'attendre la réponse
    apiRequest({
      method: 'POST',
      url: '/analytics/track',
      data: event,
    }).catch(() => {
      // Ignorer les erreurs d'analytics
    });
  },

  getInsights: async () => {
    return apiRequest<{
      strongPoints: string[];
      weakPoints: string[];
      recommendations: string[];
      progressTrend: number;
    }>({
      method: 'GET',
      url: '/analytics/insights',
    });
  },
};

// Export groupé pour faciliter l'import
export const api = {
  auth,
  grammar,
  user,
  progress,
  exercises,
  content,
  analytics,
};
