'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExerciseSelector from '@/components/exercises/ExerciseSelector';
import ExercisePlayer from '@/components/exercises/ExercisePlayer';
import { Card, Button, Badge } from '@/components/ui';
import { exerciseGamification } from '@/lib/exercises/gamification';
import { exerciseGenerator } from '@/lib/exercises/generator';
import type { Exercise, ExerciseResult, UserProfile, ExerciseStats } from '@/types';

// Mock user profile - à remplacer par les vraies données
const mockUserProfile: UserProfile = {
  id: 'user-1',
  name: 'Utilisateur Test',
  email: 'test@example.com',
  level: 'intermediate',
  preferences: {
    difficulty: 'intermediate',
    exerciseTypes: ['grammar', 'vocabulary'],
    notifications: true
  },
  statistics: {
    totalExercises: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    bestStreak: 0,
    accuracyRate: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 1000
  }
};

export default function ExercisesPage() {
  const [currentView, setCurrentView] = useState<'selector' | 'player'>('selector');
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats>({
    totalExercises: 0,
    completedExercises: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    bestStreak: 0,
    accuracyRate: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 1000
  });
  const [recentResults, setRecentResults] = useState<ExerciseResult[]>([]);

  // Charger les statistiques depuis le localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('exercise-stats');
    if (savedStats) {
      setExerciseStats(JSON.parse(savedStats));
    }

    const savedResults = localStorage.getItem('exercise-results');
    if (savedResults) {
      setRecentResults(JSON.parse(savedResults));
    }
  }, []);

  // Sauvegarder les statistiques
  const saveStats = (newStats: ExerciseStats) => {
    setExerciseStats(newStats);
    localStorage.setItem('exercise-stats', JSON.stringify(newStats));
  };

  // Sauvegarder les résultats
  const saveResults = (newResults: ExerciseResult[]) => {
    setRecentResults(newResults);
    localStorage.setItem('exercise-results', JSON.stringify(newResults));
  };

  // Sélectionner un exercice
  const handleSelectExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setCurrentView('player');
  };

  // Générer un exercice adaptatif
  const handleGenerateAdaptive = () => {
    const adaptiveExercise = exerciseGenerator.generateAdaptiveExercise(
      mockUserProfile,
      undefined,
      exerciseGamification.calculateRecommendedDifficulty(exerciseStats)
    );
    setCurrentExercise(adaptiveExercise);
    setCurrentView('player');
  };

  // Compléter un exercice
  const handleCompleteExercise = (result: ExerciseResult) => {
    // Mettre à jour les statistiques
    const newStats = exerciseGamification.updateExerciseStats(
      exerciseStats,
      result,
      currentExercise?.difficulty || 'beginner'
    );
    saveStats(newStats);

    // Ajouter le résultat
    const newResults = [result, ...recentResults].slice(0, 10); // Garder les 10 derniers
    saveResults(newResults);

    // Vérifier les achievements
    const achievements = exerciseGamification.checkAchievements(newStats, result);
    if (achievements.length > 0) {
      // Afficher les achievements (à implémenter)
      console.log('Nouveaux achievements:', achievements);
    }

    // Retourner à la sélection
    setCurrentView('selector');
    setCurrentExercise(null);
  };

  // Passer un exercice
  const handleSkipExercise = () => {
    setCurrentView('selector');
    setCurrentExercise(null);
  };

  // Rendu du sélecteur d'exercices
  const renderSelector = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Statistiques utilisateur */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{exerciseStats.level}</div>
            <div className="text-sm text-gray-600">Niveau</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{exerciseStats.xp}</div>
            <div className="text-sm text-gray-600">XP</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{exerciseStats.currentStreak}</div>
            <div className="text-sm text-gray-600">Série</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(exerciseStats.accuracyRate * 100)}%
            </div>
            <div className="text-sm text-gray-600">Précision</div>
          </div>
        </div>
        
        {/* Barre de progression XP */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progression vers le niveau {exerciseStats.level + 1}</span>
            <span>{exerciseStats.xp} / {exerciseStats.nextLevelXp}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(exerciseStats.xp / exerciseStats.nextLevelXp) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </Card>

      <ExerciseSelector
        userProfile={mockUserProfile}
        onSelectExercise={handleSelectExercise}
        onGenerateAdaptive={handleGenerateAdaptive}
      />
    </motion.div>
  );

  // Rendu du lecteur d'exercices
  const renderPlayer = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {currentExercise && (
        <ExercisePlayer
          exercise={currentExercise}
          onComplete={handleCompleteExercise}
          onSkip={handleSkipExercise}
          mode="practice"
          showHints={true}
        />
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Exercices</h1>
              <p className="text-gray-600">
                Améliorez votre français avec des exercices adaptatifs
              </p>
            </div>
            
            {currentView === 'player' && (
              <Button
                onClick={handleSkipExercise}
                variant="outline"
                className="flex items-center gap-2"
              >
                ← Retour à la sélection
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'selector' ? renderSelector() : renderPlayer()}
        </AnimatePresence>
      </div>
    </div>
  );
}