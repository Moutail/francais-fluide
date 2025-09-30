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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200"></div>
        <div className="absolute left-0 top-0 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
      <p className="animate-pulse text-sm text-gray-600">{message}</p>
    </div>
  </div>
);

// Fallback d'erreur
const ErrorFallback: React.FC<{ error?: Error; retry?: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="mb-4 text-red-500">
      <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="mb-2 text-lg font-medium text-gray-900">Erreur de chargement</h3>
    <p className="mb-4 text-sm text-gray-600">
      {error?.message || 'Impossible de charger ce composant'}
    </p>
    {retry && (
      <button
        onClick={retry}
        className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
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
  () =>
    import('@/components/editor/SmartEditorOptimized').then(m => ({
      default: m.SmartEditorOptimized,
    })),
  {
    preload: true,
    priority: 'high',
    cache: true,
    cacheKey: 'smart-editor',
  }
);

intelligentLazyLoader.registerComponent(
  'AnalyticsDashboard',
  () =>
    import('@/components/analytics/AnalyticsDashboard').then(m => ({
      default: m.AnalyticsDashboard,
    })),
  {
    preload: false,
    priority: 'medium',
    cache: true,
    cacheKey: 'analytics-dashboard',
  }
);

intelligentLazyLoader.registerComponent(
  'ExercisePlayer',
  () => import('@/components/exercises/ExercisePlayer'),
  {
    preload: false,
    priority: 'medium',
    cache: true,
    cacheKey: 'exercise-player',
  }
);

intelligentLazyLoader.registerComponent(
  'ProgressDashboard',
  () => import('@/components/gamification/ProgressDashboard'),
  {
    preload: true,
    priority: 'high',
    cache: true,
    cacheKey: 'progress-dashboard',
  }
);

intelligentLazyLoader.registerComponent(
  'CollaborativeEditor',
  () => import('@/components/editor/CollaborativeEditor'),
  {
    preload: false,
    priority: 'low',
    cache: true,
    cacheKey: 'collaborative-editor',
  }
);

// Composants lazy avec React.lazy pour compatibilité
export const LazySmartEditor = lazy(() =>
  import('@/components/editor/SmartEditorOptimized')
    .then(m => ({ default: m.SmartEditorOptimized }))
    .catch(() => ({
      default: () => <LoadingFallback message="Éditeur intelligent non disponible" />,
    }))
);

export const LazyAnalyticsDashboard = lazy(() =>
  import('@/components/analytics/AnalyticsDashboard')
    .then(m => ({ default: m.AnalyticsDashboard }))
    .catch(() => ({
      default: () => <LoadingFallback message="Tableau de bord non disponible" />,
    }))
);

export const LazyExercisePlayer = lazy(() =>
  import('@/components/exercises/ExercisePlayer').catch(() => ({
    default: () => <LoadingFallback message="Lecteur d'exercices non disponible" />,
  }))
);

export const LazyProgressDashboard = lazy(() =>
  import('@/components/gamification/ProgressDashboard').catch(() => ({
    default: () => <LoadingFallback message="Tableau de progression non disponible" />,
  }))
);

export const LazyCollaborativeEditor = lazy(() =>
  import('@/components/editor/CollaborativeEditor').catch(() => ({
    default: () => <LoadingFallback message="Éditeur collaboratif non disponible" />,
  }))
);

// Composants avec préchargement intelligent
export const LazyCharts = lazy(() =>
  import('@/components/charts/ProgressChart')
    .then(m => ({ default: m.default }))
    .catch(() => ({
      default: () => <LoadingFallback message="Graphiques non disponibles" />,
    }))
);

export const LazyGamificationComponents = lazy(() =>
  import('@/components/gamification/ProgressDashboard')
    .then(m => ({ default: m.default }))
    .catch(() => ({
      default: () => <LoadingFallback message="Composants de gamification non disponibles" />,
    }))
);

// Wrappers avec Suspense et ErrorBoundary
export const SmartEditorWithSuspense: React.FC<any> = props => (
  <LazyErrorBoundary>
    <Suspense fallback={<LoadingFallback message="Chargement de l'éditeur intelligent..." />}>
      <LazySmartEditor {...props} />
    </Suspense>
  </LazyErrorBoundary>
);

export const AnalyticsDashboardWithSuspense: React.FC<any> = props => (
  <LazyErrorBoundary>
    <Suspense fallback={<LoadingFallback message="Chargement du tableau de bord..." />}>
      <LazyAnalyticsDashboard {...props} />
    </Suspense>
  </LazyErrorBoundary>
);

export const ExercisePlayerWithSuspense: React.FC<any> = props => (
  <LazyErrorBoundary>
    <Suspense fallback={<LoadingFallback message="Chargement du lecteur d'exercices..." />}>
      <LazyExercisePlayer {...props} />
    </Suspense>
  </LazyErrorBoundary>
);

export const ProgressDashboardWithSuspense: React.FC<any> = props => (
  <LazyErrorBoundary>
    <Suspense fallback={<LoadingFallback message="Chargement de la progression..." />}>
      <LazyProgressDashboard {...props} />
    </Suspense>
  </LazyErrorBoundary>
);

export const CollaborativeEditorWithSuspense: React.FC<any> = props => (
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
      'ProgressDashboard',
    ]);
  }, []);

  return {
    preloadSmartEditor,
    preloadAnalytics,
    preloadExercises,
    preloadProgress,
    preloadAll,
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
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-black bg-opacity-75 p-3 font-mono text-xs text-white">
      <div className="mb-2 font-bold">Lazy Components</div>
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
  LazyGamificationComponents as GamificationComponents,
};
