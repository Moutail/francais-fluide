'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { exerciseBank, TEXT_CATEGORIES, COMMON_TRAPS } from '@/data/exercises-bank';
import type { Exercise, ExerciseType, Difficulty, UserProfile } from '@/types';

interface ExerciseSelectorProps {
  userProfile: UserProfile;
  onSelectExercise: (exercise: Exercise) => void;
  onGenerateAdaptive: () => void;
}

export default function ExerciseSelector({
  userProfile,
  onSelectExercise,
  onGenerateAdaptive
}: ExerciseSelectorProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ExerciseType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  // Filtrer les exercices
  useEffect(() => {
    let exercises = exerciseBank.exercises;

    if (selectedDifficulty !== 'all') {
      exercises = exercises.filter(ex => ex.difficulty === selectedDifficulty);
    }

    if (selectedType !== 'all') {
      exercises = exercises.filter(ex => ex.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      exercises = exercises.filter(ex => ex.category === selectedCategory);
    }

    if (searchQuery) {
      exercises = exerciseBank.search(searchQuery);
    }

    setFilteredExercises(exercises);
  }, [selectedDifficulty, selectedType, selectedCategory, searchQuery]);

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const typeIcons = {
    grammar: '📝',
    vocabulary: '📚',
    writing: '✍️',
    comprehension: '📖',
    listening: '🎧'
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choisissez un Exercice
        </h1>
        <p className="text-gray-600">
          Sélectionnez un exercice adapté à votre niveau ou laissez-nous vous en proposer un adaptatif.
        </p>
      </div>

      {/* Filtres */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un exercice..."
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Difficulté */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulté
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | 'all')}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Tous les niveaux</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ExerciseType | 'all')}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Tous les types</option>
              <option value="grammar">Grammaire</option>
              <option value="vocabulary">Vocabulaire</option>
              <option value="writing">Écriture</option>
              <option value="comprehension">Compréhension</option>
              <option value="listening">Écoute</option>
            </select>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Toutes les catégories</option>
              <option value={TEXT_CATEGORIES.LITERATURE}>Littérature</option>
              <option value={TEXT_CATEGORIES.NEWS}>Actualité</option>
              <option value={TEXT_CATEGORIES.PROFESSIONAL}>Professionnel</option>
              <option value={TEXT_CATEGORIES.ACADEMIC}>Académique</option>
              <option value={TEXT_CATEGORIES.CONVERSATIONAL}>Conversationnel</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Actions rapides */}
      <div className="flex gap-4 mb-8">
        <Button
          onClick={onGenerateAdaptive}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          🎯 Exercice Adaptatif
        </Button>
        <Button
          onClick={() => {
            setSelectedDifficulty('all');
            setSelectedType('all');
            setSelectedCategory('all');
            setSearchQuery('');
          }}
          variant="outline"
          className="px-6 py-3 rounded-lg"
        >
          🔄 Réinitialiser
        </Button>
      </div>

      {/* Liste des exercices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-6 h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onSelectExercise(exercise)}>
              {/* En-tête */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{typeIcons[exercise.type]}</span>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {exercise.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {exercise.description}
                    </p>
                  </div>
                </div>
                <Badge className={difficultyColors[exercise.difficulty]}>
                  {exercise.difficulty}
                </Badge>
              </div>

              {/* Contenu */}
              <div className="flex-1 mb-4">
                <p className="text-gray-700 text-sm mb-3">
                  {exercise.content.instructions}
                </p>
                
                {/* Tags */}
                {exercise.tags && exercise.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {exercise.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Statistiques */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>⏱️ {exercise.estimatedTime} min</span>
                  <span>📝 {exercise.questions.length} questions</span>
                  <span>🏆 {exercise.scoring.maxPoints} pts</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectExercise(exercise);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Commencer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Afficher les détails
                  }}
                >
                  ℹ️
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Message si aucun exercice */}
      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun exercice trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Essayez de modifier vos critères de recherche.
          </p>
          <Button
            onClick={() => {
              setSelectedDifficulty('all');
              setSelectedType('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            variant="outline"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
