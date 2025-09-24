// components/analytics/ErrorAnalytics.tsx - Composant pour analyser les erreurs
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  Target,
  BarChart3,
  Brain,
  Zap
} from 'lucide-react';
import { useTelemetry } from '@/lib/telemetry';

interface ErrorPattern {
  type: string;
  data: any;
  count: number;
}

interface AnalyticsData {
  errorPatterns: Record<string, ErrorPattern>;
  averageResponseTimes: Record<string, { total: number; count: number; average: number }>;
  totalEvents: number;
  period: string;
}

export default function ErrorAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const telemetry = useTelemetry();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentification requise');
        return;
      }

      const response = await fetch('/api/telemetry', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des analytics');
      }

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.message || 'Erreur inconnue');
      }
    } catch (err) {
      console.error('Erreur chargement analytics:', err);
      setError('Impossible de charger les données d\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const getErrorTypeIcon = (type: string) => {
    switch (type) {
      case 'answer_selected': return Target;
      case 'answer_changed': return TrendingDown;
      case 'question_skipped': return AlertTriangle;
      case 'question_completed': return Clock;
      default: return BarChart3;
    }
  };

  const getErrorTypeLabel = (type: string) => {
    switch (type) {
      case 'answer_selected': return 'Réponse sélectionnée';
      case 'answer_changed': return 'Changement de réponse';
      case 'question_skipped': return 'Question ignorée';
      case 'question_completed': return 'Question complétée';
      default: return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Erreur</span>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <p className="text-gray-500">Aucune donnée d'analyse disponible</p>
      </div>
    );
  }

  const errorPatterns = Object.values(analytics.errorPatterns);
  const sortedPatterns = errorPatterns.sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Analyse des Erreurs</h3>
            <p className="text-gray-600">Période: {analytics.period}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalEvents}</div>
            <div className="text-sm text-gray-600">Événements totaux</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{errorPatterns.length}</div>
            <div className="text-sm text-gray-600">Types d'erreurs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(analytics.averageResponseTimes).length}
            </div>
            <div className="text-sm text-gray-600">Exercices analysés</div>
          </div>
        </div>
      </div>

      {/* Patterns d'erreurs */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Patterns d'Erreurs les Plus Fréquents
        </h4>
        
        {sortedPatterns.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun pattern d'erreur détecté</p>
        ) : (
          <div className="space-y-3">
            {sortedPatterns.slice(0, 10).map((pattern, index) => {
              const Icon = getErrorTypeIcon(pattern.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {getErrorTypeLabel(pattern.type)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {pattern.data && typeof pattern.data === 'object' 
                          ? JSON.stringify(pattern.data).substring(0, 100) + '...'
                          : String(pattern.data).substring(0, 100)
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{pattern.count}</div>
                    <div className="text-xs text-gray-500">occurrences</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Temps de réponse moyens */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Temps de Réponse Moyens par Exercice
        </h4>
        
        {Object.keys(analytics.averageResponseTimes).length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune donnée de temps de réponse</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(analytics.averageResponseTimes).map(([exerciseId, stats], index) => (
              <motion.div
                key={exerciseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Exercice {exerciseId.substring(0, 8)}...
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats.count} questions analysées
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {Math.round(stats.average)}ms
                  </div>
                  <div className="text-xs text-gray-500">temps moyen</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recommandations IA */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 shadow-xl border border-purple-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Recommandations pour l'IA
        </h4>
        
        <div className="space-y-3">
          {sortedPatterns.slice(0, 3).map((pattern, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-sm text-gray-700">
                <strong>Pattern détecté:</strong> {getErrorTypeLabel(pattern.type)} ({pattern.count} fois)
              </div>
              <div className="text-xs text-gray-600 mt-1">
                L'IA peut adapter la difficulté ou proposer des exercices ciblés pour ce type d'erreur.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
