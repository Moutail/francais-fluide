'use client';

import React from 'react';
import { Clock, RefreshCw, AlertTriangle } from 'lucide-react';

interface RateLimitMessageProps {
  onRetry: () => void;
  onClose: () => void;
}

export default function RateLimitMessage({ onRetry, onClose }: RateLimitMessageProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Trop de tentatives de connexion
          </h3>
        </div>

        <div className="space-y-3 text-gray-600">
          <p>
            Vous avez effectué trop de tentatives de connexion en peu de temps.
          </p>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Veuillez attendre quelques minutes avant de réessayer.</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-1">Conseils :</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Vérifiez vos identifiants avant de cliquer</li>
              <li>• Attendez 2-3 minutes entre les tentatives</li>
              <li>• Contactez le support si le problème persiste</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer plus tard
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
