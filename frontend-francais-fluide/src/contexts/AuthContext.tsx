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
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

  // S'assurer que la session admin est présente si l'utilisateur a le rôle admin/super_admin
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      try {
        const session = {
          role: user.role,
          userId: user.id,
          loginTime: new Date().toISOString()
        };
        document.cookie = `adminSession=${encodeURIComponent(JSON.stringify(session))}; Max-Age=${8 * 60 * 60}; Path=/; SameSite=Lax`;
      } catch {
        // Ignore cookie errors
      }
    }
  }, [user?.id, user?.role]);

  const login = async (email: string, password: string) => {
    try {
      errorLogger.info('AUTH', 'Tentative de connexion', { email });
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        apiClient.setToken(response.token);
        setUser(response.user);

        // Créer une session admin (cookie) si l'utilisateur a les droits admin
        const role = response.user?.role;
        if (role && (role === 'admin' || role === 'super_admin')) {
          const session = {
            role,
            userId: response.user?.id,
            loginTime: new Date().toISOString()
          };
          // Cookie valable 8h
          document.cookie = `adminSession=${encodeURIComponent(JSON.stringify(session))}; Max-Age=${8 * 60 * 60}; Path=/; SameSite=Lax`;
        } else {
          // Nettoyer toute éventuelle session admin précédente
          document.cookie = `adminSession=; Max-Age=0; Path=/; SameSite=Lax`;
        }

        errorLogger.info('AUTH', 'Connexion réussie', { userId: response.user?.id });
        return { success: true };
      } else {
        errorLogger.warn('AUTH', 'Échec de connexion', { email });
        return { success: false, error: 'Erreur de connexion' };
      }
    } catch (error) {
      logAuthError('login_error', error, { email });
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      errorLogger.info('AUTH', 'Tentative d\'inscription', { email });
      const response = await apiClient.register({ name, email, password });

      if (response.success && (response as any).token) {
        const token = (response as any).token as string;
        localStorage.setItem('token', token);
        apiClient.setToken(token);
        setUser((response as any).user as any);

        // Nettoyer toute éventuelle session admin précédente (inscription = user standard)
        document.cookie = `adminSession=; Max-Age=0; Path=/; SameSite=Lax`;

        return { success: true };
      } else {
        return { success: false, error: 'Erreur d\'inscription' };
      }
    } catch (error) {
      logAuthError('register_error', error, { email });
      return { success: false, error: 'Erreur d\'inscription' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    apiClient.setToken('');
    setUser(null);
    // Supprimer la session admin
    document.cookie = `adminSession=; Max-Age=0; Path=/; SameSite=Lax`;
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
      register,
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
