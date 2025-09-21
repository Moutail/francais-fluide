'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, Button, Badge } from '@/components/ui';
import { 
  ArrowLeft, 
  Clock, 
  Trophy, 
  Target, 
  CheckCircle, 
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import type { Exercise, Question } from '@/types';

// Données mockées pour les exercices (même que dans la page liste)
const mockExercises: Exercise[] = [
  {
    id: '1',
    title: 'Accord des adjectifs',
    description: 'Maîtrisez l\'accord des adjectifs avec les noms masculins et féminins',
    type: 'grammar',
    difficulty: 'beginner',
    category: 'Grammaire',
    content: {
      text: 'Le chat ___ (noir) dort sur le canapé ___ (confortable).',
      instructions: 'Complétez les phrases avec la forme correcte de l\'adjectif',
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
    estimatedTime: 10,
    scoring: { maxPoints: 50, timeBonus: 10, accuracyWeight: 0.8 },
    isCompleted: false,
    points: 50,
    timeLimit: 10
  },
  {
    id: '2',
    title: 'Conjugaison du présent',
    description: 'Révisez la conjugaison des verbes réguliers au présent de l\'indicatif',
    type: 'grammar',
    difficulty: 'intermediate',
    category: 'Conjugaison',
    content: {
      text: 'Je (manger) ___ une pomme. Tu (finir) ___ tes devoirs. Il (vendre) ___ sa voiture.',
      instructions: 'Conjuguez les verbes entre parenthèses au présent',
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
    estimatedTime: 15,
    scoring: { maxPoints: 75, timeBonus: 15, accuracyWeight: 0.85 },
    isCompleted: false,
    points: 75,
    timeLimit: 15
  }
];

interface ExerciseState {
  currentQuestion: number;
  answers: Record<string, string>;
  timeRemaining: number;
  isStarted: boolean;
  isCompleted: boolean;
  score: number;
  showResults: boolean;
}

export default function ExercisePage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.id as string;
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [state, setState] = useState<ExerciseState>({
    currentQuestion: 0,
    answers: {},
    timeRemaining: 0,
    isStarted: false,
    isCompleted: false,
    score: 0,
    showResults: false
  });

  // Charger l'exercice
  useEffect(() => {
    const foundExercise = mockExercises.find(ex => ex.id === exerciseId);
    if (foundExercise) {
      setExercise(foundExercise);
      setState(prev => ({
        ...prev,
        timeRemaining: foundExercise.timeLimit || 0
      }));
    }
  }, [exerciseId]);

  // Timer
  useEffect(() => {
    if (!state.isStarted || state.isCompleted || state.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          // Temps écoulé
          return {
            ...prev,
            isCompleted: true,
            timeRemaining: 0
          };
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isStarted, state.isCompleted, state.timeRemaining]);

  const startExercise = () => {
    setState(prev => ({
      ...prev,
      isStarted: true
    }));
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const nextQuestion = () => {
    if (!exercise) return;
    
    setState(prev => {
      const nextIndex = prev.currentQuestion + 1;
      if (nextIndex >= exercise.content.questions!.length) {
        // Fin de l'exercice
        const score = calculateScore();
        return {
          ...prev,
          isCompleted: true,
          score,
          showResults: true
        };
      }
      return {
        ...prev,
        currentQuestion: nextIndex
      };
    });
  };

  const previousQuestion = () => {
    setState(prev => ({
      ...prev,
      currentQuestion: Math.max(0, prev.currentQuestion - 1)
    }));
  };

  const calculateScore = () => {
    if (!exercise) return 0;
    
    const questions = exercise.content.questions || [];
    const correctAnswers = questions.filter(q => {
      const userAnswer = state.answers[q.id];
      return userAnswer === q.correctAnswer;
    }).length;
    
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const resetExercise = () => {
    setState({
      currentQuestion: 0,
      answers: {},
      timeRemaining: exercise?.timeLimit || 0,
      isStarted: false,
      isCompleted: false,
      score: 0,
      showResults: false
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'exercice...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = exercise.content.questions?.[state.currentQuestion];
  const totalQuestions = exercise.content.questions ? exercise.content.questions.length : 0;
  const progress = ((state.currentQuestion + 1) / (totalQuestions || 1)) * 100;

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
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Button>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
                  <p className="text-gray-600">{exercise.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className="bg-blue-100 text-blue-800">
                    {exercise.difficulty === 'beginner' ? 'Débutant' : 
                     exercise.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                  </Badge>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Trophy className="w-4 h-4" />
                    <span>{exercise.points} pts</span>
                  </div>
                  
                  {exercise.timeLimit && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(state.timeRemaining)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Question {state.currentQuestion + 1} sur {exercise.content.questions?.length || 0}
              </p>
            </div>

            {/* Contenu de l'exercice */}
            {!state.isStarted ? (
              <Card className="max-w-4xl mx-auto">
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {exercise.title}
                  </h2>
                      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    {exercise.content.instructions}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">{totalQuestions} questions</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">{exercise.timeLimit} minutes</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="font-medium">{exercise.points} points</p>
                    </div>
                  </div>

                  <Button onClick={startExercise} size="lg" className="px-8">
                    <Play className="w-5 h-5 mr-2" />
                    Commencer l'exercice
                  </Button>
                </div>
              </Card>
            ) : state.showResults ? (
              <Card className="max-w-4xl mx-auto">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Exercice terminé !
                  </h2>
                  
                  <div className="text-6xl font-bold text-blue-600 mb-4">
                    {state.score}%
                  </div>
                  
                  <p className="text-gray-600 mb-8">
                    Vous avez obtenu {state.score}% de bonnes réponses
                  </p>

                  <div className="flex gap-4 justify-center">
                    <Button onClick={resetExercise} variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Recommencer
                    </Button>
                    <Button onClick={() => router.push('/exercises')}>
                      Retour aux exercices
                    </Button>
                  </div>
                </div>
              </Card>
            ) : currentQuestion ? (
              <Card className="max-w-4xl mx-auto">
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {currentQuestion.text}
                    </h3>
                    
                    {currentQuestion.type === 'fill-in-the-blank' ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={state.answers[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Votre réponse..."
                        />
                      </div>
                    ) : currentQuestion.type === 'multiple-choice' ? (
                      <div className="space-y-3">
                        {currentQuestion.options?.map((option, index) => (
                          <label
                            key={index}
                            className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="radio"
                              name={currentQuestion.id}
                              value={option}
                              checked={state.answers[currentQuestion.id] === option}
                              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                              className="mr-3"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={previousQuestion}
                      disabled={state.currentQuestion === 0}
                      variant="outline"
                    >
                      Précédent
                    </Button>
                    
                    <Button
                      onClick={nextQuestion}
                      disabled={!state.answers[currentQuestion.id]}
                    >
                      {state.currentQuestion === ((totalQuestions || 1) - 1) 
                        ? 'Terminer' 
                        : 'Suivant'
                      }
                    </Button>
                  </div>
                </div>
              </Card>
            ) : null}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
