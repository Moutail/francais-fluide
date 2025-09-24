// src/components/diagnostics/ServerDiagnosticPanel.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { ServerDiagnostics, DiagnosticResult } from '@/lib/diagnostics';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Server, 
  Database, 
  Key,
  Activity
} from 'lucide-react';

interface ServerDiagnosticPanelProps {
  className?: string;
}

export function ServerDiagnosticPanel({ className }: ServerDiagnosticPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const diagnostics = new ServerDiagnostics();
      const diagnosticResults = await diagnostics.runFullDiagnostic();
      setResults(diagnosticResults);
      setLastRun(new Date());
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTestIcon = (test: string) => {
    if (test.includes('Connectivité')) return <Server className="w-4 h-4" />;
    if (test.includes('Authentification')) return <Key className="w-4 h-4" />;
    if (test.includes('Progression')) return <Activity className="w-4 h-4" />;
    if (test.includes('Base de données')) return <Database className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Diagnostic Serveur
          </CardTitle>
          <Button
            onClick={runDiagnostic}
            disabled={isRunning}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Diagnostic...' : 'Lancer'}
          </Button>
        </div>
        {lastRun && (
          <p className="text-sm text-gray-600">
            Dernier diagnostic: {lastRun.toLocaleTimeString('fr-FR')}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8">
            <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Cliquez sur "Lancer" pour diagnostiquer la connexion au serveur
            </p>
            <Button onClick={runDiagnostic} disabled={isRunning}>
              Commencer le diagnostic
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTestIcon(result.test)}
                      <h4 className="font-medium text-gray-900">{result.test}</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                    {result.details && (
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-800">
                          Détails techniques
                        </summary>
                        <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {results.filter(r => r.status === 'success').length} / {results.length} tests réussis
                </span>
                <Button
                  onClick={runDiagnostic}
                  disabled={isRunning}
                  variant="ghost"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                  Relancer
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
