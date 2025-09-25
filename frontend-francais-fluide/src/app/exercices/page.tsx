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
  Award,
  Sparkles
} from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils/cn';
import ExerciseGenerator from '@/components/ai/ExerciseGenerator';
import { EXERCISES_BANK } from '@/data/exercises-bank';
import { useSubscription } from '@/hooks/useSubscription';
import { useTelemetry } from '@/lib/telemetry';
import { captureError } from '@/lib/globalErrorHandler';

interface Exercise {
  id: string;
  title: string;
  type: string; // étendu pour accepter les types de la banque locale
  difficulty: string; // étendu pour accepter beginner/intermediate/advanced
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
  const { getRemainingUsage } = useSubscription();
  const telemetry = useTelemetry();

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [answerAttempts, setAnswerAttempts] = useState<number[]>([]);

  // Rediriger les utilisateurs non connectés
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  // Données d'exercices (chargées depuis la base de données)
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedToday, setGeneratedToday] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  // Statistiques réelles de l'utilisateur
  const [stats, setStats] = useState({
    exercisesCompleted: 0,
    averageAccuracy: 0,
    timeSpent: 0,
    currentStreak: 0,
  });

  // Filtrage des exercices
  const filteredExercises = exercises.filter(exercise => {
    if (selectedType && selectedType !== 'all' && exercise.type !== selectedType) return false;
    if (selectedDifficulty && selectedDifficulty !== 'all' && exercise.difficulty !== selectedDifficulty) return false;
    return true;
  });
  const normalizeNumber = (value: unknown, fallback = 0): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };
  const clampPercent = (value: number): number => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
  };

  const mapBankDifficulty = (d: string): 'easy' | 'medium' | 'hard' => {
    if (d === 'beginner') return 'easy';
    if (d === 'intermediate') return 'medium';
    return 'hard';
  };

  const normalizeEstimatedMinutes = (ex: any): number => {
    const raw = Number((ex && (ex.estimatedTime as any)) ?? NaN);
    if (Number.isFinite(raw) && raw > 0) return Math.round(raw);
    const qLen = Array.isArray(ex?.questions) ? ex.questions.length : 0;
    return Math.max(3, qLen > 0 ? qLen * 2 : 10);
  };

  const mapBankToExerciseCard = (ex: any): Exercise => ({
    id: ex.id,
    title: ex.title,
    type: ex.type,
    difficulty: mapBankDifficulty(ex.difficulty),
    description: ex.description,
    estimatedTime: normalizeEstimatedMinutes(ex),
    completed: false,
    score: undefined,
    icon: getTypeIcon(ex.type)
  });

  // Charger les exercices depuis la base de données
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
        const response = await fetch('/api/exercises', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }
        });
        
        // Ne pas déconnecter automatiquement en cas d'erreur 401
        if (response.status === 401) {
          console.warn('Token expiré, utilisation des exercices par défaut');
          captureError('Token expiré lors du chargement des exercices', undefined, 'Exercices API');
          const defaults = EXERCISES_BANK.slice(0, 6).map(mapBankToExerciseCard);
          setExercises(defaults);
          setLoadingExercises(false);
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          const exercisesWithIcons = data.data.map((exercise: any) => {
            const hasSubmissions = Array.isArray(exercise.submissions) && exercise.submissions.length > 0;
            const countSubmissions = typeof exercise._count?.submissions === 'number' ? exercise._count.submissions : 0;
            const completed = hasSubmissions || countSubmissions > 0;
            const lastScore = hasSubmissions ? exercise.submissions[0]?.score : undefined;
            return {
              ...exercise,
              estimatedTime: normalizeEstimatedMinutes(exercise),
              icon: getTypeIcon(exercise.type),
              completed,
              score: lastScore,
            };
          });
          if (!exercisesWithIcons || exercisesWithIcons.length === 0) {
            const defaults = EXERCISES_BANK.slice(0, 6).map(mapBankToExerciseCard);
            setExercises(defaults);
          } else {
            setExercises(exercisesWithIcons);
          }
        } else {
          const defaults = EXERCISES_BANK.slice(0, 6).map(mapBankToExerciseCard);
          setExercises(defaults);
        }
      } catch (error) {
        console.error('Erreur chargement exercices:', error);
        captureError('Erreur lors du chargement des exercices', error as Error, 'Exercices API');
        const defaults = EXERCISES_BANK.slice(0, 6).map(mapBankToExerciseCard);
        setExercises(defaults);
      } finally {
        setLoadingExercises(false);
      }
    };

    if (isAuthenticated) {
      loadExercises();
    }
  }, [isAuthenticated]);

  // Initialiser le compteur quotidien de génération IA
  useEffect(() => {
    const key = 'generated_exercises_today_v1';
    const today = new Date().toDateString();
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === today) {
          setGeneratedToday(Number(parsed.count) || 0);
          return;
        }
      }
    } catch {}
    localStorage.setItem(key, JSON.stringify({ date: today, count: 0 }));
    setGeneratedToday(0);
  }, []);

  // Charger les statistiques réelles depuis l'API Next.js (avec cache)
  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        if (!token) return;
        
        // Vérifier le cache (5 minutes)
        const cacheKey = 'user_stats_cache';
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (now - timestamp < fiveMinutes) {
              console.log('Utilisation des statistiques en cache');
              setStats({
                exercisesCompleted: normalizeNumber(data?.exercisesCompleted, 0),
                averageAccuracy: clampPercent(normalizeNumber(data?.averageAccuracy ?? data?.accuracy, 0)),
                timeSpent: normalizeNumber(data?.timeSpent, 0),
                currentStreak: normalizeNumber(data?.currentStreak, 0),
              });
              return;
            }
          } catch (e) {
            // Cache invalide, continuer avec l'API
          }
        }
        
        const response = await fetch('/api/progress', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.warn('Erreur chargement stats:', response.status);
          captureError(`Erreur ${response.status} lors du chargement des statistiques`, undefined, 'Stats API');
          return;
        }
        
        const data = await response.json();
        if (data.success) {
          const statsData = {
            exercisesCompleted: normalizeNumber(data.data?.exercisesCompleted, 0),
            averageAccuracy: clampPercent(normalizeNumber(data.data?.averageAccuracy ?? data.data?.accuracy, 0)),
            timeSpent: normalizeNumber(data.data?.timeSpent, 0),
            currentStreak: normalizeNumber(data.data?.currentStreak, 0),
          };
          
          setStats(statsData);
          
          // Mettre en cache
          localStorage.setItem(cacheKey, JSON.stringify({
            data: data.data,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn('Erreur chargement stats:', e);
        captureError('Erreur lors du chargement des statistiques', e as Error, 'Stats API');
        // silencieux: afficherons des valeurs 0 par défaut
      }
    };
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  // Charger les questions d'un exercice
  const loadQuestions = async (exerciseId: string) => {
    try {
      // Si l'exercice provient de la banque locale
      const bankExercise = EXERCISES_BANK.find(ex => ex.id === exerciseId);
      if (bankExercise) {
        const questionsFromBank = (bankExercise.questions || []).map((q: any) => {
          const options = Array.isArray(q.options) ? q.options : [];
          const correctIndex = Math.max(0, options.indexOf(q.correctAnswer));
          return {
            id: q.id,
            question: q.text || '',
            options,
            correctAnswer: correctIndex,
            explanation: q.explanation || '',
            type: (q.type === 'true-false' ? 'true-false' : (q.type === 'fill-blank' ? 'fill-blank' : 'multiple-choice')) as 'multiple-choice' | 'fill-blank' | 'true-false'
          };
        });
        setQuestions(questionsFromBank);
        setSelectedAnswers(new Array(questionsFromBank.length).fill(-1));
        return;
      }

      // Sinon, charger depuis l'API (avec jeton)
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
      const response = await fetch(`/api/exercises/${exerciseId}` , {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });
      
      // Ne pas déconnecter automatiquement en cas d'erreur 401
      if (response.status === 401) {
        console.warn('Token expiré, impossible de charger les questions');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        const questionsWithParsedOptions = data.data.questions.map((q: any) => {
          const options = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]');
          const correctIndex = Math.max(0, options.indexOf(q.correctAnswer));
          return {
            ...q,
            options,
            correctAnswer: correctIndex
          };
        });
        setQuestions(questionsWithParsedOptions);
        setSelectedAnswers(new Array(questionsWithParsedOptions.length).fill(-1));
      }
    } catch (error) {
      console.error('Erreur chargement questions:', error);
    }
  };

  // Gérer la génération d'exercices IA
  const handleExerciseGenerated = (newExercise: any) => {
    const exerciseWithIcon = {
      ...newExercise,
      icon: getTypeIcon(newExercise.type),
      completed: false,
      score: undefined
    };
    setExercises(prev => [exerciseWithIcon, ...prev]);
    setShowGenerator(false);
    // Incrémenter le compteur local quotidien
    const key = 'generated_exercises_today_v1';
    const today = new Date().toDateString();
    const nextCount = generatedToday + 1;
    setGeneratedToday(nextCount);
    localStorage.setItem(key, JSON.stringify({ date: today, count: nextCount }));
  };

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

  const startExercise = async (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setShowResult(false);
    // Initialiser le minuteur à la durée prévue (fallback 10 min) et démarrer dès l'entrée dans l'exercice
    setTimeLeft(Math.max(1, (exercise.estimatedTime || 10)) * 60);
    setIsTimerActive(true);
    setCompletedQuestions(new Set());
    setQuestionStartTime(Date.now());
    setAnswerAttempts([]);
    
    // Télémétrie: exercice démarré
    telemetry.trackExerciseStarted(exercise.id, {
      type: exercise.type,
      difficulty: exercise.difficulty,
      estimatedTime: exercise.estimatedTime
    });
    
    // Charger les questions de l'exercice
    await loadQuestions(exercise.id);
  };

  const submitAnswer = async () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const responseTime = Date.now() - questionStartTime;
    const attempts = answerAttempts[currentQuestionIndex] || 0;

    if (isCorrect) {
      setScore(score + 1);
    }

    // Télémétrie: question complétée
    telemetry.trackQuestionCompleted(
      selectedExercise!.id,
      currentQuestion.id,
      isCorrect,
      responseTime,
      attempts
    );

    setShowResult(true);
    setCompletedQuestions(new Set([...completedQuestions, currentQuestionIndex]));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuestionStartTime(Date.now());
    } else {
      finishExercise();
    }
  };

  // Lancer explicitement le minuteur lorsque l'utilisateur commence vraiment
  const beginTimer = () => {
    if (!isTimerActive && timeLeft > 0) {
      setIsTimerActive(true);
    }
  };

  const finishExercise = async () => {
    if (selectedExercise) {
      const finalScore = Math.round((score / questions.length) * 100);
      const timeSpent = Math.floor((10 * 60 - timeLeft) / 60);
      
      // Télémétrie: exercice terminé
      telemetry.trackExerciseFinished(
        selectedExercise.id,
        finalScore,
        questions.length,
        timeSpent * 60, // en secondes
        finalScore
      );

      // Sauvegarder les résultats dans la base de données
      try {
        // Construire les réponses utilisateur sous forme de tableau, dans l'ordre des questions
        const userAnswers: string[] = questions.map((q, i) => {
          const sel = selectedAnswers[i];
          if (typeof sel === 'number' && sel >= 0 && Array.isArray(q.options)) {
            return q.options[sel] as string;
          }
          return '';
        });

        const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
        const response = await fetch('/api/exercises/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            exerciseId: selectedExercise.id,
            answers: userAnswers,
            timeSpent: timeSpent // temps en minutes
          })
        });

        // Ne pas déconnecter automatiquement en cas d'erreur 401
        if (response.status === 401) {
          console.warn('Token expiré, exercice marqué comme complété localement');
          // Marquer l'exercice comme complété localement même sans sauvegarde
          setExercises(prev => prev.map(ex => ex.id === selectedExercise.id ? { ...ex, completed: true, score: finalScore } : ex));
          return;
        }

        const data = await response.json();
        if (data.success) {
          console.log('Exercice sauvegardé:', data.data);
          // Marquer l'exercice comme complété localement
          setExercises(prev => prev.map(ex => ex.id === selectedExercise.id ? { ...ex, completed: true, score: data.data?.score ?? ex.score } : ex));
        } else {
          // Marquer comme complété localement même si la sauvegarde échoue
          setExercises(prev => prev.map(ex => ex.id === selectedExercise.id ? { ...ex, completed: true, score: finalScore } : ex));
        }
      } catch (error) {
        console.error('Erreur sauvegarde exercice:', error);
        // Marquer comme complété localement même en cas d'erreur
        setExercises(prev => prev.map(ex => ex.id === selectedExercise.id ? { ...ex, completed: true, score: finalScore } : ex));
      }
    }

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

          {/* Alerte si aucune question */}
          {questions.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 mb-6">
              Aucune question disponible pour cet exercice pour le moment.
            </div>
          )}

          {/* Question */}
          {currentQuestion ? (
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
                {(currentQuestion.options || []).map((option: string, index: number) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                    if (showResult) return;
                    const previousAnswer = selectedAnswer;
                    setSelectedAnswer(index);
                    
                    // Télémétrie: sélection de réponse
                    telemetry.trackAnswerSelected(
                      selectedExercise!.id,
                      currentQuestion.id,
                      index,
                      currentQuestion.options || []
                    );
                    
                    // Télémétrie: changement de réponse
                    if (previousAnswer !== null && previousAnswer !== index) {
                      telemetry.trackAnswerChanged(
                        selectedExercise!.id,
                        currentQuestion.id,
                        previousAnswer,
                        index,
                        currentQuestion.options || []
                      );
                      
                      // Incrémenter le compteur de tentatives
                      setAnswerAttempts(prev => {
                        const newAttempts = [...prev];
                        newAttempts[currentQuestionIndex] = (newAttempts[currentQuestionIndex] || 0) + 1;
                        return newAttempts;
                      });
                    }
                  }}
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
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-xl mb-6">
              <div className="h-5 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
              <div className="space-y-3">
                {[0,1,2,3].map((i) => (
                  <div key={i} className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 animate-pulse" />
                ))}
              </div>
            </div>
          )}

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
                  onClick={() => { beginTimer(); submitAnswer(); }}
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
        {/* Générateur d'exercices IA */}
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <ExerciseGenerator 
              onExerciseGenerated={handleExerciseGenerated} 
              onClose={() => setShowGenerator(false)}
            />
          </motion.div>
        )}

        {/* Bouton pour afficher le générateur */}
        {!showGenerator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {(() => {
              const planLimit = getRemainingUsage('exercisesPerDay');
              const remaining = !Number.isFinite(planLimit) ? Infinity : Math.max(0, Number(planLimit) - generatedToday);
              const disabled = remaining === 0;
              return (
                <button
                  onClick={() => setShowGenerator(true)}
                  disabled={disabled}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all",
                    disabled
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:shadow-xl"
                  )}
                  title={disabled ? "Limite quotidienne atteinte pour votre plan" : undefined}
                >
                  <Sparkles className="w-5 h-5" />
                  {disabled ? "Limite atteinte aujourd'hui" : "Générer un exercice avec l'IA"}
                  {!disabled && Number.isFinite(planLimit) && (
                    <span className="ml-2 text-xs opacity-90">({remaining} restants)</span>
                  )}
                </button>
              );
            })()}
          </motion.div>
        )}

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Filtrer par type</h3>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tous' },
                { value: 'grammar', label: 'Grammaire' },
                { value: 'vocabulary', label: 'Vocabulaire' },
                { value: 'conjugation', label: 'Conjugaison' },
                { value: 'spelling', label: 'Orthographe' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-lg transition-colors",
                    selectedType === type.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Filtrer par difficulté</h3>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tous' },
                { value: 'easy', label: 'Facile' },
                { value: 'medium', label: 'Moyen' },
                { value: 'hard', label: 'Difficile' }
              ].map((difficulty) => (
                <button
                  key={difficulty.value}
                  onClick={() => setSelectedDifficulty(difficulty.value)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-lg transition-colors",
                    selectedDifficulty === difficulty.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {difficulty.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Grille d'exercices */}
        {loadingExercises ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise, index) => (
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
                  {('isAI' in exercise) && (exercise as any).isAI && (
                    <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700 border border-purple-200">
                      IA
                    </span>
                  )}
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
                  {exercise.completed ? 'Reprendre' : 'Commencer'}
                </motion.button>
              </div>
            </motion.div>
          ))}
          </div>
        )}

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
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.exercisesCompleted}</div>
              <div className="text-sm text-gray-600">Exercices complétés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(stats.averageAccuracy)}%</div>
              <div className="text-sm text-gray-600">Score moyen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.timeSpent}</div>
              <div className="text-sm text-gray-600">Minutes de pratique</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.currentStreak}</div>
              <div className="text-sm text-gray-600">Série actuelle</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
