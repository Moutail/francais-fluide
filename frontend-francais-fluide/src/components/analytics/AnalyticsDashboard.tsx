'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import ProgressChart from '@/components/charts/ProgressChart';
import ErrorDistribution from '@/components/charts/ErrorDistribution';
import ActivityHeatmap from '@/components/charts/ActivityHeatmap';
import ComparisonRadar from '@/components/charts/ComparisonRadar';
import { createAnalyticsCalculator, type AnalyticsData, type LearningPattern, type EngagementScore } from '@/lib/analytics/calculator';
import type { UserProfile, ExerciseResult, ProgressData } from '@/types';

interface AnalyticsDashboardProps {
  userProfile: UserProfile;
  exerciseResults: ExerciseResult[];
  progressData: ProgressData[];
  className?: string;
}

export default function AnalyticsDashboard({
  userProfile,
  exerciseResults,
  progressData,
  className = ''
}: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'errors' | 'activity' | 'comparison'>('overview');

  // Calculer les analytics
  useEffect(() => {
    const calculateAnalytics = () => {
      setLoading(true);
      
      try {
        const calculator = createAnalyticsCalculator(userProfile, exerciseResults, progressData);
        const analyticsData = calculator.calculateAllAnalytics();
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Erreur lors du calcul des analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateAnalytics();
  }, [userProfile, exerciseResults, progressData]);

  // Filtrer les données selon la période
  const getFilteredData = () => {
    if (!analytics) return null;

    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      ...analytics,
      exerciseResults: exerciseResults.filter(result => 
        new Date(result.completedAt) >= startDate
      )
    };
  };

  const filteredData = getFilteredData();

  // Générer les données de progression
  const generateProgressData = () => {
    if (!filteredData) return [];

    const progressMap = new Map<string, { score: number; accuracy: number; exercises: number }>();
    
    filteredData.exerciseResults.forEach(result => {
      const date = new Date(result.completedAt).toISOString().split('T')[0];
      const existing = progressMap.get(date) || { score: 0, accuracy: 0, exercises: 0 };
      
      progressMap.set(date, {
        score: existing.score + result.score,
        accuracy: existing.accuracy + result.accuracy,
        exercises: existing.exercises + 1
      });
    });

    return Array.from(progressMap.entries())
      .map(([date, data]) => ({
        date,
        score: Math.round(data.score / data.exercises),
        accuracy: Math.round((data.accuracy / data.exercises) * 100),
        exercises: data.exercises
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Générer les données de comparaison
  const generateComparisonData = () => {
    if (!analytics) return [];

    return [
      { subject: 'Grammaire', user: 85, average: 75, top: 95 },
      { subject: 'Vocabulaire', user: 78, average: 70, top: 90 },
      { subject: 'Conjugaison', user: 92, average: 80, top: 98 },
      { subject: 'Orthographe', user: 88, average: 82, top: 96 },
      { subject: 'Compréhension', user: 76, average: 72, top: 88 },
      { subject: 'Expression', user: 82, average: 78, top: 92 }
    ];
  };

  const chartProgressData = generateProgressData();
  const comparisonData = generateComparisonData();

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calcul des analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Analysez vos performances et progressez</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="quarter">3 derniers mois</option>
            <option value="year">12 derniers mois</option>
          </select>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
            { id: 'progress', label: 'Progression', icon: '📈' },
            { id: 'errors', label: 'Erreurs', icon: '❌' },
            { id: 'activity', label: 'Activité', icon: '📅' },
            { id: 'comparison', label: 'Comparaison', icon: '🎯' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Exercices</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalExercises}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Score Moyen</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.averageScore)}%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Série</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.currentStreak}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Précision</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.accuracyRate * 100)}%</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Score d'engagement */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Score d'Engagement</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(analytics.engagementScore).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{value}</div>
                    <div className="text-sm text-gray-600 capitalize">{key}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pattern d'apprentissage */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pattern d'Apprentissage</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={analytics.learningPattern.type === 'consistent' ? 'success' : 'default'}>
                    {analytics.learningPattern.type}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Confiance: {Math.round(analytics.learningPattern.confidence * 100)}%
                  </span>
                </div>
                <p className="text-gray-700">{analytics.learningPattern.description}</p>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommandations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {analytics.learningPattern.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProgressChart 
              data={chartProgressData} 
              type="area" 
              showAccuracy={true}
              showExercises={true}
            />
          </motion.div>
        )}

        {activeTab === 'errors' && (
          <motion.div
            key="errors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ErrorDistribution data={analytics.errorAnalysis} />
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail des Erreurs</h3>
              <div className="space-y-3">
                {analytics.errorAnalysis.map((error, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{error.category}</div>
                      <div className="text-sm text-gray-600">
                        {error.count} erreurs • {error.percentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={error.severity === 'high' ? 'destructive' : error.severity === 'medium' ? 'default' : 'secondary'}>
                        {error.severity}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {error.trend === 'increasing' ? '↗️' : error.trend === 'decreasing' ? '↘️' : '➡️'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ActivityHeatmap data={analytics.activityHeatmap} />
          </motion.div>
        )}

        {activeTab === 'comparison' && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <ComparisonRadar data={comparisonData} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vos Performances</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score moyen</span>
                    <span className="font-semibold">{analytics.comparison.user.score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rang</span>
                    <span className="font-semibold">#{analytics.comparison.user.rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Percentile</span>
                    <span className="font-semibold">{analytics.comparison.user.percentile}%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyenne Générale</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score moyen</span>
                    <span className="font-semibold">{analytics.comparison.average.score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tendance</span>
                    <span className={`font-semibold ${
                      analytics.comparison.average.trend === 'up' ? 'text-green-600' : 
                      analytics.comparison.average.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {analytics.comparison.average.trend === 'up' ? '↗️ En hausse' : 
                       analytics.comparison.average.trend === 'down' ? '↘️ En baisse' : '➡️ Stable'}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meilleurs Performers</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score moyen</span>
                    <span className="font-semibold">{analytics.comparison.topPerformers.score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Écart</span>
                    <span className="font-semibold text-orange-600">-{analytics.comparison.topPerformers.gap}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
