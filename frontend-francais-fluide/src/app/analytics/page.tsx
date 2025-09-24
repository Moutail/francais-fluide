'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useApi';
import { useSubscriptionSimple } from '@/hooks/useSubscriptionSimple';
import Navigation from '@/components/layout/Navigation';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Clock,
  BookOpen,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalWords: number;
    totalTime: number;
    accuracyRate: number;
    exercisesCompleted: number;
    currentStreak: number;
    level: number;
    xp: number;
  };
  weeklyProgress: Array<{
    date: string;
    words: number;
    accuracy: number;
    time: number;
    exercises: number;
  }>;
  skillBreakdown: Array<{
    skill: string;
    accuracy: number;
    attempts: number;
    improvement: number;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: string;
    icon: string;
  }>;
  goals: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    deadline: string;
    status: 'active' | 'completed' | 'overdue';
  }>;
}

export default function AnalyticsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const { getStatus, canUseFeature } = useSubscriptionSimple();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedView, setSelectedView] = useState<'overview' | 'progress' | 'skills' | 'achievements'>('overview');

  // Rediriger les utilisateurs non connectés
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  // Charger les données d'analytics
  useEffect(() => {
    if (isAuthenticated) {
      loadAnalyticsData();
    }
  }, [isAuthenticated, selectedPeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulation de chargement de données
      // Dans une vraie app, ceci ferait un appel API
      const mockData: AnalyticsData = {
        overview: {
          totalWords: 15420,
          totalTime: 2840, // minutes
          accuracyRate: 87.5,
          exercisesCompleted: 156,
          currentStreak: 12,
          level: 8,
          xp: 2340
        },
        weeklyProgress: [
          { date: '2024-01-15', words: 1200, accuracy: 85, time: 45, exercises: 8 },
          { date: '2024-01-16', words: 980, accuracy: 88, time: 38, exercises: 6 },
          { date: '2024-01-17', words: 1450, accuracy: 90, time: 52, exercises: 10 },
          { date: '2024-01-18', words: 1100, accuracy: 86, time: 41, exercises: 7 },
          { date: '2024-01-19', words: 1300, accuracy: 89, time: 48, exercises: 9 },
          { date: '2024-01-20', words: 800, accuracy: 84, time: 32, exercises: 5 },
          { date: '2024-01-21', words: 1600, accuracy: 92, time: 58, exercises: 12 }
        ],
        skillBreakdown: [
          { skill: 'Grammaire', accuracy: 89, attempts: 45, improvement: 12 },
          { skill: 'Vocabulaire', accuracy: 85, attempts: 38, improvement: 8 },
          { skill: 'Conjugaison', accuracy: 92, attempts: 42, improvement: 15 },
          { skill: 'Orthographe', accuracy: 88, attempts: 31, improvement: 6 }
        ],
        achievements: [
          {
            id: 'streak-7',
            name: 'Série de 7 jours',
            description: 'Pratiquez 7 jours consécutifs',
            earnedAt: '2024-01-21',
            icon: '🔥'
          },
          {
            id: 'words-10k',
            name: '10 000 mots',
            description: 'Écrivez 10 000 mots au total',
            earnedAt: '2024-01-18',
            icon: '📝'
          },
          {
            id: 'accuracy-90',
            name: 'Précision 90%',
            description: 'Atteignez 90% de précision',
            earnedAt: '2024-01-15',
            icon: '🎯'
          }
        ],
        goals: [
          {
            id: 'words-monthly',
            title: '15 000 mots ce mois',
            target: 15000,
            current: 12400,
            deadline: '2024-01-31',
            status: 'active'
          },
          {
            id: 'accuracy-goal',
            title: 'Précision 90%',
            target: 90,
            current: 87.5,
            deadline: '2024-02-15',
            status: 'active'
          },
          {
            id: 'streak-goal',
            title: 'Série de 30 jours',
            target: 30,
            current: 12,
            deadline: '2024-02-10',
            status: 'active'
          }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a accès aux analytics avancées
  if (!canUseFeature('advancedAnalytics')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Avancées</h1>
            <p className="text-gray-600 mb-6">
              Cette fonctionnalité est disponible avec un abonnement Premium ou supérieur.
            </p>
            <a
              href="/subscription"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              Voir les plans d'abonnement
            </a>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'year': return 'Cette année';
      default: return 'Cette semaine';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Analysez vos progrès et performances</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sélecteur de période */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['week', 'month', 'year'] as const).map(period => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation des vues */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'progress', label: 'Progression', icon: TrendingUp },
              { id: 'skills', label: 'Compétences', icon: Target },
              { id: 'achievements', label: 'Succès', icon: Award }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === view.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <view.icon className="w-4 h-4" />
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          </div>
        ) : analyticsData ? (
          <div className="space-y-8">
            {/* Vue d'ensemble */}
            {selectedView === 'overview' && (
              <div>
                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Mots écrits</p>
                        <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.totalWords.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Temps total</p>
                        <p className="text-3xl font-bold text-gray-900">{formatTime(analyticsData.overview.totalTime)}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Précision</p>
                        <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.accuracyRate}%</p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Target className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Exercices</p>
                        <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.exercisesCompleted}</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Graphique de progression */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression {getPeriodLabel()}</h3>
                  <AnalyticsDashboard data={analyticsData.weeklyProgress} />
                </div>
              </div>
            )}

            {/* Vue Progression */}
            {selectedView === 'progress' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectifs</h3>
                  <div className="space-y-4">
                    {analyticsData.goals.map(goal => (
                      <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{goal.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                            goal.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {goal.status === 'completed' ? 'Terminé' :
                             goal.status === 'overdue' ? 'En retard' : 'En cours'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {goal.current} / {goal.target}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Échéance: {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Vue Compétences */}
            {selectedView === 'skills' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des compétences</h3>
                <div className="space-y-4">
                  {analyticsData.skillBreakdown.map(skill => (
                    <div key={skill.skill} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{skill.skill}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{skill.accuracy}% précision</span>
                          <span>{skill.attempts} tentatives</span>
                          <span className="text-green-600">+{skill.improvement}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${skill.accuracy}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{skill.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vue Succès */}
            {selectedView === 'achievements' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Succès obtenus</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.achievements.map(achievement => (
                    <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <p className="text-xs text-gray-500">
                        Obtenu le {new Date(achievement.earnedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée disponible</h3>
            <p className="text-gray-600">Commencez à utiliser l'application pour voir vos analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
}