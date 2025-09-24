'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SmartEditor } from '@/components/editor/SmartEditor';
import { useLanguageTool } from '@/hooks/useLanguageTool';
import { CheckCircle, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';

export default function TestLanguageToolPage() {
  const [text, setText] = useState('Bonjour, je suis un texte de test pour vérifier la correction grammaticale. Il y a peut-être des erreurs dans ce texte.');
  const { checkGrammar, isChecking, isAvailable, isReady, lastCheck } = useLanguageTool();

  const handleTest = async () => {
    const result = await checkGrammar(text);
    console.log('Résultat LanguageTool:', result);
  };

  const getStatusInfo = () => {
    if (isChecking) {
      return {
        icon: <RefreshCw className="w-5 h-5 animate-spin" />,
        text: 'Vérification en cours...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      };
    }

    if (isAvailable === true) {
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        text: 'LanguageTool connecté',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    }

    if (isAvailable === false) {
      return {
        icon: <WifiOff className="w-5 h-5" />,
        text: 'LanguageTool indisponible',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    }

    return {
      icon: <Wifi className="w-5 h-5" />,
      text: 'Connexion en cours...',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    };
  };

  const status = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test LanguageTool
          </h1>
          <p className="text-gray-600">
            Testez l'intégration de l'API LanguageTool pour la correction grammaticale
          </p>
        </div>

        {/* Statut de l'API */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Statut de l'API LanguageTool
          </h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
              {status.icon}
              <span>{status.text}</span>
            </div>
            
            <button
              onClick={handleTest}
              disabled={!isReady || isChecking}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChecking ? 'Test en cours...' : 'Tester la connexion'}
            </button>
          </div>

          {lastCheck && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Dernier résultat :</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Erreurs totales :</span>
                  <span className="ml-2 font-medium">{lastCheck.metrics.totalErrors}</span>
                </div>
                <div>
                  <span className="text-gray-600">Précision :</span>
                  <span className="ml-2 font-medium">{Math.round(lastCheck.metrics.accuracy)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Suggestions :</span>
                  <span className="ml-2 font-medium">{lastCheck.metrics.suggestions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Erreurs de grammaire :</span>
                  <span className="ml-2 font-medium">{lastCheck.metrics.grammarErrors}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Éditeur de test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Éditeur de Test
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texte à analyser :
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tapez du texte avec des erreurs pour tester la correction..."
            />
          </div>

          <div className="text-sm text-gray-600">
            <p>💡 <strong>Conseil :</strong> Essayez des phrases avec des erreurs courantes comme :</p>
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>"Je suis aller au magasin" (erreur de conjugaison)</li>
              <li>"Il a manger une pomme" (erreur d'accord)</li>
              <li>"C'est un beau voiture" (erreur d'accord)</li>
              <li>"Je vais au magasin demain" (erreur de temps)</li>
            </ul>
          </div>
        </motion.div>

        {/* Éditeur intelligent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Éditeur Intelligent avec LanguageTool
          </h2>
          
          <SmartEditor
            initialValue={text}
            placeholder="Commencez à écrire... LanguageTool vous aidera à corriger vos erreurs en temps réel !"
            mode="practice"
            realTimeCorrection={true}
            className="min-h-[300px]"
          />
        </motion.div>

        {/* Informations sur l'API */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            ℹ️ Informations sur LanguageTool
          </h3>
          
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>API utilisée :</strong> https://api.languagetool.org/v2/check
            </p>
            <p>
              <strong>Fonctionnalités :</strong> Détection d'erreurs de grammaire, orthographe, style et typographie
            </p>
            <p>
              <strong>Langues supportées :</strong> Français, Anglais, Allemand, Espagnol, et bien d'autres
            </p>
            <p>
              <strong>Limitations :</strong> 1000 requêtes par jour en version gratuite
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
