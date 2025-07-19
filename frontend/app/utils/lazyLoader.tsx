import { lazy, Suspense, ComponentType, ReactNode, useState, useEffect, Component, ErrorInfo } from 'react';

// ✅ Hook pour détecter l'hydratation terminée
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  return isHydrated;
}

// ✅ HOC pour le lazy loading avec loading state personnalisé et compatibilité SSR
export function withLazyLoading<T extends Record<string, any>>(
  importFunction: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFunction);
  
  return function LazyWrapper(props: T) {
    const isHydrated = useIsHydrated();

    // ✅ Côté serveur ou avant hydratation, afficher le fallback
    if (!isHydrated) {
      return <>{fallback || <LazyLoadingSpinner />}</>;
    }

    // ✅ Côté client après hydratation, utiliser Suspense avec le composant lazy
    return (
      <LazyErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback || <LazyLoadingSpinner />}>
          <LazyComponent {...(props as any)} />
        </Suspense>
      </LazyErrorBoundary>
    );
  };
}

// ✅ Spinner de chargement optimisé
function LazyLoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}

// ✅ Skeleton pour les composants lourds
export function ComponentSkeleton({ 
  className = "", 
  lines = 3,
  showAvatar = false 
}: { 
  className?: string;
  lines?: number;
  showAvatar?: boolean;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div 
              key={index}
              className={`h-4 bg-gray-300 rounded ${
                index === lines - 1 ? 'w-3/4' : 'w-full'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ✅ Skeleton spécialisé pour les cartes Pokemon
export function PokemonCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-md p-4">
      <div className="w-full h-32 bg-gray-300 rounded mb-4"></div>
      <div className="h-4 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
    </div>
  );
}

// ✅ Skeleton pour les listes
export function ListSkeleton({ 
  items = 5,
  showAvatar = true 
}: { 
  items?: number;
  showAvatar?: boolean;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <ComponentSkeleton 
          key={index}
          showAvatar={showAvatar}
          lines={2}
          className="p-4 border rounded-lg"
        />
      ))}
    </div>
  );
}

// ✅ Hook pour le preloading intelligent
export function usePreloadComponent(
  importFunction: () => Promise<any>,
  shouldPreload: boolean = false
) {
  if (shouldPreload && typeof window !== 'undefined') {
    // Preloader en arrière-plan après l'idle
    requestIdleCallback(() => {
      importFunction().catch(() => {
        // Ignore les erreurs de preload
      });
    }, { timeout: 5000 });
  }
}

// ✅ Utilitaire pour le code splitting par route avec SSR-safety
export function createLazyRoute(
  importFunction: () => Promise<any>,
  fallback?: ReactNode
) {
  // ✅ Wrapper pour gérer les imports avec ou sans default export
  const wrappedImport = async () => {
    const module = await importFunction();
    // Si le module a déjà un export par défaut, l'utiliser
    if (module.default) {
      return module;
    }
    // Sinon, chercher le premier export named qui correspond à un composant
    const componentName = Object.keys(module).find(key => 
      typeof module[key] === 'function' && 
      key.charAt(0) === key.charAt(0).toUpperCase()
    );
    if (componentName) {
      return { default: module[componentName] };
    }
    // Fallback: utiliser le premier export
    const firstExport = Object.values(module)[0];
    return { default: firstExport };
  };
  
  return withLazyLoading(wrappedImport, fallback);
}

// ✅ Version alternative pour les composants critiques (pas de lazy loading)
export function createEagerRoute<T extends Record<string, any>>(
  Component: ComponentType<T>
) {
  return function EagerWrapper(props: T) {
    return <Component {...(props as any)} />;
  };
}

// ✅ Error Boundary pour les composants lazy
class LazyErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erreur de lazy loading:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Erreur de chargement du composant</p>
        </div>
      );
    }

    return this.props.children;
  }
}