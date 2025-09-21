// src/hooks/useAdminAuth.ts
import { useState, useEffect } from 'react';

interface AdminSession {
  email: string;
  loginTime: string;
  role: string;
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const adminSession = localStorage.getItem('adminSession');
        
        if (adminSession) {
          const sessionData = JSON.parse(adminSession);
          const loginTime = new Date(sessionData.loginTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          // Session expirée après 8 heures
          if (hoursDiff > 8) {
            localStorage.removeItem('adminSession');
            setIsAuthenticated(false);
            setSession(null);
          } else {
            setIsAuthenticated(true);
            setSession(sessionData);
          }
        } else {
          setIsAuthenticated(false);
          setSession(null);
        }
      } catch (error) {
        console.error('Erreur de vérification de session:', error);
        localStorage.removeItem('adminSession');
        setIsAuthenticated(false);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulation de l'authentification
      setTimeout(() => {
        if (email === 'admin@francais-fluide.com' && password === 'admin123') {
          const sessionData: AdminSession = {
            email,
            loginTime: new Date().toISOString(),
            role: 'admin'
          };
          
          localStorage.setItem('adminSession', JSON.stringify(sessionData));
          setIsAuthenticated(true);
          setSession(sessionData);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('adminSession');
    setIsAuthenticated(false);
    setSession(null);
  };

  return {
    isAuthenticated,
    isLoading,
    session,
    login,
    logout
  };
};
