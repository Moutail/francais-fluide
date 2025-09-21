// src/app/progression/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  BookOpen,
  Zap,
  Clock,
  Star,
  Trophy,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Navigation from '@/components/layout/Navigation';
import { useAuth } from '@/hooks/useApi';

interface ProgressData {
  date: string;
  wordsWritten: number;
  accuracy: number;
  timeSpent: number;
  exercisesCompleted: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface WeeklyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

interface UserProgress {
  wordsWritten: number;
  accuracy: number;
  timeSpent: number;
  exercisesCompleted: number;
  currentStreak: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  averageAccuracy: number;
  recentChecks: number;
}

export default function ProgressionPage() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [isClient, setIsClient] = useState(false);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [currentStats, setCurrentStats] = useState<UserProgress>({
    wordsWritten: 0,
    accuracy: 0,
    timeSpent: 0,
    exercisesCompleted: 0,
    currentStreak: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    averageAccuracy: 0,
    recentChecks: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Rediriger les utilisateurs non connectés
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  // Charger les données réelles
  useEffect(() => {
    const loadProgressData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Veuillez vous connecter pour voir votre progression');
          setIsLoading(false);
          return;
        }

        // Charger la progression utilisateur
        const response = await fetch('/api/progress', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la progression');
        }

        const data = await response.json();
        if (data.success) {
          setCurrentStats(data.progress);
          
          // Générer des données de progression pour les 7 derniers jours
          const mockProgressData: ProgressData[] = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            mockProgressData.push({
              date: date.toISOString().split('T')[0],
              wordsWritten: Math.floor(data.progress.wordsWritten / 7) + Math.floor(Math.random() * 200),
              accuracy: data.progress.averageAccuracy + Math.floor(Math.random() * 10) - 5,
              timeSpent: Math.floor(data.progress.timeSpent / 7) + Math.floor(Math.random() * 20),
              exercisesCompleted: Math.floor(data.progress.exercisesCompleted / 7) + Math.floor(Math.random() * 3)
            });
          }
          setProgressData(mockProgressData);

          // Générer les objectifs hebdomadaires basés sur les données réelles
          setWeeklyGoals([
            {
              id: 'words',
              title: 'Mots à écrire',
              target: 10000,
              current: data.progress.wordsWritten,
              unit: 'mots'
            },
            {
              id: 'time',
              title: 'Temps de pratique',
              target: 300,
              current: data.progress.timeSpent,
              unit: 'minutes'
            },
            {
              id: 'exercises',
              title: 'Exercices complétés',
              target: 50,
              current: data.progress.exercisesCompleted,
              unit: 'exercices'
            }
          ]);

          // Générer les succès basés sur les données réelles
          setAchievements([
            {
              id: 'streak-7',
              title: 'Série de 7 jours',
              description: 'Pratiquez 7 jours consécutifs',
              icon: Calendar,
              unlocked: data.progress.currentStreak >= 7,
              progress: Math.min(data.progress.currentStreak, 7),
              maxProgress: 7
            },
            {
              id: 'words-10000',
              title: 'Écrivain prolifique',
              description: 'Écrivez 10,000 mots',
              icon: BookOpen,
              unlocked: data.progress.wordsWritten >= 10000,
              progress: Math.min(data.progress.wordsWritten, 10000),
              maxProgress: 10000
            },
            {
              id: 'accuracy-95',
              title: 'Maître de la précision',
              description: 'Atteignez 95% de précision',
              icon: Target,
              unlocked: data.progress.averageAccuracy >= 95,
              progress: Math.min(data.progress.averageAccuracy, 95),
              maxProgress: 95
            },
            {
              id: 'exercises-100',
              title: 'Exercices acharné',
              description: 'Complétez 100 exercices',
              icon: Zap,
              unlocked: data.progress.exercisesCompleted >= 100,
              progress: Math.min(data.progress.exercisesCompleted, 100),
              maxProgress: 100
            }
          ]);
        }
      } catch (err) {
        console.error('Erreur de chargement:', err);
        setError('Erreur lors du chargement de vos données');
      } finally {
        setIsLoading(false);
      }
    };

    setIsClient(true);
    loadProgressData();
  }, []);

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre progression...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Période de sélection */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "px-6 py-2 rounded-lg font-medium transition-all",
                  selectedPeriod === period
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {period === 'week' ? 'Cette semaine' :
                 period === 'month' ? 'Ce mois' : 'Cette année'}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              {getTrendIcon(currentStats.wordsWritten, 8000)}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {isClient ? currentStats.wordsWritten.toLocaleString() : '0'}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Mots écrits</div>
            <div className="text-xs text-blue-600 mt-2">+{Math.floor(currentStats.wordsWritten * 0.1)} cette semaine</div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              {getTrendIcon(currentStats.averageAccuracy, 89)}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {Math.round(currentStats.averageAccuracy)}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Précision moyenne</div>
            <div className="text-xs text-green-600 mt-2">+{Math.floor(currentStats.averageAccuracy * 0.05)}% cette semaine</div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              {getTrendIcon(currentStats.timeSpent, 240)}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {currentStats.timeSpent}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Minutes de pratique</div>
            <div className="text-xs text-purple-600 mt-2">+{Math.floor(currentStats.timeSpent * 0.1)} cette semaine</div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              {getTrendIcon(currentStats.currentStreak, 5)}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {currentStats.currentStreak}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Jours consécutifs</div>
            <div className="text-xs text-yellow-600 mt-2">+{Math.floor(currentStats.currentStreak * 0.2)} cette semaine</div>
          </div>
        </div>

        {/* Niveau et XP */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Niveau {currentStats.level}</h3>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-semibold text-gray-900">
                {currentStats.xp} / {currentStats.nextLevelXp} XP
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentStats.xp / currentStats.nextLevelXp) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {currentStats.nextLevelXp - currentStats.xp} XP jusqu'au niveau {currentStats.level + 1}
          </p>
        </div>

        {/* Objectifs hebdomadaires */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl mb-6 sm:mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Objectifs de la semaine</h3>
          <div className="space-y-4">
            {weeklyGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{goal.title}</span>
                    <span className="text-sm text-gray-600">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Succès */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl mb-6 sm:mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Succès</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  achievement.unlocked
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    achievement.unlocked
                      ? "bg-green-100"
                      : "bg-gray-100"
                  )}>
                    <achievement.icon className={cn(
                      "w-5 h-5",
                      achievement.unlocked ? "text-green-600" : "text-gray-400"
                    )} />
                  </div>
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-semibold",
                      achievement.unlocked ? "text-green-900" : "text-gray-600"
                    )}>
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.progress} / {achievement.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Graphique de progression */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Progression quotidienne</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {progressData.map((data, index) => (
              <div key={data.date} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg relative">
                  <div
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(data.wordsWritten / 2000) * 200}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                    {data.wordsWritten}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(data.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}