import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// ✅ TYPES POUR LA GESTION D'ERREURS
interface AppError {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
  details?: any;
  stack?: string;
  persistent?: boolean;
}

interface ErrorState {
  errors: AppError[];
  hasGlobalError: boolean;
  isLoading: boolean;
}

type ErrorAction =
  | { type: 'ADD_ERROR'; payload: AppError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'SET_GLOBAL_ERROR'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean };

interface ErrorContextType extends ErrorState {
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  addSuccess: (message: string, title?: string) => void;
  addWarning: (message: string, title?: string) => void;
  addInfo: (message: string, title?: string) => void;
  removeError: (id: string) => void;
  clearAllErrors: () => void;
  setGlobalError: (hasError: boolean) => void;
  setLoading: (loading: boolean) => void;
  handleAsyncError: <T>(promise: Promise<T>, fallbackMessage?: string) => Promise<T | null>;
}

// ✅ REDUCER POUR LA GESTION D'ÉTAT
function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.payload]
      };

    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload)
      };

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: []
      };

    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        hasGlobalError: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
}

// ✅ CONTEXTE D'ERREUR
const ErrorContext = createContext<ErrorContextType | null>(null);

// ✅ PROVIDER D'ERREUR
export function ErrorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(errorReducer, {
    errors: [],
    hasGlobalError: false,
    isLoading: false
  });

  // ✅ ACTIONS
  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    const id = crypto.randomUUID(); // Utilisation de `crypto.randomUUID()`
    dispatch({ type: 'ADD_ERROR', payload: { ...error, id, timestamp: Date.now() } });
    
    if (!error.persistent) {
      const timeout = error.type === 'success' ? 3000 : 5000;
      setTimeout(() => {
        dispatch({ type: 'REMOVE_ERROR', payload: id }); // On utilise ici l'ID généré dynamiquement
      }, timeout);
    }
  }, []);

  const addSuccess = useCallback((message: string, title = 'Succès') => {
    addError({
      type: 'success',
      title,
      message,
      persistent: false
    });
  }, [addError]);

  const addWarning = useCallback((message: string, title = 'Attention') => {
    addError({
      type: 'warning',
      title,
      message,
      persistent: false
    });
  }, [addError]);

  const addInfo = useCallback((message: string, title = 'Information') => {
    addError({
      type: 'info',
      title,
      message,
      persistent: false
    });
  }, [addError]);

  const removeError = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: id });
  }, []);

  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  const setGlobalError = useCallback((hasError: boolean) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: hasError });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  // ✅ GESTION ASYNC AVEC CAPTURE D'ERREUR
  const handleAsyncError = useCallback(
    async <T,>(promise: Promise<T>, fallbackMessage = 'Une erreur inattendue est survenue'): Promise<T | null> => {
      try {
        setLoading(true);
        const result = await promise;
        return result;
      } catch (error) {
        
        let errorMessage = fallbackMessage;
        let errorDetails = undefined;
        let errorStack = undefined;
        
        if (error instanceof Error) {
          errorMessage = error.message || fallbackMessage;
          errorStack = error.stack;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          errorDetails = error;
          errorMessage = (error as any).message || fallbackMessage;
        }

        addError({
          type: 'error',
          title: 'Erreur',
          message: errorMessage,
          details: errorDetails,
          stack: errorStack,
          persistent: false
        });

        return null;
      } finally {
        setLoading(false);
      }
    },
    [addError, setLoading]
  );

  const contextValue: ErrorContextType = {
    ...state,
    addError,
    addSuccess,
    addWarning,
    addInfo,
    removeError,
    clearAllErrors,
    setGlobalError,
    setLoading,
    handleAsyncError
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

// ✅ HOOK POUR UTILISER LE CONTEXTE D'ERREUR
export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError doit être utilisé dans un ErrorProvider');
  }
  return context;
}

// ✅ HELPER POUR LES ERREURS API
export function createAPIError(response: any, fallbackMessage = 'Erreur API'): Omit<AppError, 'id' | 'timestamp'> {
  return {
    type: 'error',
    title: 'Erreur API',
    message: response?.message || response?.error || fallbackMessage,
    details: response,
    persistent: false
  };
}

// ✅ TYPES EXPORT
export type { AppError, ErrorState };
