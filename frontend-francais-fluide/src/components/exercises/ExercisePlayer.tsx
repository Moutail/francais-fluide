'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import type { Exercise, ExerciseAnswer, ExerciseResult } from '@/types';

interface ExercisePlayerProps {
  exercise: Exercise;
  onComplete: (result: ExerciseResult) => void;
  onSkip: () => void;
  mode?: 'practice' | 'exam';
  showHints?: boolean;
}

interface QuestionState {
  id: string;
  answer: string;
  isCorrect: boolean | null;
  timeSpent: number;
}

export default function ExercisePlayer({
  exercise,
  onComplete,
  onSkip,
  mode = 'practice',
  showHints = true,
}: ExercisePlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(exercise.estimatedTime * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Initialiser les états des questions
  useEffect(() => {
    const initialStates = exercise.questions.map(q => ({
      id: q.id,
      answer: '',
      isCorrect: null,
      timeSpent: 0,
    }));
    setQuestionStates(initialStates);
  }, [exercise]);

  // Timer
  useEffect(() => {
    if (timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isCompleted) {
      handleComplete();
    }
  }, [timeRemaining, isCompleted]);

  // Gérer la réponse à une question
  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setQuestionStates(prev =>
      prev.map(state =>
        state.id === questionId ? { ...state, answer, timeSpent: state.timeSpent + 1 } : state
      )
    );
  }, []);

  // Vérifier la réponse
  const checkAnswer = useCallback(
    (questionId: string) => {
      const question = exercise.questions.find(q => q.id === questionId);
      const questionState = questionStates.find(s => s.id === questionId);

      if (!question || !questionState) return;

      const isCorrect =
        questionState.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

      setQuestionStates(prev =>
        prev.map(state => (state.id === questionId ? { ...state, isCorrect } : state))
      );

      // Mettre à jour le streak
      if (isCorrect) {
        setStreak(prev => prev + 1);
        setScore(prev => prev + (exercise.scoring?.maxPoints || 100) / exercise.questions.length);
      } else {
        setStreak(0);
      }

      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    },
    [exercise, questionStates]
  );

  // Passer à la question suivante
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentQuestionIndex, exercise.questions.length]);

  // Compléter l'exercice
  const handleComplete = useCallback(() => {
    const totalScore = questionStates.reduce((total, state) => {
      const question = exercise.questions.find(q => q.id === state.id);
      if (question && state.isCorrect) {
        return total + (exercise.scoring?.maxPoints || 100) / exercise.questions.length;
      }
      return total;
    }, 0);

    const timeBonus =
      mode === 'exam'
        ? 0
        : Math.max(
            0,
            (timeRemaining * (exercise.scoring?.timeBonus || 20)) / (exercise.estimatedTime * 60)
          );

    const finalScore = Math.round(totalScore + timeBonus);

    const result: ExerciseResult = {
      exerciseId: exercise.id,
      score: finalScore,
      maxScore: exercise.scoring?.maxPoints || 100,
      timeSpent: exercise.estimatedTime * 60 - timeRemaining,
      answers: questionStates.map(state => ({
        questionId: state.id,
        answer: state.answer,
        isCorrect: state.isCorrect || false,
        timeSpent: state.timeSpent,
      })),
      completedAt: new Date().toISOString(),
      accuracy: questionStates.filter(s => s.isCorrect).length / questionStates.length,
    };

    setIsCompleted(true);
    onComplete(result);
  }, [exercise, questionStates, timeRemaining, mode, onComplete]);

  // Rendu d'une question
  const renderQuestion = (question: any, index: number) => {
    const questionState = questionStates.find(s => s.id === question.id);
    const isCurrentQuestion = index === currentQuestionIndex;

    if (!isCurrentQuestion) return null;

    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Question {index + 1} sur {exercise.questions.length}
          </h3>
          <Badge
            variant={
              questionState?.isCorrect === true
                ? 'success'
                : questionState?.isCorrect === false
                  ? 'error'
                  : 'default'
            }
          >
            {questionState?.isCorrect === true
              ? 'Correct'
              : questionState?.isCorrect === false
                ? 'Incorrect'
                : 'En attente'}
          </Badge>
        </div>

        <div className="rounded-lg bg-gray-50 p-6">
          <p className="mb-4 text-lg">{question.text}</p>

          {question.type === 'multiple-choice' && (
            <div className="space-y-2">
              {question.options?.map((option: string, optionIndex: number) => (
                <label key={optionIndex} className="flex cursor-pointer items-center space-x-3">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={questionState?.answer === option}
                    onChange={e => handleAnswer(question.id, e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-base">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'fill-blank' && (
            <div className="space-y-4">
              <input
                type="text"
                value={questionState?.answer || ''}
                onChange={e => handleAnswer(question.id, e.target.value)}
                placeholder="Votre réponse..."
                className="w-full rounded-lg border border-gray-300 p-3 text-lg"
              />
              {question.options && (
                <div className="flex flex-wrap gap-2">
                  {question.options.map((option: string, optionIndex: number) => (
                    <Button
                      key={optionIndex}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAnswer(question.id, option)}
                      className="text-sm"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {question.type === 'correction' && (
            <div className="space-y-4">
              <textarea
                value={questionState?.answer || ''}
                onChange={e => handleAnswer(question.id, e.target.value)}
                placeholder="Votre correction..."
                className="min-h-[100px] w-full rounded-lg border border-gray-300 p-3 text-lg"
              />
            </div>
          )}
        </div>

        {showHints && question.explanation && (
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Indice :</strong> {question.explanation}
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => checkAnswer(question.id)}
            disabled={!questionState?.answer}
          >
            Vérifier
          </Button>

          <Button onClick={nextQuestion} disabled={questionState?.isCorrect === null}>
            {index === exercise.questions.length - 1 ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      </motion.div>
    );
  };

  // Animation de feedback
  const feedbackVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card className="p-8">
        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
            <p className="mt-2 text-gray-600">{exercise.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-500">Temps restant</div>
          </div>
        </div>

        {/* Texte de l'exercice */}
        {exercise.content?.text && (
          <div className="mb-8 rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-blue-900">📖 Texte à analyser</h3>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">
              {exercise.content.text}
            </p>
            {exercise.content.instructions && (
              <p className="mt-4 text-sm italic text-blue-700">
                💡 {exercise.content.instructions}
              </p>
            )}
          </div>
        )}

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>Progression</span>
            <span>
              {currentQuestionIndex + 1} / {exercise.questions.length}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <motion.div
              className="h-2 rounded-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentQuestionIndex + 1) / exercise.questions.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Score et streak */}
        <div className="mb-8 flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Score:</span>
            <span className="text-xl font-bold text-green-600">{Math.round(score)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Série:</span>
            <span className="text-xl font-bold text-orange-600">{streak}</span>
          </div>
        </div>

        {/* Instructions */}
        {exercise.content.instructions && (
          <div className="mb-6 border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <p className="text-yellow-800">{exercise.content.instructions}</p>
          </div>
        )}

        {/* Questions */}
        <AnimatePresence mode="wait">
          {exercise.questions.map((question, index) => renderQuestion(question, index))}
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-8 flex justify-between border-t pt-6">
          <Button variant="outline" onClick={onSkip}>
            Passer
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!isCompleted && currentQuestionIndex < exercise.questions.length - 1}
          >
            {isCompleted ? 'Terminé' : "Terminer l'exercice"}
          </Button>
        </div>
      </Card>

      {/* Feedback animé */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="fixed right-4 top-4 z-50"
            variants={feedbackVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Card className="border-green-400 bg-green-100 p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <span className="font-semibold text-green-800">Correct !</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
