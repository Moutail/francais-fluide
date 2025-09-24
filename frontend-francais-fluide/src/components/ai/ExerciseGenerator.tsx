'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ExerciseGeneratorProps {
  onExerciseGenerated: (exercise: any) => void;
  onClose?: () => void;
}

export default function ExerciseGenerator({ onExerciseGenerated, onClose }: ExerciseGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [formData, setFormData] = useState({
    type: 'grammar',
    difficulty: 'medium',
    level: 2,
    topic: ''
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        setErrorMsg('Vous devez être connecté pour générer un exercice.');
        return;
      }

      // Utiliser l'API IA améliorée
      const response = await fetch('http://localhost:3001/api/ai-enhanced/generate-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          count: 1,
          focusAreas: [formData.type],
          difficulty: formData.difficulty,
          userProfile: {
            level: formData.level,
            preferredTypes: [formData.type],
            topic: formData.topic
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data?.message || 'Erreur lors de la génération.');
        return;
      }
      
      if (data.success && data.data.exercises.length > 0) {
        const exercise = data.data.exercises[0];
        // Adapter le format pour le frontend
        const adaptedExercise = {
          id: `ai_${Date.now()}`,
          title: exercise.title,
          description: exercise.description,
          type: exercise.type,
          difficulty: exercise.difficulty,
          level: formData.level,
          estimatedTime: 10, // Par défaut
          questions: exercise.questions || [],
          completed: false,
          isAI: true,
          score: undefined
        };
        onExerciseGenerated(adaptedExercise);
        setSuccessMsg('Exercice IA généré !');
      } else {
        setErrorMsg(data.message || 'Aucun exercice généré.');
      }
    } catch (error) {
      setErrorMsg('Erreur réseau lors de la génération.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Générateur d'exercices IA
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type d'exercice
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="grammar">Grammaire</option>
            <option value="vocabulary">Vocabulaire</option>
            <option value="conjugation">Conjugaison</option>
            <option value="spelling">Orthographe</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulté
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau
          </label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value={1}>Niveau 1</option>
            <option value={2}>Niveau 2</option>
            <option value={3}>Niveau 3</option>
            <option value={4}>Niveau 4</option>
            <option value={5}>Niveau 5</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème (optionnel)
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="Ex: participes passés, subjonctif..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={cn(
          "w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all",
          isGenerating
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Générer un exercice
          </>
        )}
      </button>

      {errorMsg && (
        <div className="mt-4 text-sm text-red-600 text-center">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="mt-4 text-sm text-green-600 text-center">{successMsg}</div>
      )}

      <div className="mt-2 text-sm text-gray-600 text-center">
        L'IA va créer un exercice personnalisé basé sur vos critères
      </div>
    </motion.div>
  );
}
