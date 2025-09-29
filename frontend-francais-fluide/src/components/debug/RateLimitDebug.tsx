'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';

interface RateLimitStatus {
  isLimited: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export default function RateLimitDebug() {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    endpoint: string;
    status: number;
    timestamp: string;
    success: boolean;
    responseTime?: number;
    error?: string;
  }>>([]);
  const isMounted = useIsMounted();

  useEffect(() => {
    // Afficher le debug en mode développement et côté client
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  const testEndpoints = async () => {
    const endpoints = [
      '/api/progress',
      '/api/auth/me',
      '/api/exercises'
    ];

    const results: Array<{
      endpoint: string;
      status: number;
      timestamp: string;
      success: boolean;
      responseTime?: number;
      error?: string;
    }> = [];
    
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        const endTime = Date.now();
        
        results.push({
          endpoint,
          status: response.status,
          timestamp: new Date().toLocaleString('fr-FR'),
          success: response.ok,
          responseTime: endTime - startTime
        });

        // Vérifier les headers de rate limiting
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const resetTime = response.headers.get('X-RateLimit-Reset');
        const retryAfter = response.headers.get('Retry-After');

        if (remaining || resetTime || retryAfter) {
          setStatus({
            isLimited: response.status === 429,
            remaining: remaining ? parseInt(remaining) : 0,
            resetTime: resetTime ? parseInt(resetTime) * 1000 : 0,
            retryAfter: retryAfter ? parseInt(retryAfter) : undefined
          });
        }
      } catch (error) {
        results.push({
          endpoint,
          status: 0,
          timestamp: new Date().toLocaleString('fr-FR'),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setTestResults(results);
  };

  const clearCache = () => {
    localStorage.removeItem('user_stats_cache');
    localStorage.removeItem('generated_exercises_today_v1');
    alert('Cache vidé !');
  };

  if (!isMounted || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Debug Rate Limiting</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Status du rate limiting */}
      {status && (
        <div className="mb-3 p-2 bg-gray-50 rounded">
          <div className="flex items-center gap-2 mb-1">
            {status.isLimited ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm font-medium">
              {status.isLimited ? 'Rate Limited' : 'OK'}
            </span>
          </div>
          {status.remaining !== undefined && (
            <p className="text-xs text-gray-600">
              Requêtes restantes: {status.remaining}
            </p>
          )}
          {status.retryAfter && (
            <p className="text-xs text-red-600">
              Réessayer dans: {status.retryAfter}s
            </p>
          )}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="space-y-2">
        <button
          onClick={testEndpoints}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Tester les endpoints
        </button>
        
        <button
          onClick={clearCache}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
        >
          <AlertTriangle className="w-4 h-4" />
          Vider le cache
        </button>
      </div>

      {/* Résultats des tests */}
      {testResults.length > 0 && (
        <div className="mt-3 space-y-1">
          <h4 className="text-xs font-medium text-gray-700">Derniers tests:</h4>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`text-xs p-2 rounded ${
                result.success
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              <div className="flex justify-between">
                <span className="font-mono">{result.endpoint}</span>
                <span className="font-bold">
                  {result.status === 0 ? 'ERR' : result.status}
                </span>
              </div>
              <div className="text-xs opacity-75">
                {result.timestamp}
                {result.responseTime && ` (${result.responseTime}ms)`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
