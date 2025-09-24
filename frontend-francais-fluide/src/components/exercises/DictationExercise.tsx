'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DictationExerciseProps {
  id: string;
  title: string;
  audioUrl: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number;
  onComplete: (score: number, timeSpent: number) => void;
  onSkip: () => void;
}

interface DictationResult {
  accuracy: number;
  errors: Array<{
    position: number;
    expected: string;
    actual: string;
    type: 'spelling' | 'grammar' | 'punctuation';
  }>;
  timeSpent: number;
}

export const DictationExercise: React.FC<DictationExerciseProps> = ({
  id,
  title,
  audioUrl,
  text,
  difficulty,
  timeLimit = 300, // 5 minutes par défaut
  onComplete,
  onSkip
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [userText, setUserText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<DictationResult | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Gestion du timer
  useEffect(() => {
    if (hasStarted && !isCompleted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [hasStarted, isCompleted, timeRemaining]);

  // Gestion de l'audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPaused(true);
    } else {
      audio.play();
      setIsPaused(false);
      if (!hasStarted) {
        setHasStarted(true);
      }
    }
  };

  const handleReplay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play();
    setIsPaused(false);
  };

  const handleSpeedChange = (speed: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    setPlaybackSpeed(speed);
    audio.playbackRate = speed;
  };

  const handleComplete = () => {
    if (isCompleted) return;

    setIsCompleted(true);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Analyser le texte de l'utilisateur
    const analysis = analyzeDictation(userText, text);
    setResult(analysis);
    setShowResults(true);

    // Calculer le score
    const score = Math.round(analysis.accuracy);
    const timeSpent = timeLimit - timeRemaining;
    
    setTimeout(() => {
      onComplete(score, timeSpent);
    }, 2000);
  };

  const analyzeDictation = (userText: string, correctText: string): DictationResult => {
    const userWords = userText.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const correctWords = correctText.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    const errors: DictationResult['errors'] = [];
    let correctCount = 0;
    
    // Comparaison mot par mot
    const maxLength = Math.max(userWords.length, correctWords.length);
    for (let i = 0; i < maxLength; i++) {
      const userWord = userWords[i] || '';
      const correctWord = correctWords[i] || '';
      
      if (userWord === correctWord) {
        correctCount++;
      } else {
        errors.push({
          position: i,
          expected: correctWord,
          actual: userWord,
          type: 'spelling'
        });
      }
    }
    
    const accuracy = correctWords.length > 0 ? (correctCount / correctWords.length) * 100 : 0;
    
    return {
      accuracy,
      errors,
      timeSpent: timeLimit - timeRemaining
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            <span className={cn("px-3 py-1 rounded-full text-sm font-medium", getDifficultyColor())}>
              {difficulty === 'beginner' ? 'Débutant' : 
               difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
            </span>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>Instructions :</strong> Écoutez l'audio et écrivez exactement ce que vous entendez. 
            Vous pouvez rejouer l'audio autant de fois que nécessaire.
          </p>
        </div>
      </div>

      {/* Contrôles audio */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handleReplay}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            title="Rejouer depuis le début"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handlePlayPause}
            className={cn(
              "p-4 rounded-full transition-all",
              isPlaying 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-blue-500 hover:bg-blue-600 text-white"
            )}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Vitesse:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
            </select>
          </div>
        </div>

        {/* Barre de progression audio */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-100"
            style={{ 
              width: audioRef.current ? 
                `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%` : '0%' 
            }}
          />
        </div>
      </div>

      {/* Zone de texte */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Votre texte :
        </label>
        <textarea
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Commencez à écrire ce que vous entendez..."
          className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isCompleted}
        />
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            {userText.length} caractères
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Passer
            </button>
            <button
              onClick={handleComplete}
              disabled={!userText.trim() || isCompleted}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Terminer
            </button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <AnimatePresence>
        {showResults && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Résultats</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{result.accuracy.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Précision</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{result.errors.length}</div>
                <div className="text-sm text-gray-600">Erreurs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{formatTime(result.timeSpent)}</div>
                <div className="text-sm text-gray-600">Temps</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Erreurs détectées :</h4>
                <div className="space-y-2">
                  {result.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-gray-600">Mot {error.position + 1}:</span>
                      <span className="text-red-600">{error.actual}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600">{error.expected}</span>
                    </div>
                  ))}
                  {result.errors.length > 5 && (
                    <div className="text-sm text-gray-500">
                      ... et {result.errors.length - 5} autres erreurs
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio element caché */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />
    </div>
  );
};
