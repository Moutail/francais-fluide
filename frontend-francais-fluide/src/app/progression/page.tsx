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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Navigation from '@/components/layout/Navigation';
import { useAuth } from '@/contexts/AuthContext';

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
  // recentChecks removed from API
}

export default function ProgressionPage() {
  const { isAuthenticated, loading } = useAuth();
  // Helpers pour normaliser les nombres et pourcentage
  const normalizeNumber = (value: unknown, fallback = 0): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const clampPercent = (value: number): number => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
  };
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [isClient, setIsClient] = useState(false);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [allProgressData, setAllProgressData] = useState<ProgressData[]>([]); // Toutes les données
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
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        if (!token) {
          setError('Veuillez vous connecter pour voir votre progression');
          setIsLoading(false);
          return;
        }

        // Charger la progression utilisateur
        const response = await fetch('/api/progress', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la progression');
        }

        const data = await response.json();
        if (data.success) {
          // Normaliser les données pour éviter NaN et divisions par zéro
          const normalized: UserProgress = {
            wordsWritten: normalizeNumber(data.data?.wordsWritten, 0),
            accuracy: clampPercent(normalizeNumber(data.data?.accuracy, 0)),
            timeSpent: normalizeNumber(data.data?.timeSpent, 0),
            exercisesCompleted: normalizeNumber(data.data?.exercisesCompleted, 0),
            currentStreak: normalizeNumber(data.data?.currentStreak, 0),
            level: Math.max(1, normalizeNumber(data.data?.level, 1)),
            xp: Math.max(0, normalizeNumber(data.data?.xp, 0)),
            nextLevelXp: Math.max(1, normalizeNumber(data.data?.nextLevelXp, 1000)),
            averageAccuracy: clampPercent(
              normalizeNumber(data.data?.averageAccuracy ?? data.data?.accuracy ?? 0, 0)
            ),
          };

          setCurrentStats(normalized);

          // Générer des données de progression pour les 7 derniers jours
          const mockProgressData: ProgressData[] = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const baseWords = Math.floor(normalized.wordsWritten / 7);
            const baseTime = Math.floor(normalized.timeSpent / 7);
            const baseAcc = normalized.averageAccuracy;
            mockProgressData.push({
              date: date.toISOString().split('T')[0],
              wordsWritten: Math.max(0, baseWords) + Math.floor(Math.random() * 200),
              accuracy: clampPercent(baseAcc + Math.floor(Math.random() * 10) - 5),
              timeSpent: Math.max(0, baseTime) + Math.floor(Math.random() * 20),
              exercisesCompleted:
                Math.max(0, Math.floor(normalized.exercisesCompleted / 7)) +
                Math.floor(Math.random() * 3),
            });
          }
          setAllProgressData(mockProgressData); // Sauvegarder toutes les données
          setProgressData(mockProgressData); // Afficher initialement toutes les données

          // Générer les objectifs hebdomadaires basés sur les données réelles
          setWeeklyGoals([
            {
              id: 'words',
              title: 'Mots à écrire',
              target: 10000,
              current: normalized.wordsWritten,
              unit: 'mots',
            },
            {
              id: 'time',
              title: 'Temps de pratique',
              target: 300,
              current: normalized.timeSpent,
              unit: 'minutes',
            },
            {
              id: 'exercises',
              title: 'Exercices complétés',
              target: 50,
              current: normalized.exercisesCompleted,
              unit: 'exercices',
            },
          ]);

          // Générer les succès basés sur les données réelles
          setAchievements([
            {
              id: 'streak-7',
              title: 'Série de 7 jours',
              description: 'Pratiquez 7 jours consécutifs',
              icon: Calendar,
              unlocked: normalized.currentStreak >= 7,
              progress: Math.min(normalized.currentStreak, 7),
              maxProgress: 7,
            },
            {
              id: 'words-10000',
              title: 'Écrivain prolifique',
              description: 'Écrivez 10,000 mots',
              icon: BookOpen,
              unlocked: normalized.wordsWritten >= 10000,
              progress: Math.min(normalized.wordsWritten, 10000),
              maxProgress: 10000,
            },
            {
              id: 'accuracy-95',
              title: 'Maître de la précision',
              description: 'Atteignez 95% de précision',
              icon: Target,
              unlocked: normalized.accuracy >= 95,
              progress: Math.min(normalized.accuracy, 95),
              maxProgress: 95,
            },
            {
              id: 'exercises-100',
              title: 'Exercices acharné',
              description: 'Complétez 100 exercices',
              icon: Zap,
              unlocked: normalized.exercisesCompleted >= 100,
              progress: Math.min(normalized.exercisesCompleted, 100),
              maxProgress: 100,
            },
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

  // Filtrer les données selon la période sélectionnée
  useEffect(() => {
    if (allProgressData.length === 0) return;

    const now = new Date();
    now.setHours(23, 59, 59, 999); // Fin de la journée actuelle
    
    const filtered = allProgressData.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0); // Début de la journée de l'item
      
      const diffMs = now.getTime() - itemDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Ignorer les dates futures
      if (diffMs < 0) return false;

      if (selectedPeriod === 'week') {
        return diffDays < 7; // Derniers 7 jours (0-6)
      } else if (selectedPeriod === 'month') {
        return diffDays < 30; // Derniers 30 jours (0-29)
      } else {
        return diffDays < 365; // Derniers 365 jours (0-364)
      }
    });

    // Trier par date décroissante (plus récent en premier)
    const sorted = filtered.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    console.log(`📊 Filtrage progression - Période: ${selectedPeriod}`);
    console.log(`   Total données: ${allProgressData.length}`);
    console.log(`   Filtrées: ${sorted.length}`);
    console.log(`   Dates:`, sorted.map(d => d.date).slice(0, 5));

    setProgressData(sorted);

    // Recalculer les statistiques pour la période
    if (sorted.length > 0) {
      const totalWords = sorted.reduce((sum, item) => sum + item.wordsWritten, 0);
      const avgAccuracy = sorted.reduce((sum, item) => sum + item.accuracy, 0) / sorted.length;
      const totalTime = sorted.reduce((sum, item) => sum + item.timeSpent, 0);
      const totalExercises = sorted.reduce((sum, item) => sum + item.exercisesCompleted, 0);

      console.log(`   Stats calculées:`, {
        totalWords,
        avgAccuracy: avgAccuracy.toFixed(1),
        totalTime,
        totalExercises
      });

      setCurrentStats(prev => ({
        ...prev,
        wordsWritten: totalWords,
        averageAccuracy: avgAccuracy,
        timeSpent: totalTime,
        exercisesCompleted: totalExercises,
      }));
    } else {
      console.log(`   ⚠️ Aucune donnée pour cette période`);
    }
  }, [selectedPeriod, allProgressData]);

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Erreur</h1>
          <p className="mb-4 text-gray-600">{error}</p>
          <a
            href="/auth/login"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
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

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Période de sélection */}
        <div className="mb-6 flex justify-center sm:mb-8">
          <div className="rounded-xl bg-white p-1 shadow-lg">
            {(['week', 'month', 'year'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  'rounded-lg px-6 py-2 font-medium transition-all',
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {period === 'week'
                  ? 'Cette semaine'
                  : period === 'month'
                    ? 'Ce mois'
                    : 'Cette année'}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-xl sm:p-6">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <div className="rounded-lg bg-blue-100 p-2 sm:p-3">
                <BookOpen className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
              </div>
              {getTrendIcon(currentStats.wordsWritten, 8000)}
            </div>
            <div className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              {isClient ? currentStats.wordsWritten.toLocaleString() : '0'}
            </div>
            <div className="text-xs text-gray-600 sm:text-sm">Mots écrits</div>
            <div className="mt-2 text-xs text-blue-600">
              +{Math.floor(currentStats.wordsWritten * 0.1)} cette semaine
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-xl sm:p-6">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <div className="rounded-lg bg-green-100 p-2 sm:p-3">
                <Target className="h-5 w-5 text-green-600 sm:h-6 sm:w-6" />
              </div>
              {getTrendIcon(currentStats.averageAccuracy, 89)}
            </div>
            <div className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              {Number.isFinite(currentStats.averageAccuracy)
                ? Math.round(currentStats.averageAccuracy)
                : 0}
              %
            </div>
            <div className="text-xs text-gray-600 sm:text-sm">Précision moyenne</div>
            <div className="mt-2 text-xs text-green-600">
              +
              {Number.isFinite(currentStats.averageAccuracy)
                ? Math.floor(currentStats.averageAccuracy * 0.05)
                : 0}
              % cette semaine
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-xl sm:p-6">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <div className="rounded-lg bg-purple-100 p-2 sm:p-3">
                <Clock className="h-5 w-5 text-purple-600 sm:h-6 sm:w-6" />
              </div>
              {getTrendIcon(currentStats.timeSpent, 240)}
            </div>
            <div className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              {currentStats.timeSpent}
            </div>
            <div className="text-xs text-gray-600 sm:text-sm">Minutes de pratique</div>
            <div className="mt-2 text-xs text-purple-600">
              +{Math.floor(currentStats.timeSpent * 0.1)} cette semaine
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-xl sm:p-6">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <div className="rounded-lg bg-yellow-100 p-2 sm:p-3">
                <Trophy className="h-5 w-5 text-yellow-600 sm:h-6 sm:w-6" />
              </div>
              {getTrendIcon(currentStats.currentStreak, 5)}
            </div>
            <div className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              {currentStats.currentStreak}
            </div>
            <div className="text-xs text-gray-600 sm:text-sm">Jours consécutifs</div>
            <div className="mt-2 text-xs text-yellow-600">
              +{Math.floor(currentStats.currentStreak * 0.2)} cette semaine
            </div>
          </div>
        </div>

        {/* Niveau et XP */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-xl sm:mb-8 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Niveau {currentStats.level}</h3>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-semibold text-gray-900">
                {normalizeNumber(currentStats.xp, 0)} /{' '}
                {Math.max(1, normalizeNumber(currentStats.nextLevelXp, 1000))} XP
              </span>
            </div>
          </div>
          <div className="mb-2 h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{
                width: `${clampPercent((normalizeNumber(currentStats.xp, 0) / Math.max(1, normalizeNumber(currentStats.nextLevelXp, 1000))) * 100)}%`,
              }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {Math.max(
              0,
              Math.max(1, normalizeNumber(currentStats.nextLevelXp, 1000)) -
                normalizeNumber(currentStats.xp, 0)
            )}{' '}
            XP jusqu'au niveau {currentStats.level + 1}
          </p>
        </div>

        {/* Objectifs hebdomadaires */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-xl sm:mb-8 sm:p-6">
          <h3 className="mb-6 text-xl font-bold text-gray-900">Objectifs de la semaine</h3>
          <div className="space-y-4">
            {weeklyGoals.map(goal => (
              <div key={goal.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-gray-900">{goal.title}</span>
                    <span className="text-sm text-gray-600">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Succès */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-xl sm:mb-8 sm:p-6">
          <h3 className="mb-6 text-xl font-bold text-gray-900">Succès</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={cn(
                  'rounded-xl border-2 p-4 transition-all',
                  achievement.unlocked
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'rounded-lg p-2',
                      achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
                    )}
                  >
                    <achievement.icon
                      className={cn(
                        'h-5 w-5',
                        achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={cn(
                        'font-semibold',
                        achievement.unlocked ? 'text-green-900' : 'text-gray-600'
                      )}
                    >
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <div className="h-1 w-full rounded-full bg-gray-200">
                          <div
                            className="h-1 rounded-full bg-blue-500 transition-all duration-500"
                            style={{
                              width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
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
        <div className="rounded-2xl bg-white p-4 shadow-xl sm:p-6">
          <h3 className="mb-6 text-xl font-bold text-gray-900">Progression quotidienne</h3>
          <div className="flex h-64 items-end justify-between gap-2">
            {progressData.map((data, index) => (
              <div key={data.date} className="flex flex-1 flex-col items-center">
                <div className="relative w-full rounded-t-lg bg-gray-100">
                  <div
                    className="rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                    style={{ height: `${(data.wordsWritten / 2000) * 200}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform text-xs font-medium text-gray-600">
                    {data.wordsWritten}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
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
