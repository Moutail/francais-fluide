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
    this.token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('auth_token')) : null;
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
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
        throw new Error('Trop de tentatives de connexion. Veuillez attendre quelques minutes avant de réessayer.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
        logApiError(url, new Error(errorMessage), { 
          status: response.status, 
          errorData,
          config: { method: config.method, headers: config.headers }
        });
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Logger l'erreur avec plus de détails
      logApiError(url, error, { 
        config: { method: config.method, headers: config.headers },
        body: config.body
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
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request<{
      success: boolean;
      user: any;
      token: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
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
    }>('/api/progress', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // IA Chat
  async sendChatMessage(data: {
    message: string;
    context?: string;
    conversationId?: string;
  }) {
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
  async getExercises(params: {
    level?: number;
    type?: string;
    limit?: number;
  } = {}) {
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

  async submitExercise(id: string, data: {
    answers: any[];
    timeSpent?: number;
  }) {
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
