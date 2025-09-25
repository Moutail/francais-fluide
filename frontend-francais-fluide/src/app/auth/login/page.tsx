// src/app/auth/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Bug
} from 'lucide-react';
import { Button } from '@/components/ui/professional/Button';
import ErrorDebugPanel from '@/components/debug/ErrorDebugPanel';
import ErrorNotification from '@/components/ui/ErrorNotification';
import { useErrorContext } from '@/components/ErrorProvider';
import RateLimitDebug from '@/components/debug/RateLimitDebug';
import TokenExpiredNotification from '@/components/TokenExpiredNotification';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function LoginPage() {
  const router = useRouter();
  const { login, refreshToken } = useAuth();
  const { showErrorLog, getErrorCount } = useErrorContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const isMounted = useIsMounted();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Connexion réussie - redirection vers le dashboard
      router.push('/dashboard');
    } else {
      // Erreur de connexion
      const errorMessage = result.error || 'Erreur de connexion. Veuillez réessayer.';
      setError(errorMessage);
      setShowErrorNotification(true);
    }
    
    setIsLoading(false);
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError('');
      setShowErrorNotification(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Connexion
          </h1>
          <p className="text-gray-600">
            Connectez-vous à votre compte FrançaisFluide
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="jean@email.com"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Bouton de connexion */}
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              size="lg"
              className="w-full gap-2"
              loading={isLoading}
            >
              Se connecter
            </Button>
          </form>

          {/* Lien d'inscription */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <a
                href="/auth/register"
                className="text-accent-600 hover:text-accent-500 font-medium"
              >
                Créer un compte
              </a>
            </p>
          </div>

          {/* Retour à l'accueil */}
          <div className="mt-4 text-center">
            <a
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </a>
          </div>

          {/* Boutons de debug (en mode développement) */}
          {isMounted && process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-center space-y-2">
              <button
                onClick={() => setShowDebugPanel(true)}
                className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Bug className="w-4 h-4" />
                Voir les erreurs de debug
              </button>
              
              {getErrorCount() > 0 && (
                <button
                  onClick={showErrorLog}
                  className="flex items-center justify-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors"
                >
                  <Bug className="w-4 h-4" />
                  Journal d'erreurs ({getErrorCount()})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Panneau de debug */}
      <ErrorDebugPanel 
        isOpen={showDebugPanel} 
        onClose={() => setShowDebugPanel(false)} 
      />

      {/* Notification d'erreur persistante */}
      {showErrorNotification && error && (
        <ErrorNotification
          error={error}
          onClose={() => setShowErrorNotification(false)}
          onShowDebug={() => setShowDebugPanel(true)}
          persistent={true}
        />
      )}

      {/* Debug Rate Limiting */}
      <RateLimitDebug />

      {/* Notification token expiré */}
      <TokenExpiredNotification
        onRefresh={refreshToken}
        onLogin={() => router.push('/auth/login')}
      />
    </div>
  );
}