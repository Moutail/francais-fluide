// src/app/progression/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Minus
} from 'lucide-react';
import { Navbar } from '@/components/navigation/Navbar';
import { cn } from '@/lib/utils/cn';

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

export default function ProgressionPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [progressData] = useState<ProgressData[]>([
    { date: '2024-01-15', wordsWritten: 1200, accuracy: 85, timeSpent: 45, exercisesCompleted: 8 },
    { date: '2024-01-16', wordsWritten: 980, accuracy: 92, timeSpent: 38, exercisesCompleted: 6 },
    { date: '2024-01-17', wordsWritten: 1500, accuracy: 88, timeSpent: 52, exercisesCompleted: 10 },
    { date: '2024-01-18', wordsWritten: 1100, accuracy: 95, timeSpent: 42, exercisesCompleted: 7 },
    { date: '2024-01-19', wordsWritten: 1350, accuracy: 90, timeSpent: 48, exercisesCompleted: 9 },
    { date: '2024-01-20', wordsWritten: 1600, accuracy: 93, timeSpent: 55, exercisesCompleted: 11 },
    { date: '2024-01-21', wordsWritten: 1400, accuracy: 91, timeSpent: 50, exercisesCompleted: 8 },
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: 'streak-7',
      title: 'Série de 7 jours',
      description: 'Pratiquez 7 jours consécutifs',
      icon: Calendar,
      unlocked: true,
      progress: 7,
      maxProgress: 7
    },
    {
      id: 'words-10000',
      title: 'Écrivain prolifique',
      description: 'Écrivez 10,000 mots',
      icon: BookOpen,
      unlocked: true,
      progress: 8750,
      maxProgress: 10000
    },
    {
      id: 'accuracy-95',
      title: 'Maître de la précision',
      description: 'Atteignez 95% de précision',
      icon: Target,
      unlocked: false,
      progress: 92,
      maxProgress: 95
    },
    {
      id: 'exercises-100',
      title: 'Exercices acharné',
      description: 'Complétez 100 exercices',
      icon: Zap,
      unlocked: false,
      progress: 67,
      maxProgress: 100
    }
  ]);

  const [weeklyGoals] = useState<WeeklyGoal[]>([
    {
      id: 'words',
      title: 'Mots à écrire',
      target: 10000,
      current: 8750,
      unit: 'mots'
    },
    {
      id: 'time',
      title: 'Temps de pratique',
      target: 300,
      current: 270,
      unit: 'minutes'
    },
    {
      id: 'exercises',
      title: 'Exercices complétés',
      target: 50,
      current: 43,
      unit: 'exercices'
    }
  ]);

  const currentStats = {
    totalWords: 8750,
    averageAccuracy: 92,
    totalTime: 270,
    currentStreak: 7,
    level: 12,
    xp: 2450,
    nextLevelXp: 3000
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-500';
    if (current < previous) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navbar currentPage="/progression" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Période de sélection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
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
        </motion.div>

        {/* Statistiques principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              {getTrendIcon(currentStats.totalWords, 8000)}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {currentStats.totalWords.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Mots écrits</div>
            <div className="text-xs text-blue-600 mt-2">+750 cette semaine</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              {getTrendIcon(currentStats.averageAccuracy, 89)}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {currentStats.averageAccuracy}%
            </div>
            <div className="text-sm text-gray-600">Précision moyenne</div>
            <div className="text-xs text-green-600 mt-2">+3% cette semaine</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              {getTrendIcon(currentStats.totalTime, 240)}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {currentStats.totalTime}
            </div>
            <div className="text-sm text-gray-600">Minutes de pratique</div>
            <div className="text-xs text-purple-600 mt-2">+30 cette semaine</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              {getTrendIcon(currentStats.currentStreak, 5)}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {currentStats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Jours consécutifs</div>
            <div className="text-xs text-yellow-600 mt-2">+2 cette semaine</div>
          </div>
        </motion.div>

        {/* Niveau et XP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-xl mb-8"
        >
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
        </motion.div>

        {/* Objectifs hebdomadaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-xl mb-8"
        >
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
        </motion.div>

        {/* Succès */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-xl mb-8"
        >
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
        </motion.div>

        {/* Graphique de progression */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-xl"
        >
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
        </motion.div>
      </div>
    </div>
  );
}
