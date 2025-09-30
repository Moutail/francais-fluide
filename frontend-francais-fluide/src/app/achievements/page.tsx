'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import { Trophy, Star, Target, Calendar, Search, Lock, CheckCircle } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'exercises' | 'words' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  requirement: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function AchievementsPage() {
  const { isAuthenticated, loading } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Rediriger les utilisateurs non connectés
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  // Charger les succès
  useEffect(() => {
    if (isAuthenticated) {
      loadAchievements();
    }
  }, [isAuthenticated]);

  const loadAchievements = async () => {
    setIsLoading(true);
    try {
      // Simulation de chargement de données
      const mockAchievements: Achievement[] = [
        {
          id: 'first-steps',
          name: 'Premiers pas',
          description: 'Complétez votre premier exercice',
          icon: '👶',
          category: 'exercises',
          difficulty: 'easy',
          points: 10,
          unlocked: true,
          unlockedAt: '2024-01-15',
          progress: 100,
          requirement: 1,
          rarity: 'common',
        },
        {
          id: 'streak-7',
          name: 'Série de 7 jours',
          description: 'Pratiquez 7 jours consécutifs',
          icon: '🔥',
          category: 'streak',
          difficulty: 'medium',
          points: 50,
          unlocked: true,
          unlockedAt: '2024-01-21',
          progress: 100,
          requirement: 7,
          rarity: 'rare',
        },
        {
          id: 'words-1000',
          name: 'Mille mots',
          description: 'Écrivez 1000 mots au total',
          icon: '📝',
          category: 'words',
          difficulty: 'easy',
          points: 25,
          unlocked: true,
          unlockedAt: '2024-01-18',
          progress: 100,
          requirement: 1000,
          rarity: 'common',
        },
        {
          id: 'accuracy-90',
          name: 'Précision 90%',
          description: 'Atteignez 90% de précision sur 10 exercices',
          icon: '🎯',
          category: 'accuracy',
          difficulty: 'hard',
          points: 100,
          unlocked: true,
          unlockedAt: '2024-01-20',
          progress: 100,
          requirement: 10,
          rarity: 'epic',
        },
        {
          id: 'streak-30',
          name: 'Série de 30 jours',
          description: 'Pratiquez 30 jours consécutifs',
          icon: '💎',
          category: 'streak',
          difficulty: 'legendary',
          points: 500,
          unlocked: false,
          progress: 12,
          requirement: 30,
          rarity: 'legendary',
        },
        {
          id: 'words-10000',
          name: 'Dix mille mots',
          description: 'Écrivez 10000 mots au total',
          icon: '📚',
          category: 'words',
          difficulty: 'hard',
          points: 200,
          unlocked: false,
          progress: 65,
          requirement: 10000,
          rarity: 'epic',
        },
        {
          id: 'perfect-week',
          name: 'Semaine parfaite',
          description: '100% de précision pendant 7 jours',
          icon: '⭐',
          category: 'accuracy',
          difficulty: 'legendary',
          points: 1000,
          unlocked: false,
          progress: 0,
          requirement: 7,
          rarity: 'legendary',
        },
        {
          id: 'early-bird',
          name: 'Lève-tôt',
          description: 'Pratiquez avant 8h du matin pendant 5 jours',
          icon: '🌅',
          category: 'special',
          difficulty: 'medium',
          points: 75,
          unlocked: false,
          progress: 2,
          requirement: 5,
          rarity: 'rare',
        },
      ];

      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Erreur lors du chargement des succès:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-orange-600 bg-orange-100';
      case 'legendary':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300';
      case 'rare':
        return 'border-blue-300';
      case 'epic':
        return 'border-purple-300';
      case 'legendary':
        return 'border-yellow-300';
      default:
        return 'border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streak':
        return '🔥';
      case 'accuracy':
        return '🎯';
      case 'exercises':
        return '📚';
      case 'words':
        return '📝';
      case 'special':
        return '⭐';
      default:
        return '🏆';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch =
      achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' || achievement.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-3">
              <Trophy className="size-8 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Succès</h1>
              <p className="text-gray-600">Débloquez des succès et montrez vos progrès</p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Succès débloqués</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {unlockedCount}/{achievements.length}
                  </p>
                </div>
                <div className="rounded-lg bg-green-100 p-3">
                  <CheckCircle className="size-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Points totaux</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPoints}</p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3">
                  <Star className="size-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progression</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round((unlockedCount / achievements.length) * 100)}%
                  </p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3">
                  <Target className="size-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un succès..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="streak">Séries</option>
              <option value="accuracy">Précision</option>
              <option value="exercises">Exercices</option>
              <option value="words">Mots</option>
              <option value="special">Spéciaux</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les difficultés</option>
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
              <option value="legendary">Légendaire</option>
            </select>
          </div>
        </div>

        {/* Liste des succès */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Chargement des succès...</p>
            </div>
          </div>
        ) : filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAchievements.map(achievement => (
              <div
                key={achievement.id}
                className={`rounded-xl border-2 bg-white p-6 shadow-sm transition-all ${
                  achievement.unlocked
                    ? `${getRarityColor(achievement.rarity)} hover:shadow-md`
                    : 'border-gray-200 opacity-75'
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.unlocked ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="size-5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-400">
                      <Lock className="size-5" />
                    </div>
                  )}
                </div>

                <div className="mb-4 flex items-center gap-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyColor(achievement.difficulty)}`}
                  >
                    {achievement.difficulty === 'easy'
                      ? 'Facile'
                      : achievement.difficulty === 'medium'
                        ? 'Moyen'
                        : achievement.difficulty === 'hard'
                          ? 'Difficile'
                          : 'Légendaire'}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Star className="size-4" />
                    <span className="text-sm">{achievement.points} pts</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <span className="text-sm">{getCategoryIcon(achievement.category)}</span>
                  </div>
                </div>

                {achievement.unlocked ? (
                  <div className="text-sm text-green-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      Débloqué le {new Date(achievement.unlockedAt!).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Progression</span>
                      <span>
                        {achievement.progress}/{achievement.requirement}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                        style={{
                          width: `${(achievement.progress! / achievement.requirement) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Trophy className="mx-auto mb-4 size-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Aucun succès trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
