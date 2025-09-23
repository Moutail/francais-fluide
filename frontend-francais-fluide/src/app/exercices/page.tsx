// src/app/exercices/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  Clock, 
  Star,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  TrendingUp,
  Brain,
  Zap,
  Award
} from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import { useAuth } from '@/hooks/useApi';
import { cn } from '@/lib/utils/cn';

interface Exercise {
  id: string;
  title: string;
  type: 'grammar' | 'vocabulary' | 'conjugation' | 'spelling';
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  estimatedTime: number;
  completed: boolean;
  score?: number;
  icon: React.ElementType;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'multiple-choice' | 'fill-blank' | 'true-false';
}

export default function ExercicesPage() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());

  // Rediriger les utilisateurs non connectés
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  // Données d'exercices
  const [exercises] = useState<Exercise[]>([
    {
      id: 'grammar-1',
      title: 'Accord des participes passés',
      type: 'grammar',
      difficulty: 'medium',
      description: 'Maîtrisez l\'accord des participes passés avec les auxiliaires être et avoir.',
      estimatedTime: 10,
      completed: false,
      icon: Target
    },
    {
      id: 'vocabulary-1',
      title: 'Vocabulaire avancé',
      type: 'vocabulary',
      difficulty: 'hard',
      description: 'Enrichissez votre vocabulaire avec des mots de niveau avancé.',
      estimatedTime: 15,
      completed: true,
      score: 85,
      icon: BookOpen
    },
    {
      id: 'conjugation-1',
      title: 'Subjonctif présent',
      type: 'conjugation',
      difficulty: 'hard',
      description: 'Conjuguez correctement les verbes au subjonctif présent.',
      estimatedTime: 12,
      completed: false,
      icon: Brain
    },
    {
      id: 'spelling-1',
      title: 'Orthographe d\'usage',
      type: 'spelling',
      difficulty: 'easy',
      description: 'Corrigez les fautes d\'orthographe courantes.',
      estimatedTime: 8,
      completed: true,
      score: 92,
      icon: Zap
    }
  ]);

  // Données de questions
  const [questions] = useState<Question[]>([
    {
      id: 'q1',
      question: 'Les enfants sont _____ chez leurs grands-parents.',
      options: ['allés', 'allé', 'allée', 'allées'],
      correctAnswer: 0,
      explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet "les enfants" (masculin pluriel).',
      type: 'multiple-choice'
    },
    {
      id: 'q2',
      question: 'Elle a _____ une lettre à sa mère.',
      options: ['écrite', 'écrit', 'écrits', 'écrites'],
      correctAnswer: 1,
      explanation: 'Avec l\'auxiliaire "avoir", le participe passé ne s\'accorde pas avec le sujet mais avec le COD si celui-ci est placé avant.',
      type: 'multiple-choice'
    },
    {
      id: 'q3',
      question: 'Les fleurs que j\'ai _____ hier sont magnifiques.',
      options: ['cueillies', 'cueilli', 'cueillie', 'cueillis'],
      correctAnswer: 0,
      explanation: 'Le COD "que" (qui représente "les fleurs", féminin pluriel) est placé avant le verbe, donc accord obligatoire.',
      type: 'multiple-choice'
    }
  ]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(exercise.estimatedTime * 60);
    setIsTimerActive(true);
    setCompletedQuestions(new Set());
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
    setCompletedQuestions(new Set([...completedQuestions, currentQuestionIndex]));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      finishExercise();
    }
  };

  const finishExercise = () => {
    setIsTimerActive(false);
    setSelectedExercise(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'medium': return 'Moyen';
      case 'hard': return 'Difficile';
      default: return 'Inconnu';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grammar': return Target;
      case 'vocabulary': return BookOpen;
      case 'conjugation': return Brain;
      case 'spelling': return Zap;
      default: return BookOpen;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (selectedExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header de l'exercice */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Retour
                </button>
                <div className="h-6 w-px bg-gray-300" />
                <h1 className="text-lg font-semibold text-gray-900">
                  {selectedExercise.title}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className={cn(
                    "font-mono",
                    timeLeft < 60 ? "text-red-600" : "text-gray-600"
                  )}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} / {questions.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Barre de progression */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm text-gray-500">
                {completedQuestions.size} / {questions.length} complétées
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedQuestions.size / questions.length) * 100}%` }}
              />
            </div>
          </motion.div>

          {/* Question */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-xl mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  disabled={showResult}
                  className={cn(
                    "w-full p-4 text-left rounded-xl border-2 transition-all",
                    selectedAnswer === index
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300 bg-white text-gray-900",
                    showResult && index === currentQuestion.correctAnswer
                      ? "border-green-500 bg-green-50 text-green-900"
                      : showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer
                      ? "border-red-500 bg-red-50 text-red-900"
                      : ""
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                      selectedAnswer === index
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-300 text-gray-500",
                      showResult && index === currentQuestion.correctAnswer
                        ? "border-green-500 bg-green-500 text-white"
                        : showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer
                        ? "border-red-500 bg-red-500 text-white"
                        : ""
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-medium">{option}</span>
                    {showResult && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
              >
                <h3 className="font-semibold text-blue-900 mb-2">Explication :</h3>
                <p className="text-blue-800">{currentQuestion.explanation}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-center"
          >
            <div className="text-sm text-gray-600">
              Score actuel : <span className="font-semibold">{score} / {questions.length}</span>
            </div>
            
            <div className="flex gap-3">
              {!showResult ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                  className={cn(
                    "px-6 py-3 rounded-xl font-semibold transition-all",
                    selectedAnswer === null
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                  )}
                >
                  Valider
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow-lg"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Terminer'}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Filtrer par type</h3>
            <div className="flex gap-2">
              {['Tous', 'Grammaire', 'Vocabulaire', 'Conjugaison', 'Orthographe'].map((type) => (
                <button
                  key={type}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Filtrer par difficulté</h3>
            <div className="flex gap-2">
              {['Tous', 'Facile', 'Moyen', 'Difficile'].map((difficulty) => (
                <button
                  key={difficulty}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Grille d'exercices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <exercise.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getDifficultyColor(exercise.difficulty)
                  )}>
                    {getDifficultyText(exercise.difficulty)}
                  </span>
                  {exercise.completed && (
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600">
                        {exercise.score}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {exercise.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {exercise.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{exercise.estimatedTime} min</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startExercise(exercise)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {exercise.completed ? 'Recommencer' : 'Commencer'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Vos statistiques</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
              <div className="text-sm text-gray-600">Exercices complétés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">89%</div>
              <div className="text-sm text-gray-600">Score moyen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">156</div>
              <div className="text-sm text-gray-600">Minutes de pratique</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">5</div>
              <div className="text-sm text-gray-600">Série actuelle</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
