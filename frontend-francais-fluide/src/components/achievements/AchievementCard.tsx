'use client';

import React from 'react';
import { Card } from '@/components/ui/professional/Card';
import { CheckCircle, Lock, Trophy, Calendar, TrendingUp } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'words_written' | 'exercises_completed' | 'streak' | 'level' | 'accuracy';
  threshold: number;
  icon?: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number; // Pourcentage de progression (0-100)
}

interface AchievementCardProps {
  achievement: Achievement;
  currentValue?: number;
  showProgress?: boolean;
  onClick?: () => void;
}

export default function AchievementCard({
  achievement,
  currentValue,
  showProgress = false,
  onClick,
}: AchievementCardProps) {
  const typeLabels = {
    words_written: 'Mots écrits',
    exercises_completed: 'Exercices',
    streak: 'Série',
    level: 'Niveau',
    accuracy: 'Précision',
  };

  const typeIcons = {
    words_written: '✍️',
    exercises_completed: '📚',
    streak: '🔥',
    level: '⭐',
    accuracy: '🎯',
  };

  const getProgressPercentage = () => {
    if (achievement.earned) return 100;
    if (currentValue === undefined) return achievement.progress || 0;
    return Math.min(100, Math.round((currentValue / achievement.threshold) * 100));
  };

  const progressPercentage = getProgressPercentage();
  const displayIcon = achievement.icon || typeIcons[achievement.type];

  const formatEarnedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCardStyle = () => {
    if (achievement.earned) {
      return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 shadow-md';
    }
    return 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm';
  };

  const getProgressBarColor = () => {
    if (achievement.earned) return 'bg-yellow-500';
    if (progressPercentage >= 80) return 'bg-green-500';
    if (progressPercentage >= 50) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  return (
    <Card
      className={`cursor-pointer p-4 transition-all duration-200 ${getCardStyle()}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icône */}
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl ${achievement.earned ? 'bg-yellow-200' : 'bg-gray-100'} `}
        >
          {achievement.earned ? (
            <div className="relative">
              <span>{displayIcon}</span>
              <CheckCircle className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white text-green-600" />
            </div>
          ) : (
            <div className="relative">
              <span className="opacity-50">{displayIcon}</span>
              <Lock className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white text-gray-400" />
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3
              className={`truncate font-semibold ${
                achievement.earned ? 'text-yellow-800' : 'text-gray-900'
              }`}
            >
              {achievement.name}
            </h3>
            {achievement.earned && <Trophy className="h-4 w-4 flex-shrink-0 text-yellow-600" />}
          </div>

          <p className={`mb-2 text-sm ${achievement.earned ? 'text-yellow-700' : 'text-gray-600'}`}>
            {achievement.description}
          </p>

          {/* Informations sur le seuil */}
          <div className="mb-2 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="font-medium">{typeLabels[achievement.type]}:</span>
              {achievement.threshold}
              {achievement.type === 'accuracy' && '%'}
            </span>

            {currentValue !== undefined && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">Actuel:</span>
                {currentValue}
                {achievement.type === 'accuracy' && '%'}
              </span>
            )}
          </div>

          {/* Barre de progression */}
          {showProgress && (
            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>Progression</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Date d'obtention */}
          {achievement.earned && achievement.earnedAt && (
            <div className="flex items-center gap-1 text-xs text-yellow-600">
              <Calendar className="h-3 w-3" />
              <span>Obtenu le {formatEarnedDate(achievement.earnedAt)}</span>
            </div>
          )}

          {/* Progression restante */}
          {!achievement.earned && currentValue !== undefined && (
            <div className="text-xs text-gray-500">
              Plus que {achievement.threshold - currentValue} pour débloquer
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
