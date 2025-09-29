'use client';

import React from 'react';
import { Button } from '@/components/ui/professional/Button';
import { Card } from '@/components/ui/professional/Card';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  BookOpen,
  TrendingUp,
  RotateCcw,
  Home
} from 'lucide-react';

interface DictationResultsProps {
  results: {
    score: number;
    correctWords: number;
    totalWords: number;
    accuracy: number;
    timeSpent: number;
    originalText: string;
    feedback: {
      excellent: boolean;
      good: boolean;
      needsImprovement: boolean;
      message: string;
    };
  };
  userText: string;
  dictationTitle: string;
  onRetry: () => void;
  onBackToList: () => void;
}

export default function DictationResults({ 
  results, 
  userText, 
  dictationTitle,
  onRetry,
  onBackToList
}: DictationResultsProps) {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const highlightDifferences = (original: string, user: string) => {
    const originalWords = original.toLowerCase().split(/\s+/);
    const userWords = user.toLowerCase().split(/\s+/);
    
    const maxLength = Math.max(originalWords.length, userWords.length);
    const comparison = [];
    
    for (let i = 0; i < maxLength; i++) {
      const originalWord = originalWords[i] || '';
      const userWord = userWords[i] || '';
      
      comparison.push({
        original: originalWord,
        user: userWord,
        correct: originalWord === userWord && originalWord !== '',
        missing: originalWord && !userWord,
        extra: !originalWord && userWord
      });
    }
    
    return comparison;
  };

  const wordComparison = highlightDifferences(results.originalText, userText);
  const wordsPerMinute = results.timeSpent > 0 ? Math.round((userText.split(/\s+/).length / results.timeSpent) * 60) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Résultats principaux */}
      <Card className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Résultats de la dictée
          </h1>
          <p className="text-gray-600">{dictationTitle}</p>
        </div>

        {/* Score principal */}
        <div className={`text-center p-6 rounded-lg border ${getScoreBgColor(results.score)} mb-6`}>
          <div className={`text-4xl font-bold ${getScoreColor(results.score)} mb-2`}>
            {results.score}%
          </div>
          <div className="text-lg text-gray-700 mb-2">
            {results.feedback.message}
          </div>
          {results.feedback.excellent && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Excellent travail !</span>
            </div>
          )}
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{results.correctWords}</div>
            <div className="text-sm text-gray-600">Mots corrects</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{results.totalWords}</div>
            <div className="text-sm text-gray-600">Mots totaux</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{formatTime(results.timeSpent)}</div>
            <div className="text-sm text-gray-600">Temps passé</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{wordsPerMinute}</div>
            <div className="text-sm text-gray-600">Mots/minute</div>
          </div>
        </div>
      </Card>

      {/* Comparaison texte */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Comparaison détaillée</h2>
        
        <div className="space-y-4">
          {/* Texte original */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Texte original :</h3>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-gray-900 leading-relaxed">{results.originalText}</p>
            </div>
          </div>

          {/* Votre texte */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Votre texte :</h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-gray-900 leading-relaxed">{userText}</p>
            </div>
          </div>

          {/* Comparaison mot par mot */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Analyse mot par mot :</h3>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex flex-wrap gap-1">
                {wordComparison.map((word, index) => {
                  if (word.correct) {
                    return (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                        title="Correct"
                      >
                        {word.original}
                      </span>
                    );
                  } else if (word.missing) {
                    return (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm line-through"
                        title="Mot manquant"
                      >
                        {word.original}
                      </span>
                    );
                  } else if (word.extra) {
                    return (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm"
                        title="Mot en trop"
                      >
                        +{word.user}
                      </span>
                    );
                  } else {
                    return (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
                        title={`Incorrect: "${word.user}" au lieu de "${word.original}"`}
                      >
                        {word.user}
                      </span>
                    );
                  }
                })}
              </div>
              
              {/* Légende */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                  <span>Incorrect</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-100 rounded"></div>
                  <span>Manquant</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-100 rounded"></div>
                  <span>En trop</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Conseils d'amélioration */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Conseils pour s'améliorer</h2>
        
        <div className="space-y-3 text-sm text-gray-700">
          {results.score < 50 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-medium text-red-800 mb-1">Points à travailler :</p>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li>Écoutez plusieurs fois avant de commencer à écrire</li>
                <li>Concentrez-vous sur les mots de liaison</li>
                <li>Relisez votre texte avant de soumettre</li>
              </ul>
            </div>
          )}
          
          {results.score >= 50 && results.score < 80 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-800 mb-1">Bon progrès ! Continuez ainsi :</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                <li>Travaillez sur la ponctuation</li>
                <li>Attention aux accords et conjugaisons</li>
                <li>Prenez le temps de bien écouter chaque phrase</li>
              </ul>
            </div>
          )}
          
          {results.score >= 80 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-800 mb-1">Excellent niveau ! Pour aller plus loin :</p>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                <li>Essayez des dictées plus difficiles</li>
                <li>Travaillez la vitesse d'écriture</li>
                <li>Perfectionnez les nuances grammaticales</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRetry}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Recommencer cette dictée
          </Button>
          
          <Button
            onClick={onBackToList}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Retour aux dictées
          </Button>
        </div>
      </Card>
    </div>
  );
}
