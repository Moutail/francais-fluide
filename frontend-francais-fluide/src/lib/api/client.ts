// src/lib/api/client.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// Configuration de base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = 30000; // 30 secondes

// Types d'erreur personnalisés
export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Intercepteur de requêtes pour ajouter le token
const requestInterceptor = (config: AxiosRequestConfig): any => {
  // Récupérer le token depuis le localStorage ou les cookies
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Ajouter des headers personnalisés
  if (config.headers) {
    config.headers['X-Client-Version'] = '1.0.0';
    config.headers['X-Request-ID'] = generateRequestId();
  }
  
  return config;
};

// Intercepteur de réponses pour gérer les erreurs
const responseInterceptor = (error: AxiosError): Promise<never> => {
  if (error.response) {
    const { status, data } = error.response as any;
    
    // Gestion des erreurs selon le statut
    switch (status) {
      case 401:
        // Token expiré ou invalide
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        toast.error('Session expirée. Veuillez vous reconnecter.');
        break;
      
      case 403:
        toast.error('Accès non autorisé');
        break;
      
      case 404:
        toast.error('Ressource non trouvée');
        break;
      
      case 429:
        toast.error('Trop de requêtes. Veuillez réessayer plus tard.');
        break;
      
      case 500:
      case 502:
      case 503:
        toast.error('Erreur serveur. Veuillez réessayer.');
        break;
      
      default:
        toast.error(data?.message || 'Une erreur est survenue');
    }
    
    throw new APIError(
      status,
      data?.code || 'UNKNOWN_ERROR',
      data?.message || 'Une erreur est survenue',
      data?.details
    );
  } else if (error.request) {
    // La requête a été faite mais pas de réponse
    toast.error('Impossible de contacter le serveur');
    throw new APIError(0, 'NETWORK_ERROR', 'Erreur réseau');
  }
  
  // Erreur lors de la configuration de la requête
  throw new APIError(0, 'REQUEST_ERROR', error.message);
};

// Création de l'instance Axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Application des intercepteurs
apiClient.interceptors.request.use(requestInterceptor as any);
apiClient.interceptors.response.use(
  (response) => response,
  responseInterceptor
);

// Fonction utilitaire pour générer un ID de requête
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Wrapper pour les requêtes avec retry automatique
export async function apiRequest<T>(
  config: AxiosRequestConfig,
  options?: {
    retries?: number;
    retryDelay?: number;
    showLoading?: boolean;
    showError?: boolean;
  }
): Promise<T> {
  const {
    retries = 2,
    retryDelay = 1000,
    showLoading = false,
    showError = true,
  } = options || {};

  let lastError: any;
  
  if (showLoading) {
    toast.loading('Chargement...');
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await apiClient.request<T>(config);
      
      if (showLoading) {
        toast.dismiss();
      }
      
      return response.data;
    } catch (error) {
      lastError = error;
      
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
      }
    }
  }

  if (showLoading) {
    toast.dismiss();
  }

  if (showError && lastError) {
    // L'erreur est déjà gérée dans l'intercepteur
  }

  throw lastError;
}