// src/components/analytics/ProfessionalStats.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/professional/Card';
import { MetricCard } from '@/components/ui/professional/MetricCard';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Target,
  Clock,
  CheckCircle,
  BarChart3,
  Calendar,
} from 'lucide-react';

interface ProfessionalStatsProps {
  data: {
    wordsWritten: number;
    accuracy: number;
    exercisesCompleted: number;
    currentStreak: number;
    weeklyProgress: number;
    monthlyProgress: number;
    averageSessionTime: number;
    totalSessions: number;
  };
}

export const ProfessionalStats: React.FC<ProfessionalStatsProps> = ({ data }) => {
  const stats = [
    {
      title: 'Mots écrits',
      value: data.wordsWritten.toLocaleString(),
      change: { value: `+${data.weeklyProgress}% cette semaine`, type: 'positive' as const },
      icon: FileText,
    },
    {
      title: 'Précision',
      value: `${data.accuracy}%`,
      change: { value: `+${data.monthlyProgress}% ce mois`, type: 'positive' as const },
      icon: Target,
    },
    {
      title: 'Exercices complétés',
      value: data.exercisesCompleted.toString(),
      change: { value: '3 cette semaine', type: 'neutral' as const },
      icon: CheckCircle,
    },
    {
      title: 'Série actuelle',
      value: `${data.currentStreak} jours`,
      change: { value: 'Record: 15 jours', type: 'neutral' as const },
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <MetricCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Graphiques et analyses détaillées */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Progression hebdomadaire */}
        <Card>
          <CardHeader>
            <CardTitle>Progression hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cette semaine</span>
                <span className="text-sm font-medium text-gray-900">{data.weeklyProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${Math.min(data.weeklyProgress, 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>+{data.weeklyProgress}% par rapport à la semaine dernière</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temps de session */}
        <Card>
          <CardHeader>
            <CardTitle>Temps de session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Moyenne par session</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.averageSessionTime} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sessions totales</span>
                <span className="text-sm font-medium text-gray-900">{data.totalSessions}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>
                  Temps total: {Math.round((data.averageSessionTime * data.totalSessions) / 60)}h
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse de performance */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse de performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Objectifs */}
            <div>
              <h4 className="mb-4 text-lg font-medium text-gray-900">Objectifs mensuels</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mots écrits (objectif: 5000)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {data.wordsWritten} / 5000
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-600 transition-all duration-300"
                    style={{ width: `${Math.min((data.wordsWritten / 5000) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exercices (objectif: 20)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {data.exercisesCompleted} / 20
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.min((data.exercisesCompleted / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div>
              <h4 className="mb-4 text-lg font-medium text-gray-900">Recommandations</h4>
              <div className="space-y-2">
                {data.accuracy < 80 && (
                  <div className="flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                    <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Améliorez votre précision
                      </p>
                      <p className="text-xs text-yellow-700">
                        Concentrez-vous sur les exercices de grammaire pour augmenter votre taux de
                        précision.
                      </p>
                    </div>
                  </div>
                )}

                {data.currentStreak < 7 && (
                  <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3">
                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Maintenez votre série</p>
                      <p className="text-xs text-blue-700">
                        Essayez de pratiquer quotidiennement pour maintenir une série régulière.
                      </p>
                    </div>
                  </div>
                )}

                {data.weeklyProgress >= 80 && (
                  <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Excellent travail !</p>
                      <p className="text-xs text-green-700">
                        Vous progressez bien cette semaine. Continuez ainsi !
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
