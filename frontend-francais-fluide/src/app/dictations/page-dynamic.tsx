'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  Star,
  Volume2,
  VolumeX,
  BookOpen,
  Target,
  Award
} from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import { useAuth } from '@/hooks/useApi';
import { cn } from '@/lib/utils/cn';

interface Dictation {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  audioUrl?: string;
  text: string;
  category: string;
  tags: string[];
  completed: boolean;
  score?: number;
  attempts: number;
}

export default function DictationsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [dictations, setDictations] = useState<Dictation[]>([]);
  const [selectedDictation, setSelectedDictation] = useState<Dictation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userText, setUserText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Rediriger les utilisateurs non connectés
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  // Charger les dictées depuis la base de données
  useEffect(() => {
    if (isAuthenticated) {
      loadDictations();
    }
  }, [isAuthenticated]);

  const loadDictations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dictations');
      const data = await response.json();
      
      if (data.success) {
        const dictationsWithParsedTags = data.data.map((dictation: any) => ({
          ...dictation,
          tags: dictation.tags ? JSON.parse(dictation.tags) : []
        }));
        setDictations(dictationsWithParsedTags);
      } else {
        console.error('Erreur chargement dictées:', data.error);
      }
    } catch (error) {
      console.error('Erreur chargement dictées:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startDictation = (dictation: Dictation) => {
    setSelectedDictation(dictation);
    setUserText('');
    setIsCompleted(false);
    setScore(0);
    setTimeRemaining(dictation.duration * 60);
    setIsPlaying(true);
  };

  const calculateScore = (original: string, user: string) => {
    const originalWords = original.toLowerCase().split(/\s+/);
    const userWords = user.toLowerCase().split(/\s+/);
    
    let correctWords = 0;
    const maxLength = Math.max(originalWords.length, userWords.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (originalWords[i] === userWords[i]) {
        correctWords++;
      }
    }
    
    return Math.round((correctWords / originalWords.length) * 100);
  };

  const finishDictation = () => {
    if (selectedDictation) {
      const finalScore = calculateScore(selectedDictation.text, userText);
      setScore(finalScore);
      setIsCompleted(true);
      setIsPlaying(false);
      
      // Sauvegarder les résultats
      saveDictationResult(selectedDictation.id, finalScore);
    }
  };

  const saveDictationResult = async (dictationId: string, score: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dictations/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dictationId,
          score,
          userText
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('Résultat sauvegardé:', data.data);
      }
    } catch (error) {
      console.error('Erreur sauvegarde résultat:', error);
    }
  };

  const resetDictation = () => {
    if (selectedDictation) {
      setUserText('');
      setIsCompleted(false);
      setScore(0);
      setTimeRemaining(selectedDictation.duration * 60);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return 'Inconnu';
    }
  };

  const filteredDictations = dictations.filter(dictation => {
    if (filter === 'all') return true;
    return dictation.difficulty === filter;
  });

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

  if (selectedDictation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header de la dictée */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedDictation(null)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Retour
                </button>
                <div className="h-6 w-px bg-gray-300" />
                <h1 className="text-lg font-semibold text-gray-900">
                  {selectedDictation.title}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className={cn(
                    "font-mono",
                    timeRemaining < 60 ? "text-red-600" : "text-gray-600"
                  )}>
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {selectedDictation.duration} min
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isCompleted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Écrivez ce que vous entendez
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedDictation.description}
                </p>
                
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                      isPlaying 
                        ? "bg-red-600 text-white hover:bg-red-700" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Pause' : 'Lecture'}
                  </button>
                  
                  <button
                    onClick={resetDictation}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Recommencer
                  </button>
                </div>
              </div>

              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Tapez votre texte ici..."
                className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isPlaying}
              />

              <div className="mt-6 flex justify-end">
                <button
                  onClick={finishDictation}
                  disabled={!userText.trim()}
                  className={cn(
                    "px-6 py-3 rounded-xl font-semibold transition-all",
                    userText.trim()
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                >
                  Terminer la dictée
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl text-center"
            >
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Dictée terminée !
                </h2>
                <p className="text-gray-600">
                  Votre score : <span className="font-bold text-2xl text-blue-600">{score}%</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Texte original</h3>
                  <p className="text-sm text-gray-600">{selectedDictation.text}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Votre texte</h3>
                  <p className="text-sm text-gray-600">{userText}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetDictation}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Recommencer
                </button>
                <button
                  onClick={() => setSelectedDictation(null)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                >
                  Retour aux dictées
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Filtrer par difficulté</h3>
            <div className="flex gap-2">
              {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setFilter(difficulty)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-lg transition-colors",
                    filter === difficulty
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {difficulty === 'all' ? 'Toutes' : getDifficultyText(difficulty)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Grille de dictées */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDictations.map((dictation, index) => (
              <motion.div
                key={dictation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getDifficultyColor(dictation.difficulty)
                    )}>
                      {getDifficultyText(dictation.difficulty)}
                    </span>
                    {dictation.completed && (
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-600">
                          {dictation.score}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {dictation.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {dictation.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{dictation.duration} min</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {dictation.attempts} tentative{dictation.attempts > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {dictation.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startDictation(dictation)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {dictation.completed ? 'Recommencer' : 'Commencer'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
