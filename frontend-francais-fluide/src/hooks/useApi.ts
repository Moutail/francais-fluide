// src/hooks/useApi.ts
import { useState, useEffect } from 'react';
import { apiClient, type ApiResponse } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (response.success) {
        setState({
          data: response.data || null,
          loading: false,
          error: null,
        });
        onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'Une erreur est survenue';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      onError?.(errorMessage);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

// Hook pour l'authentification
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Vérifier d'abord s'il y a un token
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.getProfile();
        if (response.success) {
          setUser(response.user);
        } else {
          // Token invalide, le supprimer
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
        // En cas d'erreur, supprimer le token et considérer comme non connecté
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.register({ name, email, password });
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur d\'inscription' 
      };
    }
  };

  const logout = () => {
    apiClient.clearToken();
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}

// Hook pour la progression
export function useProgress() {
  const { data: progress, loading, error, refetch } = useApi(
    () => apiClient.getProgress(),
    { immediate: true }
  );

  const updateProgress = async (data: any) => {
    try {
      const response = await apiClient.updateProgress(data);
      if (response.success) {
        refetch();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de mise à jour' 
      };
    }
  };

  return {
    progress,
    loading,
    error,
    updateProgress,
    refetch,
  };
}

// Hook pour les exercices
export function useExercises(params: any = {}) {
  const { data: exercises, loading, error, refetch } = useApi(
    () => apiClient.getExercises(params),
    { immediate: true }
  );

  return {
    exercises,
    loading,
    error,
    refetch,
  };
}

// Hook pour l'analyse grammaticale
export function useGrammarAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeText = async (text: string, options: any = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.analyzeText({
        text,
        ...options,
      });

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Erreur d\'analyse');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'analyse';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeText,
    loading,
    error,
  };
}
