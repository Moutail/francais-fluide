// components/ai/PersonalizedRecommendations.tsx - Composant pour afficher les recommandations IA
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  Zap,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import { aiRecommendations, AIRecommendation } from '@/lib/ai-recommendations';
import { useAuth } from '@/contexts/AuthContext';

export default function PersonalizedRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadRecommendations();
    }
  }, [user?.id]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const recs = await aiRecommendations.generateRecommendations(user!.id);
      setRecommendations(recs);
    } catch (err) {
      console.error('Erreur chargement recommandations:', err);
      setError('Impossible de charger les recommandations');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'exercise':
        return BookOpen;
      case 'study_plan':
        return Target;
      case 'difficulty_adjustment':
        return TrendingUp;
      case 'focus_area':
        return Zap;
      default:
        return Lightbulb;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Priorité élevée';
      case 'medium':
        return 'Priorité moyenne';
      case 'low':
        return 'Priorité faible';
      default:
        return 'Priorité normale';
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-1/3 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Erreur</span>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={loadRecommendations}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <div className="text-center">
          <Brain className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Aucune recommandation disponible
          </h3>
          <p className="text-gray-600">
            Complétez quelques exercices pour recevoir des recommandations personnalisées.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recommandations IA Personnalisées</h3>
            <p className="text-gray-600">Basées sur votre progression et vos erreurs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
            <div className="text-sm text-gray-600">Recommandations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {recommendations.filter(r => r.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">Priorité élevée</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {recommendations.filter(r => r.type === 'focus_area').length}
            </div>
            <div className="text-sm text-gray-600">Zones de focus</div>
          </div>
        </div>
      </div>

      {/* Liste des recommandations */}
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => {
          const Icon = getRecommendationIcon(recommendation.type);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl border-2 bg-white p-6 shadow-xl ${getPriorityColor(recommendation.priority)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-lg bg-blue-100 p-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-gray-900">{recommendation.title}</h4>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(recommendation.priority)}`}
                    >
                      {getPriorityLabel(recommendation.priority)}
                    </span>
                  </div>

                  <p className="mb-3 text-gray-700">{recommendation.description}</p>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Analyse IA :</span>
                    </div>
                    <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
                  </div>

                  {/* Actions selon le type */}
                  {recommendation.type === 'exercise' && (
                    <button className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                      Commencer l'exercice
                    </button>
                  )}

                  {recommendation.type === 'study_plan' && (
                    <button className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
                      Voir le plan d'étude
                    </button>
                  )}

                  {recommendation.type === 'difficulty_adjustment' && (
                    <button className="mt-3 rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700">
                      Ajuster la difficulté
                    </button>
                  )}

                  {recommendation.type === 'focus_area' && (
                    <button className="mt-3 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700">
                      Se concentrer sur cette zone
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Actions globales */}
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <h4 className="mb-4 text-lg font-semibold text-gray-900">Actions Recommandées</h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadRecommendations}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Brain className="h-4 w-4" />
            Actualiser les recommandations
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
            <Target className="h-4 w-4" />
            Créer un plan personnalisé
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700">
            <BookOpen className="h-4 w-4" />
            Générer des exercices ciblés
          </button>
        </div>
      </div>
    </div>
  );
}
