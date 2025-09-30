'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function TestApiPage() {
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test de la connexion au backend
      const healthResponse = await apiClient.healthCheck();
      setBackendStatus(healthResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const testGrammarApi = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.analyzeText({
        text: "Bonjour, je suis un test de l'API grammaire.",
        useLanguageTool: true,
      });

      console.log('Réponse API Grammaire:', response);
      alert('Test API Grammaire réussi ! Vérifiez la console.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur API Grammaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">🧪 Test de Communication Backend</h1>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Status du Backend</h2>

          {loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
              Test de connexion...
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <div className="font-medium text-red-800">❌ Erreur de connexion</div>
              <div className="mt-1 text-sm text-red-600">{error}</div>
            </div>
          )}

          {backendStatus && (
            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <div className="font-medium text-green-800">✅ Backend connecté</div>
              <div className="mt-2 text-sm text-green-600">
                <div>Status: {backendStatus.status}</div>
                <div>Version: {backendStatus.version}</div>
                <div>Environment: {backendStatus.environment}</div>
                <div>Uptime: {Math.round(backendStatus.uptime)}s</div>
              </div>
            </div>
          )}

          <button
            onClick={testBackendConnection}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            🔄 Tester la connexion
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Test API Grammaire</h2>
          <p className="mb-4 text-gray-600">Testez l'analyse grammaticale via l'API backend.</p>

          <button
            onClick={testGrammarApi}
            disabled={loading}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '⏳ Test en cours...' : "📝 Tester l'API Grammaire"}
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Configuration</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <div>
              Frontend URL: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
            </div>
            <div>Backend URL: {process.env.NEXT_PUBLIC_API_URL || 'Non configuré'}</div>
            <div>App Name: {process.env.NEXT_PUBLIC_APP_NAME || 'Non configuré'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
