'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Bug, X, Copy } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorHistory: Array<{
    id: string;
    timestamp: string;
    error: Error;
    errorInfo: ErrorInfo;
    componentStack: string;
  }>;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorHistory: []
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const errorEntry = {
      id: errorId,
      timestamp: new Date().toISOString(),
      error,
      errorInfo,
      componentStack: errorInfo.componentStack || 'Unknown component'
    };

    this.setState(prevState => ({
      errorInfo,
      errorHistory: [errorEntry, ...prevState.errorHistory].slice(0, 10) // Garder seulement les 10 dernières erreurs
    }));

    // Sauvegarder dans localStorage
    try {
      const existingErrors = JSON.parse(localStorage.getItem('error_history') || '[]');
      const updatedErrors = [errorEntry, ...existingErrors].slice(0, 20);
      localStorage.setItem('error_history', JSON.stringify(updatedErrors));
    } catch (e) {
      console.warn('Impossible de sauvegarder l\'erreur:', e);
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleClearHistory = () => {
    this.setState({ errorHistory: [] });
    localStorage.removeItem('error_history');
  };

  copyErrorDetails = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    alert('Détails de l\'erreur copiés dans le presse-papiers !');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border border-red-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Une erreur s'est produite
                  </h2>
                  <p className="text-gray-600">
                    L'application a rencontré une erreur inattendue
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-red-900 mb-2">Détails de l'erreur :</h3>
                <pre className="text-sm text-red-800 whitespace-pre-wrap overflow-x-auto">
                  {this.state.error?.message}
                </pre>
                {this.state.error?.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-red-700">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap overflow-x-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Bug className="w-4 h-4" />
                  Réessayer
                </button>
                <button
                  onClick={this.copyErrorDetails}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copier les détails
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;