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
        useLanguageTool: true
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
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Test de Communication Backend
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status du Backend</h2>
          
          {loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Test de connexion...
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800 font-medium">❌ Erreur de connexion</div>
              <div className="text-red-600 text-sm mt-1">{error}</div>
            </div>
          )}
          
          {backendStatus && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-green-800 font-medium">✅ Backend connecté</div>
              <div className="text-green-600 text-sm mt-2">
                <div>Status: {backendStatus.status}</div>
                <div>Version: {backendStatus.version}</div>
                <div>Environment: {backendStatus.environment}</div>
                <div>Uptime: {Math.round(backendStatus.uptime)}s</div>
              </div>
            </div>
          )}
          
          <button
            onClick={testBackendConnection}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            🔄 Tester la connexion
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test API Grammaire</h2>
          <p className="text-gray-600 mb-4">
            Testez l'analyse grammaticale via l'API backend.
          </p>
          
          <button
            onClick={testGrammarApi}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '⏳ Test en cours...' : '📝 Tester l\'API Grammaire'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Frontend URL: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</div>
            <div>Backend URL: {process.env.NEXT_PUBLIC_API_URL || 'Non configuré'}</div>
            <div>App Name: {process.env.NEXT_PUBLIC_APP_NAME || 'Non configuré'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
