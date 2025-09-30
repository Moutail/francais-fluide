// src/app/auth/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertTriangle, CheckCircle, Bug } from 'lucide-react';
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
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');
  const isMounted = useIsMounted();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setRedirecting(true);
        setRedirectMessage('Connexion réussie ! Redirection en cours...');

        // Attendre que le contexte auth soit mis à jour
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Faire un appel direct à l'API pour récupérer le rôle
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const profileResponse = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              const userRole = profileData.user?.role;

              console.log('Rôle détecté:', userRole);

              // Redirection selon le rôle
              if (['admin', 'super_admin'].includes(userRole)) {
                setRedirectMessage("Redirection vers l'interface d'administration...");
                await new Promise(resolve => setTimeout(resolve, 500));
                window.location.href = '/admin';
                return;
              }
            }
          } catch (profileError) {
            console.error('Erreur récupération profil:', profileError);
          }
        }

        // Redirection par défaut vers dashboard
        setRedirectMessage('Redirection vers le tableau de bord...');
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = '/dashboard';
      } else {
        // Erreur de connexion
        const errorMessage = result.error || 'Erreur de connexion. Veuillez réessayer.';
        setError(errorMessage);
        setShowErrorNotification(true);
      }
    } catch (loginError) {
      console.error('Erreur lors de la connexion:', loginError);
      setError('Erreur de connexion. Veuillez réessayer.');
      setShowErrorNotification(true);
    } finally {
      setIsLoading(false);
      setRedirecting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError('');
      setShowErrorNotification(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-500 shadow-sm">
            <span className="text-2xl font-bold text-white">F</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-primary-900">Connexion</h1>
          <p className="text-gray-600">Connectez-vous à votre compte FrançaisFluide</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="jean@email.com"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Message de redirection */}
            {redirecting && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-sm text-blue-700">{redirectMessage}</p>
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
                className="font-medium text-accent-600 hover:text-accent-500"
              >
                Créer un compte
              </a>
            </p>
          </div>

          {/* Retour à l'accueil */}
          <div className="mt-4 text-center">
            <a
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </a>
          </div>

          {/* Boutons de debug (en mode développement) */}
          {isMounted && process.env.NODE_ENV === 'development' && (
            <div className="mt-4 space-y-2 text-center">
              <button
                onClick={() => setShowDebugPanel(true)}
                className="flex items-center justify-center gap-2 text-xs text-gray-500 transition-colors hover:text-gray-700"
              >
                <Bug className="h-4 w-4" />
                Voir les erreurs de debug
              </button>

              {getErrorCount() > 0 && (
                <button
                  onClick={showErrorLog}
                  className="flex items-center justify-center gap-2 text-xs text-red-600 transition-colors hover:text-red-700"
                >
                  <Bug className="h-4 w-4" />
                  Journal d'erreurs ({getErrorCount()})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Panneau de debug */}
      <ErrorDebugPanel isOpen={showDebugPanel} onClose={() => setShowDebugPanel(false)} />

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
