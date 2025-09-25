// src/hooks/useApi.ts
import { useState, useEffect } from 'react';
import { apiClient, type ApiResponse } from '@/lib/api';
import { errorLogger, logAuthError } from '@/lib/errorLogger';

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
        // S'assurer que l'apiClient utilise le token courant pour les requêtes
        apiClient.setToken(token);

        const response = await apiClient.getProfile();
        if (response.success) {
          setUser(response.user);
        } else {
          // Token invalide, le supprimer
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        logAuthError('init_auth', error, { token: !!token });
        console.error('Erreur initialisation auth:', error);
        // En cas d'erreur, supprimer le token et considérer comme non connecté
        localStorage.removeItem('token');
        setUser(null);
        
        // Ne pas rediriger automatiquement si c'est juste un problème de réseau
        if (error instanceof Error && !error.message.includes('Session expirée')) {
          console.warn('Problème de connexion réseau, réessayez plus tard');
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Supprimer la dépendance [user] pour éviter la boucle infinie

  // Vérifier périodiquement la validité du token (toutes les 30 minutes)
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token && user) {
        try {
          const response = await apiClient.getProfile();
          if (!response.success) {
            // Token expiré, déconnecter
            logAuthError('token_verification_failed', new Error('Token expiré lors de la vérification'), { userId: user.id });
            localStorage.removeItem('token');
            setUser(null);
            // Ne pas rediriger automatiquement, laisser l'utilisateur continuer
            console.warn('Token expiré, reconnexion nécessaire');
          }
        } catch (error) {
          // En cas d'erreur réseau, ne pas déconnecter
          console.warn('Vérification token échouée (réseau):', error);
        }
      }
    }, 30 * 60 * 1000); // 30 minutes au lieu de 10

    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      errorLogger.info('AUTH', 'Tentative de connexion', { email });
      const response = await apiClient.login({ email, password });
      
      errorLogger.debug('AUTH', 'Réponse API login', { 
        success: response.success, 
        hasUser: !!response.user,
        hasToken: !!response.token,
        error: response.error 
      });
      
      if (response.success) {
        setUser(response.user);
        errorLogger.info('AUTH', 'Connexion réussie', { 
          email, 
          userId: response.user?.id,
          userName: response.user?.name 
        });
        return { success: true };
      }
      
      logAuthError('login_failed', new Error(response.error || 'Erreur de connexion'), { 
        email, 
        response: {
          success: response.success,
          error: response.error,
          hasUser: !!response.user
        }
      });
      return { success: false, error: response.error };
    } catch (error) {
      logAuthError('login_error', error, { email });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      };
    }
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const response = await apiClient.getProfile();
      if (response.success) {
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Erreur refresh token:', error);
      return false;
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
    refreshToken,
    isAuthenticated: !!user,
  };
}

// Hook pour la progression avec gestion d'erreur améliorée
export function useProgress() {
  const { data: progress, loading, error, refetch } = useApi(
    () => apiClient.getProgress(),
    { 
      immediate: true,
      onError: (error) => {
        console.error('Erreur useProgress:', error);
        // Ne pas afficher l'erreur dans la console si c'est juste un problème de token
        if (error?.message?.includes('Token')) {
          console.warn('Token d\'authentification manquant ou invalide');
        }
      }
    }
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
      console.error('Erreur updateProgress:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de mise à jour' 
      };
    }
  };

  // Fonction pour forcer le rechargement avec gestion d'erreur
  const forceRefresh = async () => {
    try {
      await refetch();
      return { success: true };
    } catch (error) {
      console.error('Erreur forceRefresh:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de rechargement' 
      };
    }
  };

  return {
    progress,
    loading,
    error,
    updateProgress,
    refetch: forceRefresh,
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
