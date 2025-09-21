'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import type { UserProfile, ExerciseResult, ProgressData } from '@/types';

// Données mockées pour les tests
const mockUserProfile: UserProfile = {
  id: 'user-1',
  name: 'Utilisateur Test',
  email: 'test@example.com',
  level: 'intermediate',
  weaknesses: [],
  strengths: [],
  preferences: {
    difficulty: 'intermediate',
    exerciseTypes: ['grammar', 'vocabulary'],
    realTimeCorrection: true,
    soundEffects: true,
    animations: true,
    notifications: true
  },
  statistics: {
    totalWords: 0,
    totalErrors: 0,
    totalCorrections: 0,
    accuracyRate: 0,
    dailyStreak: 0,
    bestStreak: 0,
    totalPracticeTime: 0,
    lastPracticeDate: new Date(),
    progressByCategory: {},
    completedExercises: 0,
    xp: 0,
    nextLevelXp: 1000
  }
};

// Générer des données d'exercices mockées
const generateMockExerciseResults = (): ExerciseResult[] => {
  const results: ExerciseResult[] = [];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    const baseScore = 60 + Math.random() * 30;
    const improvement = Math.min(20, daysAgo * 0.2); // Amélioration au fil du temps
    const score = Math.min(100, baseScore + improvement);
    
    results.push({
      exerciseId: `exercise-${i}`,
      score: Math.round(score),
      maxScore: 100,
      timeSpent: 120 + Math.random() * 300, // 2-7 minutes
      answers: Array.from({ length: 5 }, (_, j) => ({
        questionId: `q-${j}`,
        answer: `Answer ${j}`,
        isCorrect: Math.random() > 0.3, // 70% de réussite
        timeSpent: 10 + Math.random() * 30
      })),
      completedAt: date.toISOString(),
      accuracy: Math.min(1, 0.6 + Math.random() * 0.3 + improvement / 100)
    });
  }
  
  return results.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
};

// Générer des données de progression mockées
const generateMockProgressData = (): ProgressData[] => {
  const data: ProgressData[] = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    data.push({
      userId: 'user-1',
      exerciseId: `exercise-${i}`,
      score: 70 + Math.random() * 25,
      timeSpent: 180 + Math.random() * 240,
      completedAt: date,
      errors: ['Conjugaison', 'Accords', 'Vocabulaire'].slice(0, Math.floor(Math.random() * 3)),
      improvements: ['Précision', 'Vitesse'].slice(0, Math.floor(Math.random() * 2))
    });
  }
  
  return data;
};

export default function AnalyticsPage() {
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Générer les données mockées
  const generateMockData = () => {
    setIsGenerating(true);
    
    // Simuler un délai de génération
    setTimeout(() => {
      setExerciseResults(generateMockExerciseResults());
      setProgressData(generateMockProgressData());
      setIsGenerating(false);
    }, 1000);
  };

  // Générer les données au montage
  useEffect(() => {
    generateMockData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard Analytique
          </h1>
          <p className="text-gray-600 text-lg">
            Analysez vos performances et progressez dans l'apprentissage du français
          </p>
        </div>

        {/* Contrôles */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Données de Test
              </h3>
              <p className="text-sm text-gray-600">
                {exerciseResults.length} exercices • {progressData.length} entrées de progression
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={generateMockData}
                disabled={isGenerating}
                variant="outline"
              >
                {isGenerating ? 'Génération...' : '🔄 Régénérer les données'}
              </Button>
              
              <Button
                onClick={() => {
                  setExerciseResults([]);
                  setProgressData([]);
                }}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                🗑️ Effacer les données
              </Button>
            </div>
          </div>
        </Card>

        {/* Dashboard principal */}
        <AnalyticsDashboard
          userProfile={mockUserProfile}
          exerciseResults={exerciseResults}
          progressData={progressData}
        />

        {/* Informations sur les fonctionnalités */}
        <Card className="p-6 mt-8 bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            🎯 Fonctionnalités du Dashboard
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">📊 Vue d'ensemble</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Métriques principales</li>
                <li>• Score d'engagement</li>
                <li>• Pattern d'apprentissage</li>
                <li>• Recommandations</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">📈 Progression</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Courbes de progression</li>
                <li>• Évolution des scores</li>
                <li>• Tendance de précision</li>
                <li>• Prédictions</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">❌ Analyse d'erreurs</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Distribution par catégorie</li>
                <li>• Tendances d'erreurs</li>
                <li>• Sévérité des problèmes</li>
                <li>• Détail des faiblesses</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">📅 Activité</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Calendrier d'activité</li>
                <li>• Heatmap des sessions</li>
                <li>• Patterns de pratique</li>
                <li>• Régularité</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Comparaison</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Radar de compétences</li>
                <li>• Comparaison avec la moyenne</li>
                <li>• Classement</li>
                <li>• Objectifs</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🔧 Calculs avancés</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Détection de patterns</li>
                <li>• Score de régularité</li>
                <li>• Prédictions ML</li>
                <li>• Recommandations IA</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Instructions de test */}
        <Card className="p-6 mt-8 bg-yellow-50">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            📋 Instructions de Test
          </h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>1. <strong>Générez des données</strong> en cliquant sur "Régénérer les données"</p>
            <p>2. <strong>Explorez les onglets</strong> pour voir différents types d'analyses</p>
            <p>3. <strong>Changez la période</strong> pour voir l'évolution des données</p>
            <p>4. <strong>Observez les animations</strong> et interactions des graphiques</p>
            <p>5. <strong>Testez la responsivité</strong> en redimensionnant la fenêtre</p>
            <p>6. <strong>Analysez les patterns</strong> d'apprentissage détectés</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
