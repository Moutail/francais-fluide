'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import AchievementCard from './AchievementCard';
import { 
  Trophy, 
  Filter,
  CheckCircle,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'words_written' | 'exercises_completed' | 'streak' | 'level' | 'accuracy';
  threshold: number;
  icon?: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
}

interface AchievementsGridProps {
  achievements: Achievement[];
  currentProgress?: {
    words_written: number;
    exercises_completed: number;
    streak: number;
    level: number;
    accuracy: number;
  };
  stats?: {
    total: number;
    earned: number;
    remaining: number;
    progress: number;
  };
  onAchievementClick?: (achievement: Achievement) => void;
  loading?: boolean;
}

export default function AchievementsGrid({ 
  achievements, 
  currentProgress,
  stats,
  onAchievementClick,
  loading = false 
}: AchievementsGridProps) {
  
  const [filter, setFilter] = useState<'all' | 'earned' | 'available' | string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'progress' | 'earned'>('type');

  const typeLabels = {
    words_written: 'Mots écrits',
    exercises_completed: 'Exercices',
    streak: 'Série',
    level: 'Niveau',
    accuracy: 'Précision'
  };

  const filterOptions = [
    { value: 'all', label: 'Tous', icon: Trophy },
    { value: 'earned', label: 'Obtenus', icon: CheckCircle },
    { value: 'available', label: 'Disponibles', icon: Clock },
    ...Object.entries(typeLabels).map(([key, label]) => ({
      value: key,
      label,
      icon: TrendingUp
    }))
  ];

  const sortOptions = [
    { value: 'type', label: 'Par type' },
    { value: 'name', label: 'Par nom' },
    { value: 'progress', label: 'Par progression' },
    { value: 'earned', label: 'Par statut' }
  ];

  const getFilteredAchievements = () => {
    let filtered = achievements;

    // Appliquer le filtre
    switch (filter) {
      case 'earned':
        filtered = achievements.filter(a => a.earned);
        break;
      case 'available':
        filtered = achievements.filter(a => !a.earned);
        break;
      case 'all':
        break;
      default:
        // Filtrer par type
        if (Object.keys(typeLabels).includes(filter)) {
          filtered = achievements.filter(a => a.type === filter);
        }
    }

    // Appliquer le tri
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type) || a.threshold - b.threshold;
        case 'progress':
          const aProgress = a.earned ? 100 : (currentProgress ? 
            Math.min(100, (currentProgress[a.type] / a.threshold) * 100) : 0);
          const bProgress = b.earned ? 100 : (currentProgress ? 
            Math.min(100, (currentProgress[b.type] / b.threshold) * 100) : 0);
          return bProgress - aProgress;
        case 'earned':
          if (a.earned && !b.earned) return -1;
          if (!a.earned && b.earned) return 1;
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const filteredAchievements = getFilteredAchievements();

  // Grouper par type pour l'affichage
  const achievementsByType = filteredAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.type]) {
      acc[achievement.type] = [];
    }
    acc[achievement.type].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton pour les statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
        
        {/* Skeleton pour la grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.earned}</div>
                <div className="text-sm text-gray-600">Obtenus</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.remaining}</div>
                <div className="text-sm text-gray-600">Restants</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.progress}%</div>
                <div className="text-sm text-gray-600">Progression</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filtres et tri */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  variant={filter === option.value ? "primary" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Grille des achievements */}
      {filteredAchievements.length === 0 ? (
        <Card className="p-8 text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun succès trouvé
          </h3>
          <p className="text-gray-600">
            Essayez de changer les filtres ou continuez à utiliser l'application pour débloquer de nouveaux succès !
          </p>
        </Card>
      ) : sortBy === 'type' ? (
        // Affichage groupé par type
        <div className="space-y-8">
          {Object.entries(achievementsByType).map(([type, typeAchievements]) => (
            <div key={type}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">
                  {type === 'words_written' && '✍️'}
                  {type === 'exercises_completed' && '📚'}
                  {type === 'streak' && '🔥'}
                  {type === 'level' && '⭐'}
                  {type === 'accuracy' && '🎯'}
                </span>
                {typeLabels[type as keyof typeof typeLabels]}
                <span className="text-sm font-normal text-gray-500">
                  ({typeAchievements.length})
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeAchievements.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    currentValue={currentProgress?.[achievement.type]}
                    showProgress={true}
                    onClick={() => onAchievementClick?.(achievement)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Affichage en grille simple
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              currentValue={currentProgress?.[achievement.type]}
              showProgress={true}
              onClick={() => onAchievementClick?.(achievement)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
