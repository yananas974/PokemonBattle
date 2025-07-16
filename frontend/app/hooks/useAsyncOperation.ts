import { useState, useCallback } from 'react';
import { useError } from '~/contexts/ErrorContext';

// ✅ HOOK POUR GÉRER LES OPÉRATIONS ASYNCHRONES AVEC GESTION D'ERREUR

interface UseAsyncOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useAsyncOperation<T = any>(
  operation: (...args: any[]) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const { addError, addSuccess, handleAsyncError } = useError();

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation(...args);
      setData(result);
      
      if (options.successMessage) {
        addSuccess(options.successMessage);
      }
      
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      
      if (options.errorMessage) {
        addError({
          type: 'error',
          title: 'Erreur',
          message: options.errorMessage,
          details: error
        });
      } else {
        addError({
          type: 'error',
          title: 'Erreur',
          message: error.message,
          details: error
        });
      }
      
      options.onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [operation, options, addError, addSuccess]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    execute,
    loading,
    data,
    error,
    reset
  };
}

// ✅ HOOK SPÉCIALISÉ POUR LES FORMULAIRES
export function useFormSubmission<T = any>(
  submitFunction: (data: any) => Promise<T>,
  options: UseAsyncOperationOptions & {
    onSubmitSuccess?: (data: T) => void;
    resetOnSuccess?: boolean;
  } = {}
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  
  const { addError, addSuccess } = useError();

  const handleSubmit = useCallback(async (formData: any): Promise<boolean> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitFunction(formData);
      
      if (options.successMessage) {
        addSuccess(options.successMessage);
      }
      
      options.onSubmitSuccess?.(result);
      options.onSuccess?.(result);
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur de soumission');
      setSubmitError(error);
      
      addError({
        type: 'error',
        title: 'Erreur de formulaire',
        message: options.errorMessage || error.message,
        details: error
      });
      
      options.onError?.(error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFunction, options, addError, addSuccess]);

  return {
    handleSubmit,
    isSubmitting,
    submitError,
    resetError: () => setSubmitError(null)
  };
}

// ✅ HOOK POUR LES REQUÊTES AVEC RETRY
export function useRetryableOperation<T = any>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
) {
  const [retryCount, setRetryCount] = useState(0);
  const { addWarning } = useError();
  
  const { execute, loading, data, error } = useAsyncOperation(
    async () => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await operation();
          if (attempt > 0) {
            addWarning(`Opération réussie après ${attempt} tentative(s)`);
          }
          setRetryCount(0);
          return result;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Erreur de retry');
          setRetryCount(attempt + 1);
          
          if (attempt < maxRetries) {
            addWarning(`Tentative ${attempt + 1} échouée, retry dans ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
      
      throw lastError;
    }
  );

  return {
    execute,
    loading,
    data,
    error,
    retryCount,
    hasRetries: retryCount > 0
  };
}