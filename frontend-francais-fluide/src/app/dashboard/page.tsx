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
  Server
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
    currentStreak: 0
  };

  // Le hook useApi extrait déjà response.data, donc progress contient directement les données
  const currentProgress = progress || defaultProgress;

  // Afficher les erreurs de progression dans la console seulement si c'est critique
  useEffect(() => {
    if (progressError && typeof progressError === 'string' && !progressError.includes('Token')) {
      console.error('Erreur critique de progression:', progressError);
    } else if (progressError && typeof progressError === 'object' && (progressError as any)?.message && !(progressError as any)?.message.includes('Token')) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Dashboard Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-gray-600 mb-6">
              Bonjour {user?.name || 'Utilisateur'}, voici un aperçu de votre progression.
            </p>

            {/* Plan d'abonnement */}
            <Card className="mb-8 backdrop-blur-sm bg-white/70 border-white/40 shadow-sm">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Plan: {getStatus().planName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {isActive() ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-600">
                        {isActive() ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">Fonctionnalités disponibles:</p>
                    <div className="flex flex-wrap gap-2">
                      {getStatus().features.slice(0, 3).map((feature: string, index: number) => (
                        <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200/60">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer backdrop-blur-sm bg-white/70 border-white/40" onClick={() => (window.location.href = '/editor')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center ring-1 ring-blue-200/60">
                    <Edit3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Éditeur de texte</h3>
                    <p className="text-gray-600 text-sm">Corrigez vos textes avec l'IA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer backdrop-blur-sm bg-white/70 border-white/40" onClick={() => (window.location.href = '/exercices')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center ring-1 ring-green-200/60">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Exercices</h3>
                    <p className="text-gray-600 text-sm">Améliorez vos compétences</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer backdrop-blur-sm bg-white/70 border-white/40" onClick={() => (window.location.href = '/progression')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center ring-1 ring-purple-200/60">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Progression</h3>
                    <p className="text-gray-600 text-sm">Suivez vos performances</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métriques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-yellow-800">Problème de connexion détecté</h3>
                        <p className="text-sm text-yellow-700">
                          Impossible de charger les données de progression. Utilisation des données par défaut.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => refetchProgress()} variant="secondary" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Réessayer
                      </Button>
                      <Button onClick={() => setShowDiagnostics(!showDiagnostics)} variant="ghost" size="sm">
                        <Server className="w-4 h-4 mr-2" />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-white/70 border-white/40">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => (window.location.href = '/editor')}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto rounded-xl"
                  >
                    <Edit3 className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Éditeur de texte</div>
                      <div className="text-sm text-gray-600">Corrigez vos textes avec l'IA</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => (window.location.href = '/exercices')}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto rounded-xl"
                  >
                    <BookOpen className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Exercices</div>
                      <div className="text-sm text-gray-600">Pratiquez la grammaire</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => (window.location.href = '/dictation')}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto rounded-xl"
                  >
                    <Headphones className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Dictées audio</div>
                      <div className="text-sm text-gray-600">Améliorez votre écoute</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => (window.location.href = '/analytics')}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto rounded-xl"
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Analytics</div>
                      <div className="text-sm text-gray-600">Analysez vos performances</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/70 border-white/40">
              <CardHeader>
                <CardTitle>Activités récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
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