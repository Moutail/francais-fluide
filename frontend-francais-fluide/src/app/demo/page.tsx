// src/app/demo/page.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  Zap,
  BookOpen
} from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import { cn } from '@/lib/utils/cn';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  content: string;
  expectedInput?: string;
  explanation?: string;
  type: 'introduction' | 'typing' | 'correction' | 'explanation';
}

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const demoSteps: DemoStep[] = [
    {
      id: 'intro',
      title: 'Bienvenue dans la démo',
      description: 'Découvrez comment FrançaisFluide vous aide à améliorer votre français',
      content: 'FrançaisFluide utilise l\'intelligence artificielle pour vous aider à écrire sans fautes. Commençons par un exemple simple.',
      type: 'introduction'
    },
    {
      id: 'typing',
      title: 'Écrivez votre texte',
      description: 'Tapez le texte suivant dans l\'éditeur',
      content: 'Les enfants sont allés chez leurs grands-parents.',
      expectedInput: 'Les enfants sont allés chez leurs grands-parents.',
      type: 'typing'
    },
    {
      id: 'correction',
      title: 'Correction automatique',
      description: 'L\'IA détecte et corrige les erreurs en temps réel',
      content: 'Les enfants sont allés chez leurs grands-parents.',
      explanation: 'Parfait ! Vous avez écrit "allés" correctement. Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet "les enfants" (masculin pluriel).',
      type: 'correction'
    },
    {
      id: 'explanation',
      title: 'Explication pédagogique',
      description: 'Comprenez pourquoi cette correction est importante',
      content: 'L\'accord du participe passé avec "être" est une règle fondamentale du français. Le participe passé s\'accorde toujours en genre et en nombre avec le sujet.',
      type: 'explanation'
    }
  ];

  const currentDemoStep = demoSteps[currentStep];

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setUserInput('');
    setShowFeedback(false);
  };

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserInput('');
      setShowFeedback(false);
    } else {
      setIsPlaying(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setUserInput('');
      setShowFeedback(false);
    }
  };

  const handleInputChange = (value: string) => {
    setUserInput(value);
    
    if (currentDemoStep.type === 'typing' && currentDemoStep.expectedInput) {
      if (value === currentDemoStep.expectedInput) {
        setShowFeedback(true);
        setTimeout(() => {
          nextStep();
        }, 1500);
      }
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'introduction': return Sparkles;
      case 'typing': return BookOpen;
      case 'correction': return Target;
      case 'explanation': return Lightbulb;
      default: return Sparkles;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'introduction': return 'from-blue-500 to-indigo-500';
      case 'typing': return 'from-green-500 to-emerald-500';
      case 'correction': return 'from-yellow-500 to-orange-500';
      case 'explanation': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contrôles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            {!isPlaying ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startDemo}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg"
              >
                <Play className="w-5 h-5" />
                Commencer la démo
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(false)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg"
              >
                <Pause className="w-5 h-5" />
                Pause
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(0);
                setUserInput('');
                setShowFeedback(false);
              }}
              className="px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Recommencer
            </motion.button>
          </div>

          <div className="text-sm text-gray-600">
            Étape {currentStep + 1} sur {demoSteps.length}
          </div>
        </motion.div>

        {/* Barre de progression */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Contenu de la démo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-6"
          >
            {/* En-tête de l'étape */}
            <div className="flex items-center gap-4 mb-6">
              <div className={cn(
                "p-3 rounded-xl bg-gradient-to-r",
                getStepColor(currentDemoStep.type)
              )}>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {React.createElement(getStepIcon(currentDemoStep.type), {
                    className: "w-6 h-6 text-white"
                  })}
                </motion.div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentDemoStep.title}
                </h2>
                <p className="text-gray-600">
                  {currentDemoStep.description}
                </p>
              </div>
            </div>

            {/* Contenu selon le type */}
            {currentDemoStep.type === 'introduction' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg text-gray-700 leading-relaxed"
              >
                {currentDemoStep.content}
              </motion.div>
            )}

            {currentDemoStep.type === 'typing' && (
              <div className="space-y-4">
                <div className="text-lg text-gray-700">
                  Tapez le texte suivant :
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-lg font-medium text-blue-900 mb-2">
                    Texte à écrire :
                  </div>
                  <div className="text-blue-800">
                    {currentDemoStep.expectedInput}
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={userInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-lg"
                    rows={3}
                    placeholder="Tapez votre texte ici..."
                  />
                  {showFeedback && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2 -top-2"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {currentDemoStep.type === 'correction' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Texte correct !</span>
                  </div>
                  <div className="text-green-800">
                    {currentDemoStep.content}
                  </div>
                </div>
                {currentDemoStep.explanation && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Explication :</span>
                    </div>
                    <div className="text-blue-800">
                      {currentDemoStep.explanation}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentDemoStep.type === 'explanation' && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Règle importante :</span>
                  </div>
                  <div className="text-purple-800 leading-relaxed">
                    {currentDemoStep.content}
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Conseil :</span>
                  </div>
                  <div className="text-yellow-800">
                    FrançaisFluide vous aidera à mémoriser ces règles grâce à des exercices personnalisés et des rappels intelligents.
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevStep}
              disabled={currentStep === 0}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all",
                currentStep === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-700 shadow-lg"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              Précédent
            </motion.button>

            <div className="flex gap-2">
              {demoSteps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    index === currentStep
                      ? "bg-blue-600 scale-125"
                      : index < currentStep
                      ? "bg-green-500"
                      : "bg-gray-300"
                  )}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              disabled={currentStep === demoSteps.length - 1 && currentDemoStep.type !== 'typing'}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all",
                currentStep === demoSteps.length - 1 && currentDemoStep.type !== 'typing'
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              )}
            >
              {currentStep === demoSteps.length - 1 ? 'Terminer' : 'Suivant'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Résumé de fin */}
        {!isPlaying && currentStep === demoSteps.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-8 h-8" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-4">
              Démo terminée !
            </h3>
            <p className="text-blue-100 mb-6">
              Vous avez découvert les principales fonctionnalités de FrançaisFluide. 
              Prêt à commencer votre apprentissage ?
            </p>
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/auth/login'}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Créer un compte
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
              >
                Retour à l'accueil
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
