'use client';

import React from 'react';
import { Clock, RefreshCw, AlertTriangle } from 'lucide-react';

interface RateLimitMessageProps {
  onRetry: () => void;
  onClose: () => void;
}

export default function RateLimitMessage({ onRetry, onClose }: RateLimitMessageProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-yellow-100 p-2">
            <AlertTriangle className="size-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Trop de tentatives de connexion</h3>
        </div>

        <div className="space-y-3 text-gray-600">
          <p>Vous avez effectué trop de tentatives de connexion en peu de temps.</p>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-gray-400" />
            <span>Veuillez attendre quelques minutes avant de réessayer.</span>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <h4 className="mb-1 font-medium text-blue-900">Conseils :</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Vérifiez vos identifiants avant de cliquer</li>
              <li>• Attendez 2-3 minutes entre les tentatives</li>
              <li>• Contactez le support si le problème persiste</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onRetry}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <RefreshCw className="size-4" />
            Réessayer plus tard
          </button>

          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
