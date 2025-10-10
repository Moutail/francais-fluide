// src/app/dictation/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, BookOpen, Clock, Target, Lock, Crown, Sparkles } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import SimpleDictationExercise from '@/components/exercises/SimpleDictationExercise';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useAuth } from '@/contexts/AuthContext';

interface DictationText {
  id: string;
  title: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  description: string;
  audioUrl?: string;
  duration?: number;
  category?: string;
}

export default function DictationPage() {
  const { user } = useAuth();
  const [selectedText, setSelectedText] = useState<DictationText | null>(null);
  const [completedDictations, setCompletedDictations] = useState<string[]>([]);
  const [dictations, setDictations] = useState<DictationText[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<
    Array<{
      textId: string;
      userText: string;
      isCorrect: boolean;
      timeSpent: number;
      accuracy: number;
    }>
  >([]);

  const userPlan = user?.subscription?.plan || 'demo';

  // Charger les dictées depuis l'API
  useEffect(() => {
    loadDictations();
  }, []);

  const loadDictations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dictations', {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          } : {}),
        },
      });

      const data = await response.json();

      // Gérer le cas où l'utilisateur n'a pas accès (plan gratuit)
      if (response.status === 403 && data.type === 'feature_not_available') {
        console.log('⚠️ Accès refusé aux dictées - Plan gratuit');
        setError('upgrade_required');
        setDictations([]);
        return;
      }

      if (!response.ok) {
        console.error('Erreur API dictations:', response.status, data);
        throw new Error(data.error || 'Erreur lors du chargement des dictées');
      }
      
      if (data.success && data.data?.dictations) {
        // Mapper les dictées du backend au format attendu
        const mappedDictations = data.data.dictations.map((d: any) => ({
          id: d.id,
          title: d.title,
          text: d.text,
          difficulty: mapDifficulty(d.difficulty),
          estimatedTime: d.duration || 5,
          description: d.description || '',
          audioUrl: d.audioUrl,
          duration: d.duration,
          category: d.category,
        }));
        setDictations(mappedDictations);
      } else {
        // Fallback sur les dictées par défaut si l'API ne retourne rien
        setDictations(getDefaultDictations());
      }
    } catch (err: any) {
      console.error('Erreur chargement dictées:', err);
      setError(err.message);
      // Fallback sur les dictées par défaut en cas d'erreur
      setDictations(getDefaultDictations());
    } finally {
      setLoading(false);
    }
  };

  // Mapper les difficultés du backend vers le format frontend
  const mapDifficulty = (difficulty: string): 'easy' | 'medium' | 'hard' => {
    const mapping: Record<string, 'easy' | 'medium' | 'hard'> = {
      beginner: 'easy',
      intermediate: 'medium',
      advanced: 'hard',
      easy: 'easy',
      medium: 'medium',
      hard: 'hard',
    };
    return mapping[difficulty] || 'medium';
  };

  // Dictées par défaut (fallback)
  const getDefaultDictations = (): DictationText[] => [
    {
      id: '1',
      title: 'Les saisons',
      text: "Le printemps arrive avec ses fleurs colorées. Les oiseaux chantent dans les arbres. L'été apporte la chaleur et les longues journées. L'automne colore les feuilles en orange et rouge. L'hiver recouvre tout de blanc.",
      difficulty: 'easy',
      estimatedTime: 5,
      description: 'Un texte simple sur les saisons pour débuter',
    },
    {
      id: '2',
      title: 'La technologie moderne',
      text: "Les smartphones ont révolutionné notre façon de communiquer. Ils nous permettent de rester connectés en permanence. Cependant, il est important de savoir s'en détacher parfois. La technologie doit rester un outil, pas une dépendance.",
      difficulty: 'medium',
      estimatedTime: 8,
      description: 'Un texte de niveau intermédiaire sur la technologie',
    },
    {
      id: '3',
      title: "L'art de la cuisine française",
      text: "La gastronomie française est reconnue dans le monde entier pour sa sophistication et sa diversité. Chaque région possède ses spécialités culinaires uniques. Les chefs français maîtrisent l'art de marier les saveurs avec une précision remarquable.",
      difficulty: 'hard',
      estimatedTime: 12,
      description: 'Un texte avancé sur la cuisine française',
    },
  ];

  const handleDictationComplete = (
    textId: string,
    userText: string,
    isCorrect: boolean,
    timeSpent: number
  ) => {
    const accuracy = calculateAccuracy(userText, selectedText?.text || '');

    setResults(prev => [
      ...prev,
      {
        textId,
        userText,
        isCorrect,
        timeSpent,
        accuracy,
      },
    ]);

    setCompletedDictations(prev => [...prev, textId]);
  };

  const calculateAccuracy = (userText: string, originalText: string): number => {
    if (!userText || !originalText) return 0;

    const userWords = userText.toLowerCase().split(/\s+/);
    const originalWords = originalText.toLowerCase().split(/\s+/);

    let correctWords = 0;
    const maxWords = Math.max(userWords.length, originalWords.length);

    for (let i = 0; i < Math.min(userWords.length, originalWords.length); i++) {
      if (userWords[i] === originalWords[i]) {
        correctWords++;
      }
    }

    return Math.round((correctWords / maxWords) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Facile';
      case 'medium':
        return 'Moyen';
      case 'hard':
        return 'Difficile';
      default:
        return 'Inconnu';
    }
  };

  // Durée réaliste depuis le nombre de mots (approx. 2 mots/sec à rate TTS 0.7)
  const getDurationSecondsFromText = (text: string | undefined) => {
    if (!text) return 30; // Durée par défaut si pas de texte
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(5, Math.ceil(words / 2)); // minimum 5s pour l'UX
  };

  const formatDurationLabel = (seconds: number) => {
    return seconds < 60 ? `${seconds} s` : `${Math.round(seconds / 60)} min`;
  };

  const getTimeLimitMinutesFromText = (text: string | undefined) => {
    const seconds = getDurationSecondsFromText(text);
    return Math.max(1, Math.round(seconds / 60));
  };

  // Composant de fallback pour les utilisateurs du plan gratuit
  const DictationUpgradePrompt = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navigation />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <Volume2 className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Dictées Audio</h1>
          </div>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Améliorez votre compréhension orale et votre orthographe avec nos dictées interactives
          </p>
        </motion.div>

        {/* Message d'upgrade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-blue-200 bg-white p-8 shadow-xl"
        >
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <Lock className="h-10 w-10 text-white" />
            </div>

            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Dictées Audio - Fonctionnalité Premium
            </h2>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Les dictées audio ne sont pas disponibles avec le plan gratuit. Passez à un plan
              payant pour accéder à cette fonctionnalité et améliorer votre français.
            </p>

            {/* Avantages des dictées */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Volume2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Écoute Active</h3>
                <p className="text-sm text-gray-600">Développez votre compréhension orale</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Orthographe</h3>
                <p className="text-sm text-gray-600">Améliorez votre précision orthographique</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Progression</h3>
                <p className="text-sm text-gray-600">Suivez vos améliorations en temps réel</p>
              </div>
            </div>

            {/* Bouton d'upgrade */}
            <button
              onClick={() => (window.location.href = '/subscription')}
              className="inline-flex transform items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
            >
              <Crown className="h-5 w-5" />
              Voir les Plans d'Abonnement
              <Sparkles className="h-5 w-5" />
            </button>

            <p className="mt-4 text-sm text-gray-500">
              À partir de 14.99 CAD/mois • Annulation possible à tout moment
            </p>
          </div>
        </motion.div>

        {/* Aperçu des dictées */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 rounded-2xl bg-blue-50 p-8"
        >
          <h3 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Aperçu des Dictées Disponibles
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {dictations.map((dictation, index) => (
              <div
                key={dictation.id}
                className="rounded-xl border border-blue-200 bg-white p-6 opacity-75 shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyColor(dictation.difficulty)}`}
                  >
                    {getDifficultyText(dictation.difficulty)}
                  </span>
                </div>

                <h4 className="mb-2 text-lg font-bold text-gray-900">{dictation.title}</h4>
                <p className="mb-4 text-sm text-gray-600">{dictation.description}</p>

                <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {dictation.duration ? `${dictation.duration} min` : formatDurationLabel(getDurationSecondsFromText(dictation.text))}
                  </div>
                  {dictation.text && (
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {dictation.text.split(' ').length} mots
                    </div>
                  )}
                </div>

                <div className="py-2 text-center text-sm font-medium text-blue-600">
                  Disponible avec un abonnement
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  if (selectedText) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navigation />

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4">
            <button
              onClick={() => setSelectedText(null)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              ← Retour aux dictées
            </button>
          </div>
          <SimpleDictationExercise
            text={selectedText.text}
            onComplete={(userText, isCorrect, timeSpent) =>
              handleDictationComplete(selectedText.id, userText, isCorrect, timeSpent)
            }
            onNext={() => setSelectedText(null)}
            timeLimit={getTimeLimitMinutesFromText(selectedText.text)}
          />
        </div>
      </div>
    );
  }

  return (
    <SubscriptionGuard requiredPlan="etudiant" fallback={<DictationUpgradePrompt />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navigation />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3">
                <Volume2 className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Dictées Audio</h1>
            </div>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Améliorez votre compréhension orale et votre orthographe avec nos dictées interactives
            </p>
          </motion.div>

          {/* Statistiques */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl bg-white p-6 shadow-xl"
            >
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Vos résultats</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{results.length}</div>
                  <div className="text-gray-600">Dictées terminées</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / results.length)}%
                  </div>
                  <div className="text-gray-600">Précision moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round(
                      results.reduce((acc, r) => acc + r.timeSpent, 0) / results.length / 60
                    )}
                    min
                  </div>
                  <div className="text-gray-600">Temps moyen</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Liste des dictées */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Chargement des dictées...</p>
              </div>
            ) : error === 'upgrade_required' ? (
              <div className="col-span-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center shadow-lg"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Lock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Fonctionnalité Premium
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Les dictées audio ne sont pas disponibles avec le plan gratuit.
                    <br />
                    Passez à un plan payant pour accéder à cette fonctionnalité.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <a
                      href="/subscription"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      <Crown className="h-5 w-5" />
                      Voir les plans
                    </a>
                    <a
                      href="/exercises"
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      Exercices gratuits
                    </a>
                  </div>
                </motion.div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600">❌ {error}</p>
                <button
                  onClick={loadDictations}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Réessayer
                </button>
              </div>
            ) : dictations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">Aucune dictée disponible pour le moment.</p>
              </div>
            ) : (
              dictations.map((dictation, index) => (
              <motion.div
                key={dictation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyColor(dictation.difficulty)}`}
                    >
                      {getDifficultyText(dictation.difficulty)}
                    </span>
                    {completedDictations.includes(dictation.id) && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Terminé
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mb-2 text-xl font-bold text-gray-900">{dictation.title}</h3>
                <p className="mb-4 text-gray-600">{dictation.description}</p>

                <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {dictation.duration ? `${dictation.duration} min` : formatDurationLabel(getDurationSecondsFromText(dictation.text))}
                  </div>
                  {dictation.text && (
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {dictation.text.split(' ').length} mots
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedText(dictation)}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {completedDictations.includes(dictation.id)
                    ? 'Refaire la dictée'
                    : 'Commencer la dictée'}
                </button>
              </motion.div>
              ))
            )}
          </div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 rounded-2xl bg-blue-50 p-8"
          >
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Comment ça marche ?</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Volume2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">1. Écoutez</h3>
                <p className="text-gray-600">
                  Cliquez sur le bouton play pour écouter le texte. Vous pouvez le réécouter autant
                  de fois que nécessaire.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">2. Écrivez</h3>
                <p className="text-gray-600">
                  Tapez ce que vous entendez dans la zone de texte. Prenez votre temps pour bien
                  orthographier.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">3. Vérifiez</h3>
                <p className="text-gray-600">
                  Obtenez votre score de précision et comparez avec le texte original pour
                  progresser.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SubscriptionGuard>
  );
}
