// src/components/gamification/ProgressDashboard.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Target,
  Flame,
  Star,
  Zap,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useProgressStore } from '@/store/progressStore';
import { cn } from '@/lib/utils/cn';

export const ProgressDashboard: React.FC = () => {
  const {
    level,
    experience,
    points,
    dailyStreak,
    bestStreak,
    statistics,
    achievements,
    unlockedAchievements,
    missions,
    completedMissions,
  } = useProgressStore();

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'missions'>(
    'overview'
  );

  // Calcul du progrès vers le prochain niveau
  const currentLevelXP = (level - 1) * 100 * (1 + (level - 1) * 0.1);
  const nextLevelXP = level * 100 * (1 + level * 0.1);
  const progressToNextLevel =
    ((experience - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  // Animation de level up
  useEffect(() => {
    const hasLeveledUp = experience >= nextLevelXP;
    if (hasLeveledUp) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [experience, nextLevelXP]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* En-tête avec niveau et XP */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur"
            >
              <span className="text-3xl font-bold">{level}</span>
            </motion.div>

            <div>
              <h2 className="mb-1 text-2xl font-bold">Niveau {level}</h2>
              <p className="text-blue-100">{experience.toLocaleString()} XP totale</p>
            </div>
          </div>

          <div className="text-right">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-300" />
              <span className="text-2xl font-bold">{points.toLocaleString()}</span>
            </div>
            <p className="text-blue-100">Points</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span>Niveau {level}</span>
            <span>Niveau {level + 1}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextLevel}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300"
            />
          </div>
          <p className="mt-2 text-center text-sm text-blue-100">
            {Math.round(progressToNextLevel)}% vers le niveau {level + 1}
          </p>
        </div>
      </motion.div>

      {/* Tabs de navigation */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex border-b border-gray-200">
          {(['overview', 'achievements', 'missions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                selectedTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab === 'overview' && "Vue d'ensemble"}
              {tab === 'achievements' && 'Succès'}
              {tab === 'missions' && 'Missions'}
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'overview' && (
              <OverviewTab
                statistics={statistics}
                dailyStreak={dailyStreak}
                bestStreak={bestStreak}
              />
            )}
            {selectedTab === 'achievements' && (
              <AchievementsTab
                achievements={achievements}
                unlockedAchievements={unlockedAchievements}
              />
            )}
            {selectedTab === 'missions' && (
              <MissionsTab missions={missions} completedMissions={completedMissions} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Animation de level up */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 p-8"
            >
              <Star className="h-16 w-16 text-white" />
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute mt-32 text-4xl font-bold text-white drop-shadow-2xl"
            >
              Niveau {level}!
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant Vue d'ensemble
const OverviewTab: React.FC<{ statistics: any; dailyStreak: number; bestStreak: number }> = ({
  statistics,
  dailyStreak,
  bestStreak,
}) => {
  const stats = [
    {
      icon: BookOpen,
      label: 'Mots écrits',
      value: statistics.totalWords.toLocaleString(),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Target,
      label: 'Précision moyenne',
      value: `${statistics.averageAccuracy}%`,
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Flame,
      label: 'Série actuelle',
      value: `${dailyStreak} jours`,
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Trophy,
      label: 'Meilleure série',
      value: `${bestStreak} jours`,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Clock,
      label: 'Temps de pratique',
      value: `${Math.round(statistics.timeSpent / 60)}h`,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: TrendingUp,
      label: "Taux d'amélioration",
      value: `+${statistics.improvementRate}%`,
      color: 'from-teal-500 to-cyan-500',
    },
  ];

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          className="rounded-xl bg-gray-50 p-4 transition-shadow hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r',
                stat.color
              )}
            >
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Composant Achievements
const AchievementsTab: React.FC<{ achievements: any[]; unlockedAchievements: string[] }> = ({
  achievements,
  unlockedAchievements,
}) => {
  const sampleAchievements = [
    {
      id: 'first_word',
      name: 'Premier pas',
      description: 'Écrivez votre premier mot',
      icon: '✍️',
      category: 'writing',
      progress: 100,
      maxProgress: 100,
      unlocked: true,
    },
    {
      id: 'perfect_10',
      name: 'Perfection x10',
      description: "10 phrases parfaites d'affilée",
      icon: '💯',
      category: 'accuracy',
      progress: 7,
      maxProgress: 10,
      unlocked: false,
    },
    {
      id: 'week_streak',
      name: 'Semaine complète',
      description: 'Pratiquez 7 jours de suite',
      icon: '🔥',
      category: 'streak',
      progress: 3,
      maxProgress: 7,
      unlocked: false,
    },
    {
      id: 'speed_demon',
      name: 'Vitesse éclair',
      description: 'Écrivez 100 mots en 5 minutes',
      icon: '⚡',
      category: 'speed',
      progress: 0,
      maxProgress: 100,
      unlocked: false,
    },
  ];

  return (
    <motion.div
      key="achievements"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      {sampleAchievements.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'relative rounded-xl border-2 bg-white p-4 transition-all',
            achievement.unlocked
              ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
              : 'border-gray-200 opacity-75'
          )}
        >
          {achievement.unlocked && (
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', delay: index * 0.1 + 0.3 }}
              className="absolute -right-2 -top-2 rounded-full bg-yellow-400 p-1"
            >
              <CheckCircle className="h-4 w-4 text-white" />
            </motion.div>
          )}

          <div className="flex items-start gap-3">
            <div className="text-3xl">{achievement.icon}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
              <p className="mb-2 text-sm text-gray-600">{achievement.description}</p>

              {!achievement.unlocked && (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>Progression</span>
                    <span>
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                      }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Composant Missions
const MissionsTab: React.FC<{ missions: any[]; completedMissions: string[] }> = ({
  missions,
  completedMissions,
}) => {
  const sampleMissions = [
    {
      id: 'daily_practice',
      title: 'Pratique quotidienne',
      description: "Écrivez au moins 50 mots aujourd'hui",
      type: 'daily',
      objectives: [
        { id: '1', description: 'Écrire 50 mots', target: 50, current: 32, completed: false },
      ],
      reward: { type: 'points', value: 20, description: '20 points' },
      expiresIn: '18h',
      completed: false,
    },
    {
      id: 'perfect_paragraph',
      title: 'Paragraphe parfait',
      description: 'Écrivez un paragraphe entier sans fautes',
      type: 'daily',
      objectives: [
        { id: '1', description: 'Paragraphe sans fautes', target: 1, current: 0, completed: false },
      ],
      reward: { type: 'points', value: 50, description: '50 points' },
      expiresIn: '18h',
      completed: false,
    },
    {
      id: 'weekly_goal',
      title: 'Objectif hebdomadaire',
      description: 'Pratiquez 5 jours cette semaine',
      type: 'weekly',
      objectives: [
        { id: '1', description: 'Jours de pratique', target: 5, current: 3, completed: false },
      ],
      reward: { type: 'badge', value: 'week_warrior', description: 'Badge Guerrier' },
      expiresIn: '4j',
      completed: false,
    },
  ];

  return (
    <motion.div
      key="missions"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {sampleMissions.map((mission, index) => (
        <motion.div
          key={mission.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'rounded-xl border-2 bg-white p-4',
            mission.completed ? 'border-green-400 bg-green-50' : 'border-gray-200'
          )}
        >
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-semibold',
                    mission.type === 'daily'
                      ? 'bg-blue-100 text-blue-700'
                      : mission.type === 'weekly'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                  )}
                >
                  {mission.type === 'daily'
                    ? 'Quotidien'
                    : mission.type === 'weekly'
                      ? 'Hebdomadaire'
                      : 'Spécial'}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {mission.expiresIn}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900">{mission.title}</h4>
              <p className="text-sm text-gray-600">{mission.description}</p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-600">
                <Award className="h-4 w-4" />
                <span className="text-sm font-semibold">{mission.reward.description}</span>
              </div>
            </div>
          </div>

          {mission.objectives.map(objective => (
            <div key={objective.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{objective.description}</span>
                <span className="font-medium">
                  {objective.current}/{objective.target}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(objective.current / objective.target) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </div>
          ))}

          {mission.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="mt-3 flex items-center justify-center gap-2 text-green-600"
            >
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Mission accomplie!</span>
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProgressDashboard;
