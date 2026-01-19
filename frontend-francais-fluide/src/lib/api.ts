// src/lib/api.ts
// Configuration de l'API pour communiquer avec le backend séparé

import { errorLogger, logApiError, logAuthError } from './errorLogger';

// Use internal Next.js API by default. Set NEXT_PUBLIC_API_URL to call external backend.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('auth_token')
        : null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Avoid double '/api' when baseURL is '/api' and endpoint is already prefixed with '/api'
    let normalizedEndpoint = endpoint;
    if (this.baseURL.endsWith('/api') && normalizedEndpoint.startsWith('/api/')) {
      normalizedEndpoint = normalizedEndpoint.slice('/api'.length);
    }

    const baseHasTrailingSlash = this.baseURL.endsWith('/');
    const endpointHasLeadingSlash = normalizedEndpoint.startsWith('/');

    const url = baseHasTrailingSlash && endpointHasLeadingSlash
      ? `${this.baseURL.slice(0, -1)}${normalizedEndpoint}`
      : !baseHasTrailingSlash && !endpointHasLeadingSlash
        ? `${this.baseURL}/${normalizedEndpoint}`
        : `${this.baseURL}${normalizedEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: headers as HeadersInit,
    };

    try {
      const response = await fetch(url, config);

      // Gestion des erreurs d'authentification
      if (response.status === 401) {
        // Token expiré ou invalide
        logAuthError('token_expired', new Error('Token expiré'), { url, status: 401 });
        this.clearToken();
        // Ne pas rediriger automatiquement, laisser l'utilisateur continuer
        console.warn('Token expiré, reconnexion nécessaire');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (response.status === 403) {
        logApiError(url, new Error('Accès refusé'), { status: 403 });
        throw new Error('Accès refusé. Vérifiez vos permissions.');
      }

      if (response.status === 429) {
        logApiError(url, new Error('Trop de requêtes'), { status: 429 });
        throw new Error(
          'Trop de tentatives de connexion. Veuillez attendre quelques minutes avant de réessayer.'
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
        logApiError(url, new Error(errorMessage), {
          status: response.status,
          errorData,
          config: { method: config.method, headers: config.headers },
        });
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Logger l'erreur avec plus de détails
      logApiError(url, error, {
        config: { method: config.method, headers: config.headers },
        body: config.body,
      });
      throw error;
    }
  }

  // Méthode publique pour les requêtes génériques
  async makeRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, options);
  }

  // Authentification
  async register(data: { name: string; email: string; password: string }) {
    return this.request<{
      success: boolean;
      user: { id: string; email: string; name: string };
      token: string;
      error?: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    // Login should not throw on 401; return structured errors for the UI.
    const endpoint = '/api/auth/login';
    let normalizedEndpoint = endpoint;
    if (this.baseURL.endsWith('/api') && normalizedEndpoint.startsWith('/api/')) {
      normalizedEndpoint = normalizedEndpoint.slice('/api'.length);
    }

    const baseHasTrailingSlash = this.baseURL.endsWith('/');
    const endpointHasLeadingSlash = normalizedEndpoint.startsWith('/');

    const url = baseHasTrailingSlash && endpointHasLeadingSlash
      ? `${this.baseURL.slice(0, -1)}${normalizedEndpoint}`
      : !baseHasTrailingSlash && !endpointHasLeadingSlash
        ? `${this.baseURL}/${normalizedEndpoint}`
        : `${this.baseURL}${normalizedEndpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      success?: boolean;
      user?: any;
      token?: string;
      error?: string;
      code?: string;
    };

    if (!response.ok) {
      return {
        success: false,
        user: null,
        token: '',
        error: payload.error || `HTTP ${response.status}`,
        code: payload.code,
      };
    }

    if (payload.success && payload.token) {
      this.setToken(payload.token);
    }

    return payload as {
      success: boolean;
      user: any;
      token: string;
      error?: string;
      code?: string;
    };
  }

  // Profil utilisateur
  async updateProfile(data: any) {
    return this.request<{
      success: boolean;
      user: any;
      error?: string;
    }>(`/api/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request<{
      success: boolean;
      error?: string;
    }>(`/api/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request<{
      success: boolean;
      user: any;
    }>('/api/auth/me');
  }

  async refreshToken() {
    const response = await this.request<{
      success: boolean;
      token: string;
    }>('/api/auth/refresh', {
      method: 'POST',
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  // Grammaire
  async analyzeText(data: {
    text: string;
    action?: 'analyze' | 'correct';
    corrections?: any[];
    useLanguageTool?: boolean;
    maxErrors?: number;
  }) {
    return this.request<{
      success: boolean;
      data: {
        analysis: any;
        metrics: any;
      };
      error?: string;
    }>('/api/grammar/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGrammarInfo() {
    return this.request<{
      success: boolean;
      data: any;
    }>('/api/grammar/info');
  }

  // Progression
  async getProgress() {
    return this.request<{
      success: boolean;
      data: any;
    }>('/api/progress');
  }

  async updateProgress(data: {
    wordsWritten?: number;
    accuracy?: number;
    timeSpent?: number;
    exercisesCompleted?: number;
    currentStreak?: number;
    level?: number;
    xp?: number;
  }) {
    return this.request<{
      success: boolean;
      data: any;
      error?: string;
    }>('/api/progress', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // IA Chat
  async sendChatMessage(data: { message: string; context?: string; conversationId?: string }) {
    return this.request<{
      success: boolean;
      data: {
        response: string;
        conversationId: string;
        context: any;
      };
    }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversations(page = 1, limit = 20) {
    return this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ai/conversations?page=${page}&limit=${limit}`);
  }

  async getConversation(id: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/api/ai/conversations/${id}`);
  }

  async deleteConversation(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/ai/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // Abonnements
  async getSubscriptionPlans() {
    return this.request<{
      success: boolean;
      data: any[];
    }>('/api/subscription/plans');
  }

  async getCurrentSubscription() {
    return this.request<{
      success: boolean;
      data: any;
    }>('/api/subscription/current');
  }

  async subscribe(data: { plan: string; paymentMethodId?: string }) {
    return this.request<{
      success: boolean;
      data: {
        subscription: any;
        paymentIntent: any;
      };
    }>('/api/subscription/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmSubscription(data: { paymentIntentId: string }) {
    return this.request<{
      success: boolean;
      data: any;
    }>('/api/subscription/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Exercices
  async getExercises(
    params: {
      level?: number;
      type?: string;
      limit?: number;
    } = {}
  ) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{
      success: boolean;
      data: any[];
    }>(`/api/exercises?${searchParams.toString()}`);
  }

  async getExercise(id: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/api/exercises/${id}`);
  }

  async submitExercise(
    id: string,
    data: {
      answers: any[];
      timeSpent?: number;
    }
  ) {
    return this.request<{
      success: boolean;
      data: {
        submission: any;
        results: any[];
        score: number;
        correctAnswers: number;
        totalQuestions: number;
      };
    }>(`/api/exercises/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExerciseProgress() {
    return this.request<{
      success: boolean;
      data: {
        submissions: any[];
        statistics: any;
      };
    }>('/api/exercises/user/progress');
  }

  // Health check
  async healthCheck() {
    return this.request<{
      status: string;
      timestamp: string;
      version: string;
      environment: string;
      uptime: number;
    }>('/health');
  }
}

// Instance singleton
export const apiClient = new ApiClient(API_BASE_URL || '/api');

// Export des types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  progress?: any;
  subscription?: any;
};

export type TextAnalysis = {
  text: string;
  errors: Array<{
    position: number;
    length: number;
    message: string;
    suggestion: string;
    type: string;
    confidence: number;
  }>;
  suggestions: string[];
  confidence: number;
};

export type Exercise = {
  id: string;
  title: string;
  description?: string;
  type: string;
  level: number;
  difficulty: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    order: number;
  }>;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  limits: {
    corrections: number;
    exercises: number;
    aiChat: number;
    users?: number;
  };
};
