// src/components/exercises/SimpleDictationExercise.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Volume2, 
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SimpleDictationExerciseProps {
  text: string;
  onComplete: (userText: string, isCorrect: boolean, timeSpent: number) => void;
  onNext?: () => void;
  timeLimit?: number; // en minutes
}

export default function SimpleDictationExercise({ 
  text, 
  onComplete, 
  onNext,
  timeLimit = 10 
}: SimpleDictationExerciseProps) {
  const [userText, setUserText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // en secondes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Initialiser SpeechSynthesis côté client
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynth(window.speechSynthesis);
    }
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsTimerActive(false);
            handleSubmit();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = async () => {
    if (!synth) {
      alert('La synthèse vocale n\'est pas supportée par votre navigateur');
      return;
    }

    if (isPlaying) {
      if (synth.paused) {
        synth.resume();
      } else {
        synth.pause();
      }
    } else {
      try {
        // Arrêter toute lecture en cours
        synth.cancel();

        const newUtterance = new SpeechSynthesisUtterance(text);
        setUtterance(newUtterance);

        // Configuration pour la dictée
        newUtterance.rate = 0.7; // Vitesse ralentie
        newUtterance.pitch = 1.0;
        newUtterance.volume = 1.0;
        newUtterance.lang = 'fr-FR';

        // Sélectionner une voix française si disponible
        const voices = synth.getVoices();
        const frenchVoice = voices.find(voice => 
          voice.lang.startsWith('fr') || 
          voice.name.toLowerCase().includes('french')
        );
        
        if (frenchVoice) {
          newUtterance.voice = frenchVoice;
        }

        // Gestion des événements
        newUtterance.onstart = () => {
          setIsPlaying(true);
        };

        newUtterance.onend = () => {
          setIsPlaying(false);
          setUtterance(null);
        };

        newUtterance.onerror = (event) => {
          console.error('Erreur TTS:', event.error);
          setIsPlaying(false);
          setUtterance(null);
        };

        // Lancer la lecture
        synth.speak(newUtterance);
        setPlayCount(prev => prev + 1);
        
        if (!hasStarted) {
          setHasStarted(true);
          setIsTimerActive(true);
        }
      } catch (error) {
        console.error('Erreur lecture audio:', error);
        alert('Erreur lors de la lecture audio');
      }
    }
  };

  const handleStop = () => {
    if (synth) {
      synth.cancel();
      setIsPlaying(false);
      setUtterance(null);
    }
  };

  const handleReset = () => {
    handleStop();
    setUserText('');
    setPlayCount(0);
    setTimeLeft(timeLimit * 60);
    setIsTimerActive(false);
    setHasStarted(false);
    setShowResult(false);
  };

  const handleSubmit = () => {
    if (!userText.trim()) return;

    setIsTimerActive(false);
    
    // Comparaison simple (peut être améliorée)
    const normalizedUserText = userText.toLowerCase().trim();
    const normalizedOriginalText = text.toLowerCase().trim();
    
    const correct = normalizedUserText === normalizedOriginalText;
    setIsCorrect(correct);
    setShowResult(true);

    // Calculer le temps passé
    const timeSpent = timeLimit * 60 - timeLeft;
    
    onComplete(userText, correct, timeSpent);
  };

  const getAccuracy = () => {
    if (!userText || !text) return 0;
    
    const userWords = userText.toLowerCase().split(/\s+/);
    const originalWords = text.toLowerCase().split(/\s+/);
    
    let correctWords = 0;
    const maxWords = Math.max(userWords.length, originalWords.length);
    
    for (let i = 0; i < Math.min(userWords.length, originalWords.length); i++) {
      if (userWords[i] === originalWords[i]) {
        correctWords++;
      }
    }
    
    return Math.round((correctWords / maxWords) * 100);
  };

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 shadow-xl text-center"
      >
        <div className="mb-6">
          {isCorrect ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {isCorrect ? 'Excellent !' : 'À améliorer'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            Précision : {getAccuracy()}%
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="text-left">
            <h4 className="font-semibold text-gray-900 mb-2">Texte original :</h4>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{text}</p>
          </div>
          
          <div className="text-left">
            <h4 className="font-semibold text-gray-900 mb-2">Votre texte :</h4>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{userText}</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Recommencer
          </button>
          
          {onNext && (
            <button
              onClick={onNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Suivant
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 shadow-xl"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Volume2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Dictée Audio</h2>
            <p className="text-gray-600">Écoutez et écrivez le texte</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 text-lg font-mono">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className={cn(
            "font-bold",
            timeLeft < 60 ? "text-red-500" : "text-gray-700"
          )}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Contrôles audio */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handlePlay}
            disabled={!text || !synth}
            className={cn(
              "p-4 rounded-full transition-all duration-200",
              isPlaying
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            )}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={handleStop}
            disabled={!isPlaying}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="w-6 h-6" />
          </button>

          <button
            onClick={handleReset}
            className="p-4 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Lectures : {playCount} | Temps écoulé : {formatTime(timeLimit * 60 - timeLeft)}</p>
          {!synth && (
            <p className="text-red-500 mt-1">⚠️ La synthèse vocale n'est pas supportée</p>
          )}
        </div>
      </div>

      {/* Zone de texte */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Écrivez ce que vous entendez :
        </label>
        <textarea
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Commencez à écrire ici..."
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={!hasStarted}
        />
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-between">
        <div className="text-sm text-gray-500">
          {hasStarted ? (
            <span>Dictée en cours...</span>
          ) : (
            <span>Cliquez sur ▶️ pour commencer</span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!userText.trim() || !hasStarted}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Terminer la dictée
        </button>
      </div>
    </motion.div>
  );
}
