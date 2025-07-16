import React, { memo } from 'react';
import { useError, type AppError } from '~/contexts/ErrorContext';

// ✅ COMPOSANT D'AFFICHAGE D'ERREUR INDIVIDUELLE
const ErrorItem = memo(({ error }: { error: AppError }) => {
  const { removeError } = useError();

  const getErrorStyles = () => {
    switch (error.type) {
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  const getIcon = () => {
    switch (error.type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '📝';
    }
  };

  return (
    <div className={`border px-4 py-3 rounded relative mb-3 ${getErrorStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getIcon()}</span>
          <div className="flex-1">
            <strong className="font-bold">{error.title}</strong>
            <p className="text-sm mt-1">{error.message}</p>
            {error.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs opacity-75 hover:opacity-100">
                  Détails techniques
                </summary>
                <pre className="text-xs mt-1 p-2 bg-black bg-opacity-10 rounded overflow-auto max-h-32">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
        
        {!error.persistent && (
          <button
            onClick={() => removeError(error.id)}
            className="ml-4 text-xl leading-none hover:opacity-75"
            title="Fermer"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
});

// ✅ COMPOSANT PRINCIPAL D'AFFICHAGE DES ERREURS
export const ErrorDisplay = memo(() => {
  const { errors, clearAllErrors } = useError();

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
      <div className="space-y-2">
        {errors.length > 1 && (
          <div className="flex justify-end">
            <button
              onClick={clearAllErrors}
              className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Tout effacer ({errors.length})
            </button>
          </div>
        )}
        
        {errors.map((error) => (
          <ErrorItem key={error.id} error={error} />
        ))}
      </div>
    </div>
  );
});

// ✅ COMPOSANT DE GESTION D'ERREUR GLOBALE
export const GlobalErrorBoundary = ({ 
  children,
  fallback
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const { hasGlobalError, setGlobalError, addError } = useError();

  if (hasGlobalError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Oups ! Quelque chose a mal tourné
          </h1>
          <p className="text-gray-600 mb-6">
            Une erreur inattendue s'est produite. Nous travaillons à la résoudre.
          </p>
          <button
            onClick={() => {
              setGlobalError(false);
              window.location.reload();
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// ✅ HOC POUR CAPTURER LES ERREURS DE COMPOSANTS
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  return React.forwardRef<any, P>((props, ref) => {
    const { addError } = useError();

    class ErrorBoundary extends React.Component<
      P & { children: React.ReactNode },
      { hasError: boolean; error: Error | null }
    > {
      constructor(props: P & { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Erreur capturée par ErrorBoundary:', error, errorInfo);
        
        addError({
          type: 'error',
          title: 'Erreur de composant',
          message: error.message,
          details: errorInfo,
          stack: error.stack,
          persistent: true
        });
      }

      resetError = () => {
        this.setState({ hasError: false, error: null });
      };

      render() {
        if (this.state.hasError && this.state.error) {
          if (errorFallback) {
            const FallbackComponent = errorFallback;
            return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
          }
          
          return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-bold text-red-600">Erreur de composant</h3>
              <p className="text-red-600 text-sm mt-1">{this.state.error.message}</p>
              <button
                onClick={this.resetError}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          );
        }

        return this.props.children;
      }
    }

    return (
      <ErrorBoundary>
        <Component {...props} ref={ref} />
      </ErrorBoundary>
    );
  });
}