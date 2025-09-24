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
  Calendar
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
      icon: FileText
    },
    {
      title: 'Précision',
      value: `${data.accuracy}%`,
      change: { value: `+${data.monthlyProgress}% ce mois`, type: 'positive' as const },
      icon: Target
    },
    {
      title: 'Exercices complétés',
      value: data.exercisesCompleted.toString(),
      change: { value: '3 cette semaine', type: 'neutral' as const },
      icon: CheckCircle
    },
    {
      title: 'Série actuelle',
      value: `${data.currentStreak} jours`,
      change: { value: 'Record: 15 jours', type: 'neutral' as const },
      icon: Calendar
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(data.weeklyProgress, 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-green-600" />
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
                <span className="text-sm font-medium text-gray-900">{data.averageSessionTime} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sessions totales</span>
                <span className="text-sm font-medium text-gray-900">{data.totalSessions}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Temps total: {Math.round((data.averageSessionTime * data.totalSessions) / 60)}h</span>
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
              <h4 className="text-lg font-medium text-gray-900 mb-4">Objectifs mensuels</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mots écrits (objectif: 5000)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {data.wordsWritten} / 5000
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((data.wordsWritten / 5000) * 100, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exercices (objectif: 20)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {data.exercisesCompleted} / 20
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((data.exercisesCompleted / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Recommandations</h4>
              <div className="space-y-2">
                {data.accuracy < 80 && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <Target className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Améliorez votre précision
                      </p>
                      <p className="text-xs text-yellow-700">
                        Concentrez-vous sur les exercices de grammaire pour augmenter votre taux de précision.
                      </p>
                    </div>
                  </div>
                )}
                
                {data.currentStreak < 7 && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Maintenez votre série
                      </p>
                      <p className="text-xs text-blue-700">
                        Essayez de pratiquer quotidiennement pour maintenir une série régulière.
                      </p>
                    </div>
                  </div>
                )}
                
                {data.weeklyProgress >= 80 && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Excellent travail !
                      </p>
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
