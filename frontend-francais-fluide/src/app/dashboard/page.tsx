'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/hooks/useApi';
import { useSubscriptionSimple } from '@/hooks/useSubscriptionSimple';
import Navigation from '@/components/layout/Navigation';
import { SimpleAIAssistant } from '@/components/ai/SimpleAIAssistant';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { MetricCard } from '@/components/ui/professional/MetricCard';
import { ServerDiagnosticPanel } from '@/components/diagnostics/ServerDiagnosticPanel';
import {
  Edit3,
  BookOpen,
  BarChart3,
  FileText,
  Headphones,
  TrendingUp,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  Server,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { progress, error: progressError, refetch: refetchProgress } = useProgress();
  const { getStatus, isActive, canUseFeature } = useSubscriptionSimple();
  const [mounted, setMounted] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Données par défaut en cas d'erreur
  const defaultProgress = {
    wordsWritten: 0,
    accuracy: 0,
    exercisesCompleted: 0,
    currentStreak: 0,
  };

  // Le hook useApi extrait déjà response.data, donc progress contient directement les données
  const currentProgress = progress || defaultProgress;

  // Afficher les erreurs de progression dans la console seulement si c'est critique
  useEffect(() => {
    if (progressError && typeof progressError === 'string' && !progressError.includes('Token')) {
      console.error('Erreur critique de progression:', progressError);
    } else if (
      progressError &&
      typeof progressError === 'object' &&
      (progressError as any)?.message &&
      !(progressError as any)?.message.includes('Token')
    ) {
      console.error('Erreur critique de progression:', progressError);
    }
  }, [progressError]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rediriger les utilisateurs non connectés vers la page d'accueil
  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [mounted, authLoading, isAuthenticated]);

  if (!mounted || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navigation />

      {/* Dashboard Content */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Hero */}
          <Card className="mb-8 border-white/40 bg-white/70 shadow-sm backdrop-blur-sm">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="mb-1 text-2xl font-bold text-gray-900 md:text-3xl">
                    Bonjour {user?.name || 'Utilisateur'} 👋
                  </h1>
                  <p className="text-gray-600">
                    Heureux de vous revoir. Continuez votre progression aujourd'hui.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
              Tableau de bord
            </h1>
            <p className="mb-6 text-gray-600">
              Bonjour {user?.name || 'Utilisateur'}, voici un aperçu de votre progression.
            </p>

            {/* Plan d'abonnement */}
            <Card className="mb-8 border-white/40 bg-white/70 shadow-sm backdrop-blur-sm">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Plan: {getStatus().planName}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      {isActive() ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-600">
                        {isActive() ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="mb-2 text-sm text-gray-600">Fonctionnalités disponibles:</p>
                    <div className="flex flex-wrap gap-2">
                      {getStatus()
                        .features.slice(0, 3)
                        .map((feature: string, index: number) => (
                          <span
                            key={index}
                            className="rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                          >
                            {feature}
                          </span>
                        ))}
                      {getStatus().features.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{getStatus().features.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Principales */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card
              className="cursor-pointer border-white/40 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:shadow-md"
              onClick={() => (window.location.href = '/editor')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-200/60">
                    <Edit3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Éditeur de texte</h3>
                    <p className="text-sm text-gray-600">Corrigez vos textes avec l'IA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-white/40 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:shadow-md"
              onClick={() => (window.location.href = '/exercices')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 ring-1 ring-green-200/60">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Exercices</h3>
                    <p className="text-sm text-gray-600">Améliorez vos compétences</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-white/40 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:shadow-md"
              onClick={() => (window.location.href = '/progression')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 ring-1 ring-purple-200/60">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Progression</h3>
                    <p className="text-sm text-gray-600">Suivez vos performances</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métriques */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Mots écrits"
              value={currentProgress.wordsWritten}
              change={{ value: '+12% ce mois', type: 'positive' }}
              icon={FileText}
            />
            <MetricCard
              title="Précision"
              value={`${currentProgress.accuracy}%`}
              change={{ value: '+2.3% ce mois', type: 'positive' }}
              icon={TrendingUp}
            />
            <MetricCard
              title="Exercices"
              value={currentProgress.exercisesCompleted}
              change={{ value: '3 cette semaine', type: 'neutral' }}
              icon={BookOpen}
            />
            <MetricCard
              title="Série actuelle"
              value={`${currentProgress.currentStreak} jours`}
              change={{ value: 'Record: 15 jours', type: 'neutral' }}
              icon={Calendar}
            />
          </div>

          {/* Panneau de diagnostic (si erreur) */}
          {progressError && (
            <div className="mb-6">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-yellow-800">
                          Problème de connexion détecté
                        </h3>
                        <p className="text-sm text-yellow-700">
                          Impossible de charger les données de progression. Utilisation des données
                          par défaut.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => refetchProgress()} variant="secondary" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Réessayer
                      </Button>
                      <Button
                        onClick={() => setShowDiagnostics(!showDiagnostics)}
                        variant="ghost"
                        size="sm"
                      >
                        <Server className="mr-2 h-4 w-4" />
                        Diagnostic
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Panneau de diagnostic */}
          {showDiagnostics && (
            <div className="mb-6">
              <ServerDiagnosticPanel />
            </div>
          )}

          {/* Actions Rapides et Activités */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-white/40 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => (window.location.href = '/editor')}
                    variant="ghost"
                    className="h-auto w-full justify-start rounded-xl p-3"
                  >
                    <Edit3 className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Éditeur de texte</div>
                      <div className="text-sm text-gray-600">Corrigez vos textes avec l'IA</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => (window.location.href = '/exercices')}
                    variant="ghost"
                    className="h-auto w-full justify-start rounded-xl p-3"
                  >
                    <BookOpen className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Exercices</div>
                      <div className="text-sm text-gray-600">Pratiquez la grammaire</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => (window.location.href = '/dictation')}
                    variant="ghost"
                    className="h-auto w-full justify-start rounded-xl p-3"
                  >
                    <Headphones className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Dictées audio</div>
                      <div className="text-sm text-gray-600">Améliorez votre écoute</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => (window.location.href = '/analytics')}
                    variant="ghost"
                    className="h-auto w-full justify-start rounded-xl p-3"
                  >
                    <BarChart3 className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Analytics</div>
                      <div className="text-sm text-gray-600">Analysez vos performances</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/40 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Activités récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Aucune activité récente</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Assistant IA Widget */}
      <SimpleAIAssistant userPlan={user?.subscription?.plan || 'demo'} />
    </div>
  );
}
