import { useReducer, useCallback } from 'react';

// Types génériques pour les actions
export type CollectionAction<T> = 
  | { type: 'SET_ITEMS'; payload: T[] }
  | { type: 'ADD_ITEM'; payload: T }
  | { type: 'REMOVE_ITEM'; payload: { id: number | string } }
  | { type: 'UPDATE_ITEM'; payload: { id: number | string; updates: Partial<T> } }
  | { type: 'CLEAR_ITEMS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// État générique
export interface CollectionState<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  hasChanges: boolean;
}

// Reducer générique
function collectionReducer<T extends { id: number | string }>(
  state: CollectionState<T>,
  action: CollectionAction<T>
): CollectionState<T> {
  switch (action.type) {
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
        hasChanges: false,
        error: null
      };

    case 'ADD_ITEM':
      // Éviter les doublons
      const exists = state.items.some(item => item.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          error: 'Élément déjà présent dans la collection'
        };
      }
      
      return {
        ...state,
        items: [...state.items, action.payload],
        hasChanges: true,
        error: null
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
        hasChanges: true,
        error: null
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
        hasChanges: true,
        error: null
      };

    case 'CLEAR_ITEMS':
      return {
        ...state,
        items: [],
        hasChanges: true,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'RESET_STATE':
      return {
        items: [],
        isLoading: false,
        error: null,
        hasChanges: false
      };

    default:
      return state;
  }
}

// Options pour le hook
export interface UseCollectionOptions<T> {
  initialItems?: T[];
  maxItems?: number;
  onAdd?: (item: T) => Promise<void> | void;
  onRemove?: (id: number | string) => Promise<void> | void;
  onUpdate?: (id: number | string, updates: Partial<T>) => Promise<void> | void;
  onError?: (error: string) => void;
}

// Hook principal
export function useCollection<T extends { id: number | string }>(
  options: UseCollectionOptions<T> = {}
) {
  const {
    initialItems = [],
    maxItems,
    onAdd,
    onRemove,
    onUpdate,
    onError
  } = options;

  const initialState: CollectionState<T> = {
    items: initialItems,
    isLoading: false,
    error: null,
    hasChanges: false
  };

  const [state, dispatch] = useReducer(collectionReducer<T>, initialState);

  // Actions avec callbacks
  const addItem = useCallback(async (item: T) => {
    try {
      // Vérifier la limite
      if (maxItems && state.items.length >= maxItems) {
        const error = `Limite atteinte: maximum ${maxItems} éléments`;
        dispatch({ type: 'SET_ERROR', payload: error });
        onError?.(error);
        return false;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Callback externe
      if (onAdd) {
        await onAdd(item);
      }
      
      dispatch({ type: 'ADD_ITEM', payload: item });
      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'ajout';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
      return false;
    }
  }, [state.items.length, maxItems, onAdd, onError]);

  const removeItem = useCallback(async (id: number | string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Callback externe
      if (onRemove) {
        await onRemove(id);
      }
      
      dispatch({ type: 'REMOVE_ITEM', payload: { id } });
      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
      return false;
    }
  }, [onRemove, onError]);

  const updateItem = useCallback(async (id: number | string, updates: Partial<T>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Callback externe
      if (onUpdate) {
        await onUpdate(id, updates);
      }
      
      dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
      return false;
    }
  }, [onUpdate, onError]);

  // Actions simples
  const setItems = useCallback((items: T[]) => {
    dispatch({ type: 'SET_ITEMS', payload: items });
  }, []);

  const clearItems = useCallback(() => {
    dispatch({ type: 'CLEAR_ITEMS' });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Utilitaires
  const hasItem = useCallback((id: number | string) => {
    return state.items.some(item => item.id === id);
  }, [state.items]);

  const getItem = useCallback((id: number | string) => {
    return state.items.find(item => item.id === id);
  }, [state.items]);

  const canAddMore = useCallback(() => {
    return !maxItems || state.items.length < maxItems;
  }, [state.items.length, maxItems]);

  return {
    // État
    items: state.items,
    isLoading: state.isLoading,
    error: state.error,
    hasChanges: state.hasChanges,
    count: state.items.length,
    
    // Actions
    addItem,
    removeItem,
    updateItem,
    setItems,
    clearItems,
    setError,
    resetState,
    
    // Utilitaires
    hasItem,
    getItem,
    canAddMore,
    
    // Infos
    maxItems,
    remainingSlots: maxItems ? maxItems - state.items.length : Infinity
  };
}

// Hook spécialisé pour les équipes Pokémon
export function useTeamPokemon(initialPokemon: any[] = [], maxPokemon: number = 6) {
  return useCollection({
    initialItems: initialPokemon,
    maxItems: maxPokemon,
    onError: (error) => {
      console.error('Erreur équipe Pokémon:', error);
    }
  });
} 