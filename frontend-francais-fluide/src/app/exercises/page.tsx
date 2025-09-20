'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, Button, Badge } from '@/components/ui';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Target, 
  Play, 
  CheckCircle, 
  Lock,
  Filter,
  Search,
  SortAsc,
  Trophy,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import type { Exercise, ExerciseType, Difficulty } from '@/types';

// Données mockées pour les exercices
const mockExercises: Exercise[] = [
  {
    id: '1',
    title: 'Accord des adjectifs',
    description: 'Maîtrisez l\'accord des adjectifs avec les noms masculins et féminins',
    type: 'grammar',
    difficulty: 'beginner',
    category: 'Grammaire',
    instructions: 'Complétez les phrases avec la forme correcte de l\'adjectif',
    content: {
      text: 'Le chat ___ (noir) dort sur le canapé ___ (confortable).',
      questions: [
        {
          id: 'q1',
          text: 'Complétez la première phrase',
          type: 'fill-in-the-blank',
          correctAnswer: 'noir'
        },
        {
          id: 'q2',
          text: 'Complétez la deuxième phrase',
          type: 'fill-in-the-blank',
          correctAnswer: 'confortable'
        }
      ]
    },
    points: 50,
    timeLimit: 10,
    isCompleted: true,
    completedAt: new Date('2024-01-15'),
    score: 95
  },
  {
    id: '2',
    title: 'Conjugaison du présent',
    description: 'Révisez la conjugaison des verbes réguliers au présent de l\'indicatif',
    type: 'grammar',
    difficulty: 'intermediate',
    category: 'Conjugaison',
    instructions: 'Conjuguez les verbes entre parenthèses au présent',
    content: {
      text: 'Je (manger) ___ une pomme. Tu (finir) ___ tes devoirs. Il (vendre) ___ sa voiture.',
      questions: [
        {
          id: 'q1',
          text: 'Conjuguez "manger"',
          type: 'fill-in-the-blank',
          correctAnswer: 'mange'
        },
        {
          id: 'q2',
          text: 'Conjuguez "finir"',
          type: 'fill-in-the-blank',
          correctAnswer: 'finis'
        },
        {
          id: 'q3',
          text: 'Conjuguez "vendre"',
          type: 'fill-in-the-blank',
          correctAnswer: 'vend'
        }
      ]
    },
    points: 75,
    timeLimit: 15,
    isCompleted: false
  },
  {
    id: '3',
    title: 'Vocabulaire de la cuisine',
    description: 'Apprenez le vocabulaire essentiel de la cuisine française',
    type: 'vocabulary',
    difficulty: 'beginner',
    category: 'Vocabulaire',
    instructions: 'Associez les mots à leurs définitions',
    content: {
      questions: [
        {
          id: 'q1',
          text: 'Qu\'est-ce qu\'un "économe" ?',
          type: 'multiple-choice',
          options: ['Un ustensile pour éplucher', 'Un appareil électrique', 'Une casserole'],
          correctAnswer: 'Un ustensile pour éplucher'
        },
        {
          id: 'q2',
          text: 'Que signifie "mijoter" ?',
          type: 'multiple-choice',
          options: ['Cuire à feu vif', 'Cuire doucement', 'Mélanger'],
          correctAnswer: 'Cuire doucement'
        }
      ]
    },
    points: 40,
    timeLimit: 8,
    isCompleted: false
  },
  {
    id: '4',
    title: 'Rédaction créative',
    description: 'Écrivez un paragraphe sur votre ville idéale',
    type: 'writing',
    difficulty: 'advanced',
    category: 'Expression écrite',
    instructions: 'Rédigez un paragraphe de 150-200 mots décrivant votre ville idéale',
    content: {
      text: 'Décrivez votre ville idéale en utilisant le vocabulaire approprié et en respectant la structure d\'un paragraphe.'
    },
    points: 100,
    timeLimit: 30,
    isCompleted: false
  },
  {
    id: '5',
    title: 'Compréhension orale',
    description: 'Écoutez et comprenez un dialogue de la vie quotidienne',
    type: 'listening',
    difficulty: 'intermediate',
    category: 'Compréhension',
    instructions: 'Écoutez le dialogue et répondez aux questions',
    content: {
      audioUrl: '/sounds/dialogue-restaurant.mp3',
      questions: [
        {
          id: 'q1',
          text: 'Où se déroule la conversation ?',
          type: 'multiple-choice',
          options: ['Au restaurant', 'À la maison', 'Au bureau'],
          correctAnswer: 'Au restaurant'
        }
      ]
    },
    points: 60,
    timeLimit: 12,
    isCompleted: false
  }
];

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const typeIcons = {
  grammar: BookOpen,
  vocabulary: Target,
  writing: Zap,
  comprehension: Play,
  listening: Play
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(mockExercises);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ExerciseType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'difficulty' | 'points' | 'title'>('difficulty');

  // Filtrage et recherche
  useEffect(() => {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(exercise => exercise.type === selectedType);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'points':
          return b.points - a.points;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredExercises(filtered);
  }, [exercises, searchTerm, selectedDifficulty, selectedType, sortBy]);

  const getDifficultyLabel = (difficulty: Difficulty) => {
    const labels = {
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé'
    };
    return labels[difficulty];
  };

  const getTypeLabel = (type: ExerciseType) => {
    const labels = {
      grammar: 'Grammaire',
      vocabulary: 'Vocabulaire',
      writing: 'Expression écrite',
      comprehension: 'Compréhension',
      listening: 'Écoute'
    };
    return labels[type];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 ml-64">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6"
          >
            {/* En-tête */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Exercices de français
              </h1>
              <p className="text-gray-600">
                Améliorez votre français avec nos exercices interactifs
              </p>
            </div>

            {/* Filtres et recherche */}
            <Card className="p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher un exercice..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les niveaux</option>
                    <option value="beginner">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="advanced">Avancé</option>
                  </select>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les types</option>
                    <option value="grammar">Grammaire</option>
                    <option value="vocabulary">Vocabulaire</option>
                    <option value="writing">Expression écrite</option>
                    <option value="comprehension">Compréhension</option>
                    <option value="listening">Écoute</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="difficulty">Trier par difficulté</option>
                    <option value="points">Trier par points</option>
                    <option value="title">Trier par titre</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Liste des exercices */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredExercises.map((exercise, index) => {
                  const TypeIcon = typeIcons[exercise.type];
                  const isCompleted = exercise.isCompleted;
                  
                  return (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <div className="p-6">
                          {/* En-tête de la carte */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <TypeIcon className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 line-clamp-2">
                                  {exercise.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {getTypeLabel(exercise.type)}
                                </p>
                              </div>
                            </div>

                            {isCompleted && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Terminé</span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {exercise.description}
                          </p>

                          {/* Métadonnées */}
                          <div className="flex items-center gap-4 mb-4">
                            <Badge
                              className={difficultyColors[exercise.difficulty]}
                            >
                              {getDifficultyLabel(exercise.difficulty)}
                            </Badge>

                            <div className="flex items-center gap-1 text-gray-500">
                              <Trophy className="w-4 h-4" />
                              <span className="text-sm">{exercise.points} pts</span>
                            </div>

                            {exercise.timeLimit && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{exercise.timeLimit}min</span>
                              </div>
                            )}
                          </div>

                          {/* Score si terminé */}
                          {isCompleted && exercise.score && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Score</span>
                                <span className="font-medium">{exercise.score}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${exercise.score}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Instructions */}
                          <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                            {exercise.instructions}
                          </p>

                          {/* Bouton d'action */}
                          <Link href={`/exercises/${exercise.id}`}>
                            <Button
                              className="w-full"
                              variant={isCompleted ? "outline" : "default"}
                            >
                              {isCompleted ? (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Recommencer
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Commencer
                                </>
                              )}
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Message si aucun exercice trouvé */}
            {filteredExercises.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun exercice trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche
                </p>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
