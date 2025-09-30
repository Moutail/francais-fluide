'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ExerciseGeneratorProps {
  onExerciseGenerated: (exercise: any) => void;
  onClose?: () => void;
}

export default function ExerciseGenerator({
  onExerciseGenerated,
  onClose,
}: ExerciseGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [formData, setFormData] = useState({
    type: 'grammar',
    difficulty: 'medium',
    level: 2,
    topic: '',
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
      const response = await fetch('/api/ai-enhanced/generate-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          count: 1,
          focusAreas: [formData.type],
          difficulty: formData.difficulty,
          userProfile: {
            level: formData.level,
            preferredTypes: [formData.type],
            topic: formData.topic,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data?.message || 'Erreur lors de la génération.');
        return;
      }

      if (data.success && data.data.exercises.length > 0) {
        const exercise = data.data.exercises[0];
        // L'exercice est déjà dans le bon format depuis le backend
        onExerciseGenerated(exercise);
        setSuccessMsg('Exercice IA généré et sauvegardé !');
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
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Générateur d'exercices IA</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="Fermer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Type d'exercice</label>
          <select
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-purple-500"
          >
            <option value="grammar">Grammaire</option>
            <option value="vocabulary">Vocabulaire</option>
            <option value="conjugation">Conjugaison</option>
            <option value="spelling">Orthographe</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Difficulté</label>
          <select
            value={formData.difficulty}
            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-purple-500"
          >
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Niveau</label>
          <select
            value={formData.level}
            onChange={e => setFormData({ ...formData, level: parseInt(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-purple-500"
          >
            <option value={1}>Niveau 1</option>
            <option value={2}>Niveau 2</option>
            <option value={3}>Niveau 3</option>
            <option value={4}>Niveau 4</option>
            <option value={5}>Niveau 5</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Thème (optionnel)</label>
          <input
            type="text"
            value={formData.topic}
            onChange={e => setFormData({ ...formData, topic: e.target.value })}
            placeholder="Ex: participes passés, subjonctif..."
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={cn(
          'flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3 font-semibold transition-all',
          isGenerating
            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:from-purple-700 hover:to-blue-700 hover:shadow-xl'
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Générer un exercice
          </>
        )}
      </button>

      {errorMsg && <div className="mt-4 text-center text-sm text-red-600">{errorMsg}</div>}
      {successMsg && <div className="mt-4 text-center text-sm text-green-600">{successMsg}</div>}

      <div className="mt-2 text-center text-sm text-gray-600">
        L'IA va créer un exercice personnalisé basé sur vos critères
      </div>
    </motion.div>
  );
}
