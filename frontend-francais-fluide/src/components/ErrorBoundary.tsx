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
      errorHistory: [],
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
      componentStack: errorInfo.componentStack || 'Unknown component',
    };

    this.setState(prevState => ({
      errorInfo,
      errorHistory: [errorEntry, ...prevState.errorHistory].slice(0, 10), // Garder seulement les 10 dernières erreurs
    }));

    // Sauvegarder dans localStorage
    try {
      const existingErrors = JSON.parse(localStorage.getItem('error_history') || '[]');
      const updatedErrors = [errorEntry, ...existingErrors].slice(0, 20);
      localStorage.setItem('error_history', JSON.stringify(updatedErrors));
    } catch (e) {
      console.warn("Impossible de sauvegarder l'erreur:", e);
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
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
      url: window.location.href,
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    alert("Détails de l'erreur copiés dans le presse-papiers !");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-red-200 bg-white shadow-lg">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2">
                  <AlertTriangle className="size-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Une erreur s'est produite</h2>
                  <p className="text-gray-600">L'application a rencontré une erreur inattendue</p>
                </div>
              </div>

              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <h3 className="mb-2 font-medium text-red-900">Détails de l'erreur :</h3>
                <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-red-800">
                  {this.state.error?.message}
                </pre>
                {this.state.error?.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-red-700">
                      Stack trace
                    </summary>
                    <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-xs text-red-600">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  <Bug className="size-4" />
                  Réessayer
                </button>
                <button
                  onClick={this.copyErrorDetails}
                  className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                >
                  <Copy className="size-4" />
                  Copier les détails
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
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
