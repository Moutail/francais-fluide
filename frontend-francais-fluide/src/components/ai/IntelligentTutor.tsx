'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BookOpen, 
  Lightbulb, 
  Trophy,
  Clock,
  BarChart3,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface UserProfile {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  weakPoints: string[];
  strongPoints: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  recentProgress: {
    date: string;
    accuracy: number;
    exercisesCompleted: number;
    timeSpent: number;
  }[];
  goals: string[];
  currentStreak: number;
  totalXP: number;
}

interface TutorInsight {
  id: string;
  type: 'encouragement' | 'warning' | 'tip' | 'achievement' | 'suggestion';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: 'high' | 'medium' | 'low';
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'writing' | 'general';
}

interface TutorRecommendation {
  id: string;
  type: 'exercise' | 'study_session' | 'break' | 'review';
  title: string;
  description: string;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  targetSkills: string[];
  reason: string;
}

interface IntelligentTutorProps {
  userProfile: UserProfile;
  subscriptionPlan: string;
  onRecommendationClick: (recommendation: TutorRecommendation) => void;
  className?: string;
}

export const IntelligentTutor: React.FC<IntelligentTutorProps> = ({
  userProfile,
  subscriptionPlan,
  onRecommendationClick,
  className
}) => {
  const [insights, setInsights] = useState<TutorInsight[]>([]);
  const [recommendations, setRecommendations] = useState<TutorRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'insights' | 'recommendations' | 'progress'>('insights');

  useEffect(() => {
    analyzeUserProgress();
  }, [userProfile]);

  const analyzeUserProgress = async () => {
    setIsAnalyzing(true);
    
    // Simulation de l'analyse IA (remplacer par un vrai appel API)
    setTimeout(() => {
      const newInsights = generateInsights(userProfile);
      const newRecommendations = generateRecommendations(userProfile, subscriptionPlan);
      
      setInsights(newInsights);
      setRecommendations(newRecommendations);
      setIsAnalyzing(false);
    }, 2000);
  };

  const generateInsights = (profile: UserProfile): TutorInsight[] => {
    const insights: TutorInsight[] = [];

    // Analyse de la progression
    if (profile.recentProgress.length > 0) {
      const latestProgress = profile.recentProgress[profile.recentProgress.length - 1];
      const avgAccuracy = profile.recentProgress.reduce((sum, p) => sum + p.accuracy, 0) / profile.recentProgress.length;

      if (latestProgress.accuracy > avgAccuracy + 10) {
        insights.push({
          id: 'improvement',
          type: 'encouragement',
          title: '🎉 Excellente progression !',
          message: `Votre précision a augmenté de ${Math.round(latestProgress.accuracy - avgAccuracy)}% cette semaine !`,
          priority: 'high',
          category: 'general'
        });
      }

      if (profile.currentStreak >= 7) {
        insights.push({
          id: 'streak',
          type: 'achievement',
          title: '🔥 Série impressionnante !',
          message: `${profile.currentStreak} jours consécutifs d'apprentissage ! Continuez comme ça !`,
          priority: 'high',
          category: 'general'
        });
      }

      if (latestProgress.accuracy < 60) {
        insights.push({
          id: 'struggling',
          type: 'warning',
          title: '⚠️ Besoin d\'aide ?',
          message: 'Votre précision est en baisse. Voulez-vous revoir les bases ?',
          priority: 'high',
          category: 'general',
          action: {
            label: 'Revoir les bases',
            onClick: () => console.log('Revoir les bases')
          }
        });
      }
    }

    // Analyse des points faibles
    if (profile.weakPoints.length > 0) {
      insights.push({
        id: 'weak_points',
        type: 'tip',
        title: '💡 Conseil personnalisé',
        message: `Concentrez-vous sur: ${profile.weakPoints.slice(0, 2).join(', ')}. Ces compétences vous feront progresser rapidement !`,
        priority: 'medium',
        category: 'grammar'
      });
    }

    // Analyse des points forts
    if (profile.strongPoints.length > 0) {
      insights.push({
        id: 'strong_points',
        type: 'encouragement',
        title: '⭐ Vos forces',
        message: `Vous excellez en: ${profile.strongPoints.slice(0, 2).join(', ')}. Utilisez ces compétences pour vous motiver !`,
        priority: 'low',
        category: 'general'
      });
    }

    // Analyse du style d'apprentissage
    if (profile.learningStyle === 'visual') {
      insights.push({
        id: 'learning_style',
        type: 'tip',
        title: '👁️ Style d\'apprentissage',
        message: 'Vous apprenez mieux visuellement. Essayez nos exercices avec images et graphiques !',
        priority: 'low',
        category: 'general'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const generateRecommendations = (profile: UserProfile, plan: string): TutorRecommendation[] => {
    const recommendations: TutorRecommendation[] = [];

    // Recommandations basées sur les points faibles
    profile.weakPoints.forEach(weakPoint => {
      recommendations.push({
        id: `weak_${weakPoint}`,
        type: 'exercise',
        title: `Exercice: ${weakPoint}`,
        description: `Pratiquez spécifiquement la ${weakPoint} avec des exercices adaptés à votre niveau`,
        estimatedTime: 15,
        difficulty: profile.level === 'beginner' ? 'easy' : 'medium',
        targetSkills: [weakPoint],
        reason: 'Cible vos zones d\'amélioration'
      });
    });

    // Recommandations basées sur le niveau
    if (profile.level === 'beginner') {
      recommendations.push({
        id: 'grammar_basics',
        type: 'study_session',
        title: 'Session: Grammaire de base',
        description: 'Une session complète sur les règles grammaticales essentielles',
        estimatedTime: 30,
        difficulty: 'easy',
        targetSkills: ['grammar', 'conjugation'],
        reason: 'Parfait pour votre niveau débutant'
      });
    }

    // Recommandations basées sur la progression
    if (profile.recentProgress.length > 0) {
      const recentAccuracy = profile.recentProgress[profile.recentProgress.length - 1].accuracy;
      if (recentAccuracy > 80) {
        recommendations.push({
          id: 'challenge',
          type: 'exercise',
          title: 'Défi: Niveau supérieur',
          description: 'Essayez des exercices plus difficiles pour continuer à progresser',
          estimatedTime: 20,
          difficulty: 'hard',
          targetSkills: ['advanced_grammar', 'complex_vocabulary'],
          reason: 'Vous êtes prêt pour plus de difficulté !'
        });
      }
    }

    // Recommandations basées sur le plan d'abonnement
    if (plan === 'premium' || plan === 'enterprise') {
      recommendations.push({
        id: 'ai_practice',
        type: 'exercise',
        title: 'Pratique IA avancée',
        description: 'Utilisez l\'IA pour des exercices personnalisés et des corrections détaillées',
        estimatedTime: 25,
        difficulty: 'medium',
        targetSkills: ['ai_correction', 'personalized_learning'],
        reason: 'Fonctionnalité premium disponible'
      });
    }

    return recommendations.slice(0, 5); // Limiter à 5 recommandations
  };

  const getInsightIcon = (type: TutorInsight['type']) => {
    switch (type) {
      case 'encouragement': return <Trophy className="w-5 h-5 text-green-500" />;
      case 'warning': return <Target className="w-5 h-5 text-orange-500" />;
      case 'tip': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'achievement': return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'suggestion': return <MessageCircle className="w-5 h-5 text-cyan-500" />;
      default: return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: TutorInsight['type']) => {
    switch (type) {
      case 'encouragement': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'tip': return 'border-blue-200 bg-blue-50';
      case 'achievement': return 'border-purple-200 bg-purple-50';
      case 'suggestion': return 'border-cyan-200 bg-cyan-50';
      default: return 'border-gray-200 bg-gray-50';
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

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-200", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tuteur IA Intelligent</h3>
            <p className="text-sm text-gray-600">Votre assistant d'apprentissage personnalisé</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'insights', label: 'Insights', icon: Lightbulb },
            { id: 'recommendations', label: 'Recommandations', icon: Target },
            { id: 'progress', label: 'Progression', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                selectedTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
              />
              <span className="text-gray-600">Analyse de votre progression...</span>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {selectedTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {insights.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun insight disponible pour le moment</p>
                  </div>
                ) : (
                  insights.map(insight => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "p-4 rounded-lg border-l-4",
                        getInsightColor(insight.type)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {insight.title}
                          </h4>
                          <p className="text-sm text-gray-700 mb-2">
                            {insight.message}
                          </p>
                          {insight.action && (
                            <button
                              onClick={insight.action.onClick}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {insight.action.label} →
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {selectedTab === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {recommendations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune recommandation disponible</p>
                  </div>
                ) : (
                  recommendations.map(rec => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => onRecommendationClick(rec)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {rec.title}
                        </h4>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getDifficultyColor(rec.difficulty)
                        )}>
                          {rec.difficulty === 'easy' ? 'Facile' : 
                           rec.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {rec.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {rec.estimatedTime} min
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {rec.targetSkills.join(', ')}
                          </div>
                        </div>
                        <span className="text-blue-600 font-medium">
                          {rec.reason}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {selectedTab === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Statistiques générales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {userProfile.currentStreak}
                    </div>
                    <div className="text-sm text-gray-600">Jours de suite</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userProfile.totalXP}
                    </div>
                    <div className="text-sm text-gray-600">Points XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {userProfile.level === 'beginner' ? 'Débutant' : 
                       userProfile.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                    </div>
                    <div className="text-sm text-gray-600">Niveau</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {userProfile.recentProgress.length}
                    </div>
                    <div className="text-sm text-gray-600">Sessions</div>
                  </div>
                </div>

                {/* Graphique de progression */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Progression récente</h4>
                  <div className="h-32 flex items-end gap-2">
                    {userProfile.recentProgress.slice(-7).map((progress, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${(progress.accuracy / 100) * 100}%` }}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(progress.date).getDate()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
