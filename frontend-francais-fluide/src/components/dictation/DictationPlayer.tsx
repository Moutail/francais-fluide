'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/professional/Button';
import { Card } from '@/components/ui/professional/Card';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Volume2, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DictationPlayerProps {
  dictation: {
    id: string;
    title: string;
    description?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    audioUrl?: string;
  };
  onSubmit: (userText: string, timeSpent: number) => void;
  loading?: boolean;
}

export default function DictationPlayer({ dictation, onSubmit, loading = false }: DictationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [userText, setUserText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const difficultyColors = {
    beginner: 'text-green-600 bg-green-50 border-green-200',
    intermediate: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    advanced: 'text-red-600 bg-red-50 border-red-200'
  };

  const difficultyLabels = {
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé'
  };

  useEffect(() => {
    // Démarrer le chronomètre quand l'utilisateur commence à taper
    if (userText.length > 0 && startTime === null) {
      setStartTime(Date.now());
      startTimer();
    }
  }, [userText, startTime]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (startTime) {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handlePlay = async () => {
    if (!dictation.audioUrl) {
      // Simulation audio pour les dictées sans fichier audio
      setIsPlaying(true);
      setPlayCount(prev => prev + 1);
      
      // Simuler la durée de lecture
      setTimeout(() => {
        setIsPlaying(false);
      }, dictation.duration * 1000);
      
      return;
    }

    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
          setPlayCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Erreur lecture audio:', error);
        // Fallback: mode simulation
        setIsPlaying(true);
        setTimeout(() => setIsPlaying(false), dictation.duration * 1000);
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleSubmit = () => {
    if (userText.trim().length < 10) {
      alert('Veuillez saisir au moins 10 caractères avant de soumettre.');
      return;
    }

    stopTimer();
    const finalTimeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : timeSpent;
    onSubmit(userText, finalTimeSpent);
    setShowSubmitConfirm(false);
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = userText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const estimatedDuration = dictation.duration;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête de la dictée */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {dictation.title}
            </h1>
            {dictation.description && (
              <p className="text-gray-600 mb-3">{dictation.description}</p>
            )}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[dictation.difficulty]}`}>
            {difficultyLabels[dictation.difficulty]}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Durée estimée: {estimatedDuration}s</span>
          </div>
          <div className="flex items-center gap-1">
            <Volume2 className="w-4 h-4" />
            <span>Écoutes: {playCount}</span>
          </div>
          {startTime && (
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Temps écoulé: {formatTime(timeSpent)}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Lecteur audio */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Lecteur audio</h2>
        
        {dictation.audioUrl && (
          <audio
            ref={audioRef}
            onEnded={handleAudioEnd}
            preload="metadata"
          >
            <source src={dictation.audioUrl} type="audio/mpeg" />
            <source src={dictation.audioUrl} type="audio/wav" />
            Votre navigateur ne supporte pas l'élément audio.
          </audio>
        )}

        <div className="flex items-center gap-4">
          <Button
            onClick={handlePlay}
            disabled={loading}
            className="flex items-center gap-2"
            variant={isPlaying ? "secondary" : "primary"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Écouter
              </>
            )}
          </Button>

          <Button
            onClick={handleStop}
            disabled={!isPlaying && playCount === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Arrêter
          </Button>

          <Button
            onClick={handleRestart}
            disabled={playCount === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Recommencer
          </Button>
        </div>

        {!dictation.audioUrl && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Mode simulation - Aucun fichier audio disponible. Utilisez le bouton "Écouter" pour démarrer le chronomètre.
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Zone de saisie */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Votre dictée</h2>
        
        <div className="space-y-4">
          <textarea
            ref={textareaRef}
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="Tapez ici ce que vous entendez..."
            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Mots saisis: {wordCount}</span>
            <span>Caractères: {userText.length}</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {userText.length > 0 ? (
              <span className="text-green-600">✓ Prêt à soumettre</span>
            ) : (
              <span>Commencez à taper pour activer la soumission</span>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setUserText('');
                setStartTime(null);
                setTimeSpent(0);
                stopTimer();
              }}
              variant="outline"
              disabled={loading || userText.length === 0}
            >
              Effacer
            </Button>

            <Button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={loading || userText.trim().length < 10}
              className="min-w-32"
            >
              {loading ? 'Envoi...' : 'Soumettre'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal de confirmation */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmer la soumission</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>• Mots saisis: {wordCount}</p>
              <p>• Temps écoulé: {formatTime(timeSpent)}</p>
              <p>• Écoutes: {playCount}</p>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Êtes-vous sûr de vouloir soumettre votre dictée ? Vous ne pourrez plus la modifier après.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowSubmitConfirm(false)}
                variant="outline"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
              >
                Confirmer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
