// src/components/progress/ProfessionalProgress.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  Clock,
  BookOpen,
  FileText,
  BarChart3,
} from 'lucide-react';

interface ProfessionalProgressProps {
  data: {
    currentLevel: number;
    totalXP: number;
    xpToNextLevel: number;
    weeklyGoal: number;
    weeklyProgress: number;
    monthlyGoal: number;
    monthlyProgress: number;
    streak: number;
    longestStreak: number;
    achievements: Array<{
      id: string;
      name: string;
      description: string;
      unlocked: boolean;
      icon: string;
    }>;
    recentActivities: Array<{
      id: string;
      type: string;
      description: string;
      date: string;
      xp: number;
    }>;
  };
}

export const ProfessionalProgress: React.FC<ProfessionalProgressProps> = ({ data }) => {
  const levelProgress = ((data.totalXP % 1000) / 1000) * 100;
  const weeklyProgressPercent = (data.weeklyProgress / data.weeklyGoal) * 100;
  const monthlyProgressPercent = (data.monthlyProgress / data.monthlyGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Niveau et progression */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Niveau actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-600">{data.currentLevel}</div>
              <div className="mb-4 text-sm text-gray-600">{data.totalXP} XP total</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{Math.round(levelProgress)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {data.xpToNextLevel} XP jusqu'au niveau suivant
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objectif hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progression</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.weeklyProgress} / {data.weeklyGoal}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-600 transition-all duration-300"
                  style={{ width: `${Math.min(weeklyProgressPercent, 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="size-4" />
                <span>
                  {weeklyProgressPercent >= 100
                    ? 'Objectif atteint !'
                    : `${Math.round(weeklyProgressPercent)}% complété`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Série actuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-orange-600">{data.streak}</div>
                <div className="mb-4 text-sm text-gray-600">jours consécutifs</div>
              </div>
              <div className="text-center text-xs text-gray-500">
                Record: {data.longestStreak} jours
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Objectifs mensuels */}
      <Card>
        <CardHeader>
          <CardTitle>Objectifs mensuels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Exercices complétés</span>
                  <span className="text-sm text-gray-600">
                    {data.monthlyProgress} / {data.monthlyGoal}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.min(monthlyProgressPercent, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Mots écrits</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(data.monthlyProgress * 1.5)} / {data.monthlyGoal * 2}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-purple-600 transition-all duration-300"
                    style={{
                      width: `${Math.min(((data.monthlyProgress * 1.5) / (data.monthlyGoal * 2)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Succès et activités récentes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Succès */}
        <Card>
          <CardHeader>
            <CardTitle>Succès récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.achievements.slice(0, 5).map(achievement => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 rounded-lg p-3 ${
                    achievement.unlocked
                      ? 'border border-green-200 bg-green-50'
                      : 'border border-gray-200 bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex size-8 items-center justify-center rounded-full ${
                      achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <Award
                      className={`size-4 ${
                        achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-sm font-medium ${
                        achievement.unlocked ? 'text-green-900' : 'text-gray-500'
                      }`}
                    >
                      {achievement.name}
                    </h4>
                    <p
                      className={`text-xs ${
                        achievement.unlocked ? 'text-green-700' : 'text-gray-400'
                      }`}
                    >
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activités récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivities.slice(0, 5).map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                    {activity.type === 'exercise' && <BookOpen className="size-4 text-blue-600" />}
                    {activity.type === 'writing' && <FileText className="size-4 text-blue-600" />}
                    {activity.type === 'analysis' && (
                      <BarChart3 className="size-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{activity.description}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="size-3" />
                      <span>{activity.date}</span>
                      <span>•</span>
                      <span>+{activity.xp} XP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
