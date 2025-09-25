// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { errorLogger, logAuthError } from '@/lib/errorLogger';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  isActive?: boolean;
  lastLogin?: string;
  progress?: any;
  subscription?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 AuthContext: Initialisation de l\'authentification');
      const token = localStorage.getItem('token');
      console.log('🔐 AuthContext: Token trouvé:', !!token);
      
      if (!token) {
        console.log('🔐 AuthContext: Aucun token, utilisateur non connecté');
        setLoading(false);
        return;
      }

      try {
        console.log('🔐 AuthContext: Tentative de récupération du profil');
        apiClient.setToken(token);
        const response = await apiClient.getProfile();
        console.log('🔐 AuthContext: Réponse profil:', response);
        
        if (response.success) {
          console.log('🔐 AuthContext: Utilisateur connecté:', response.user);
          setUser(response.user);
        } else {
          console.log('🔐 AuthContext: Token invalide, déconnexion');
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('🔐 AuthContext: Erreur lors de l\'init:', error);
        logAuthError('init_auth', error, { token: !!token });
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Vérification périodique du token
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token && user) {
        try {
          const response = await apiClient.getProfile();
          if (!response.success) {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.warn('Vérification token échouée:', error);
        }
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      errorLogger.info('AUTH', 'Tentative de connexion', { email });
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        apiClient.setToken(response.token);
        setUser(response.user);
        errorLogger.info('AUTH', 'Connexion réussie', { userId: response.user?.id });
        return { success: true };
      } else {
        errorLogger.warn('AUTH', 'Échec de connexion', { email, error: response.error });
        return { success: false, error: response.error || 'Erreur de connexion' };
      }
    } catch (error) {
      logAuthError('login_error', error, { email });
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    apiClient.setToken('');
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.refreshToken();
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        apiClient.setToken(response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur refresh token:', error);
      return false;
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await apiClient.updateProfile(data);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: 'Erreur de mise à jour' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await apiClient.changePassword({ currentPassword, newPassword });
      return { success: response.success, error: response.error };
    } catch (error) {
      return { success: false, error: 'Erreur de changement de mot de passe' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      refreshToken,
      updateProfile,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
