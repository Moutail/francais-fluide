// src/components/performance/LazyComponents.tsx

/**
 * Composants avec chargement différé et code splitting optimisé
 * Améliore les performances en chargeant les composants seulement quand nécessaire
 */

import React, { Suspense, lazy, ComponentType } from 'react';
import { intelligentLazyLoader } from '@/lib/performance/lazy-loader';

// Fallback de chargement optimisé
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Chargement...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="text-sm text-gray-600 animate-pulse">{message}</p>
    </div>
  </div>
);

// Fallback d'erreur
const ErrorFallback: React.FC<{ error?: Error; retry?: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-500 mb-4">
      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
    <p className="text-sm text-gray-600 mb-4">
      {error?.message || 'Impossible de charger ce composant'}
    </p>
    {retry && (
      <button
        onClick={retry}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Réessayer
      </button>
    )}
  </div>
);

// Boundary d'erreur pour les composants lazy
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || ErrorFallback;
      return <Fallback error={this.state.error} retry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

// Enregistrement des composants avec configuration optimisée
intelligentLazyLoader.registerComponent(
  'SmartEditor',
  () => import('@/components/editor/SmartEditorOptimized'),
  {
    preload: true,
    priority: 'high',
    cache: true,
    cacheKey: 'smart-editor'
  }
);

intelligentLazyLoader.registerComponent(
  'AnalyticsDashboard',
  () => import('@/components/analytics/AnalyticsDashboard'),
  {
    preload: false,
    priority: 'medium',
    cache: true,
    cacheKey: 'analytics-dashboard'
  }
);

intelligentLazyLoader.registerComponent(
  'ExercisePlayer',
  () => import('@/components/exercises/ExercisePlayer'),
  {
    preload: false,
    priority: 'medium',
    cache: true,
    cacheKey: 'exercise-player'
  }
);

intelligentLazyLoader.registerComponent(
  'ProgressDashboard',
  () => import('@/components/gamification/ProgressDashboard'),
  {
    preload: true,
    priority: 'high',
    cache: true,
    cacheKey: 'progress-dashboard'
  }
);

intelligentLazyLoader.registerComponent(
  'CollaborativeEditor',
  () => import('@/components/editor/CollaborativeEditor'),
  {
    preload: false,
    priority: 'low',
    cache: true,
    cacheKey: 'collaborative-editor'
  }
);

// Composants lazy avec React.lazy pour compatibilité
export const LazySmartEditor = lazy(async () => {
  try {
    const mod = await import('@/components/editor/SmartEditorOptimized');
    return { default: mod.default };
  } catch {
    return { default: () => <ErrorFallback message="Éditeur intelligent non disponible" /> };
  }
});

export const LazyAnalyticsDashboard = lazy(async () => {
  try {
    const mod = await import('@/components/analytics/AnalyticsDashboard');
    return { default: mod.default };
  } catch {
    return { default: () => <ErrorFallback message="Tableau de bord non disponible" /> };
  }
});

export const LazyExercisePlayer = lazy(async () => {
  try {
    const mod = await import('@/components/exercises/ExercisePlayer');
    return { default: mod.default };
  } catch {
    return { default: () => <ErrorFallback message="Lecteur d'exercices non disponible" /> };
  }
});

export const LazyProgressDashboard = lazy(async () => {
  try {
    const mod = await import('@/components/gamification/ProgressDashboard');
    return { default: mod.default };
  } catch {
    return { default: () => <ErrorFallback message="Tableau de progression non disponible" /> };
  }
});

export const LazyCollaborativeEditor = lazy(async () => {
  try {
    const mod = await import('@/components/editor/CollaborativeEditor');
    return { default: mod.default };
  } catch {
    return { default: () => <ErrorFallback message="Éditeur collaboratif non disponible" /> };
  }
});

// Composants avec préchargement intelligent
export const LazyCharts = lazy(() =>
  import('@/components/charts').catch(() => ({
    default: () => <ErrorFallback message="Graphiques non disponibles" />
  }))
);

export const LazyGamificationComponents = lazy(() =>
  import('@/components/gamification').catch(() => ({
    default: () => <ErrorFallback message="Composants de gamification non disponibles" />
  }))
);

// Wrappers avec Suspense et ErrorBoundary
export const SmartEditorWithSuspense: React.FC<any> = (props) => (
  <LazyErrorBoundary>
    <Suspense fallback={<LoadingFallback message="Chargement de l'éditeur intelligent..." />}>
      <LazySmartEditor {...props} />
    </Suspense>
  </LazyErrorBoundary>
);

export const AnalyticsDashboardWithSuspense: React.FC<any> = (props) => (
  <LazyErrorBoundary>
    <Suspense fallback={<LoadingFallback message="Chargement du tableau de bord..." />}>
      <LazyAnalyticsDashboard {...props} />
    </Suspense>
  </LazyErrorBoundary>
);

export const ExercisePlayerWithSuspense: React.FC<any> = (props) => (
  <LazyErrorBoundary>
    <Suspense fallback={<LoadingFallback message="Chargement du lecteur d'exercices..." />}>
      <LazyExercisePlayer {...props} />
    </Suspense>
  </LazyErrorBoundary>
);

export const ProgressDashboardWithSuspense: React.FC<any> = (props) => (
  <LazyErrorBoundary>
    <Suspense fallback={<LoadingFallback message="Chargement de la progression..." />}>
      <LazyProgressDashboard {...props} />
    </Suspense>
  </LazyErrorBoundary>
);

export const CollaborativeEditorWithSuspense: React.FC<any> = (props) => (
  <LazyErrorBoundary>
    <Suspense fallback={<LoadingFallback message="Chargement de l'éditeur collaboratif..." />}>
      <LazyCollaborativeEditor {...props} />
    </Suspense>
  </LazyErrorBoundary>
);

// Hook pour précharger les composants
export const usePreloadComponents = () => {
  const preloadSmartEditor = React.useCallback(() => {
    intelligentLazyLoader.preloadComponent('SmartEditor');
  }, []);

  const preloadAnalytics = React.useCallback(() => {
    intelligentLazyLoader.preloadComponent('AnalyticsDashboard');
  }, []);

  const preloadExercises = React.useCallback(() => {
    intelligentLazyLoader.preloadComponent('ExercisePlayer');
  }, []);

  const preloadProgress = React.useCallback(() => {
    intelligentLazyLoader.preloadComponent('ProgressDashboard');
  }, []);

  const preloadAll = React.useCallback(() => {
    intelligentLazyLoader.preloadComponents([
      'SmartEditor',
      'AnalyticsDashboard',
      'ExercisePlayer',
      'ProgressDashboard'
    ]);
  }, []);

  return {
    preloadSmartEditor,
    preloadAnalytics,
    preloadExercises,
    preloadProgress,
    preloadAll
  };
};

// Composant de préchargement intelligent
export const IntelligentPreloader: React.FC<{
  route: string;
  userBehavior?: string[];
}> = ({ route, userBehavior = [] }) => {
  React.useEffect(() => {
    // Précharger basé sur la route
    switch (route) {
      case '/':
        intelligentLazyLoader.preloadComponent('SmartEditor');
        break;
      case '/exercises':
        intelligentLazyLoader.preloadComponent('ExercisePlayer');
        break;
      case '/analytics':
        intelligentLazyLoader.preloadComponent('AnalyticsDashboard');
        break;
      case '/progress':
        intelligentLazyLoader.preloadComponent('ProgressDashboard');
        break;
    }

    // Précharger basé sur le comportement utilisateur
    if (userBehavior.includes('frequent-exercises')) {
      intelligentLazyLoader.preloadComponent('ExercisePlayer');
    }
    if (userBehavior.includes('analytics-interested')) {
      intelligentLazyLoader.preloadComponent('AnalyticsDashboard');
    }
  }, [route, userBehavior]);

  return null;
};

// Composant de monitoring des performances des lazy components
export const LazyComponentsMonitor: React.FC = () => {
  const [metrics, setMetrics] = React.useState(intelligentLazyLoader.getMetrics());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(intelligentLazyLoader.getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="font-bold mb-2">Lazy Components</div>
      <div>Total: {metrics.totalComponents}</div>
      <div>Loaded: {metrics.loadedComponents}</div>
      <div>Loading: {metrics.loadingComponents}</div>
      <div>Errors: {metrics.errorComponents}</div>
      <div>Avg Time: {metrics.averageLoadTime.toFixed(1)}ms</div>
    </div>
  );
};

// Export des composants principaux
export {
  LazySmartEditor as SmartEditor,
  LazyAnalyticsDashboard as AnalyticsDashboard,
  LazyExercisePlayer as ExercisePlayer,
  LazyProgressDashboard as ProgressDashboard,
  LazyCollaborativeEditor as CollaborativeEditor,
  LazyCharts as Charts,
  LazyGamificationComponents as GamificationComponents
};
