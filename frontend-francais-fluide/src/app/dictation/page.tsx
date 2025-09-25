// src/app/dictation/page.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, BookOpen, Clock, Target } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import SimpleDictationExercise from '@/components/exercises/SimpleDictationExercise';

interface DictationText {
  id: string;
  title: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  description: string;
}

const DICTATION_TEXTS: DictationText[] = [
  {
    id: '1',
    title: 'Les saisons',
    text: 'Le printemps arrive avec ses fleurs colorées. Les oiseaux chantent dans les arbres. L\'été apporte la chaleur et les longues journées. L\'automne colore les feuilles en orange et rouge. L\'hiver recouvre tout de blanc.',
    difficulty: 'easy',
    estimatedTime: 5,
    description: 'Un texte simple sur les saisons pour débuter'
  },
  {
    id: '2',
    title: 'La technologie moderne',
    text: 'Les smartphones ont révolutionné notre façon de communiquer. Ils nous permettent de rester connectés en permanence. Cependant, il est important de savoir s\'en détacher parfois. La technologie doit rester un outil, pas une dépendance.',
    difficulty: 'medium',
    estimatedTime: 8,
    description: 'Un texte de niveau intermédiaire sur la technologie'
  },
  {
    id: '3',
    title: 'L\'art de la cuisine française',
    text: 'La gastronomie française est reconnue dans le monde entier pour sa sophistication et sa diversité. Chaque région possède ses spécialités culinaires uniques. Les chefs français maîtrisent l\'art de marier les saveurs avec une précision remarquable.',
    difficulty: 'hard',
    estimatedTime: 12,
    description: 'Un texte avancé sur la cuisine française'
  }
];

export default function DictationPage() {
  const [selectedText, setSelectedText] = useState<DictationText | null>(null);
  const [completedDictations, setCompletedDictations] = useState<string[]>([]);
  const [results, setResults] = useState<Array<{
    textId: string;
    userText: string;
    isCorrect: boolean;
    timeSpent: number;
    accuracy: number;
  }>>([]);

  const handleDictationComplete = (textId: string, userText: string, isCorrect: boolean, timeSpent: number) => {
    const accuracy = calculateAccuracy(userText, selectedText?.text || '');
    
    setResults(prev => [...prev, {
      textId,
      userText,
      isCorrect,
      timeSpent,
      accuracy
    }]);

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
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (selectedText) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SimpleDictationExercise
            text={selectedText.text}
            onComplete={(userText, isCorrect, timeSpent) => 
              handleDictationComplete(selectedText.id, userText, isCorrect, timeSpent)
            }
            onNext={() => setSelectedText(null)}
            timeLimit={selectedText.estimatedTime}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Volume2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Dictées Audio</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Améliorez votre compréhension orale et votre orthographe avec nos dictées interactives
          </p>
        </motion.div>


        {/* Statistiques */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-xl mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vos résultats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {Math.round(results.reduce((acc, r) => acc + r.timeSpent, 0) / results.length / 60)}min
                </div>
                <div className="text-gray-600">Temps moyen</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Liste des dictées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DICTATION_TEXTS.map((dictation, index) => (
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(dictation.difficulty)}`}>
                    {getDifficultyText(dictation.difficulty)}
                  </span>
                  {completedDictations.includes(dictation.id) && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Terminé
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{dictation.title}</h3>
              <p className="text-gray-600 mb-4">{dictation.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {dictation.estimatedTime} min
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {dictation.text.split(' ').length} mots
                </div>
              </div>

              <button
                onClick={() => setSelectedText(dictation)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {completedDictations.includes(dictation.id) ? 'Refaire la dictée' : 'Commencer la dictée'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-blue-50 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Volume2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Écoutez</h3>
              <p className="text-gray-600">Cliquez sur le bouton play pour écouter le texte. Vous pouvez le réécouter autant de fois que nécessaire.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Écrivez</h3>
              <p className="text-gray-600">Tapez ce que vous entendez dans la zone de texte. Prenez votre temps pour bien orthographier.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Vérifiez</h3>
              <p className="text-gray-600">Obtenez votre score de précision et comparez avec le texte original pour progresser.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
