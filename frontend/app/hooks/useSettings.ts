import { useReducer, useCallback } from 'react';

// Types pour les paramètres
export interface AppSettings {
  notifications: {
    battles: boolean;
    teams: boolean;
    friends: boolean;
    achievements: boolean;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muteAll: boolean;
  };
  display: {
    theme: 'modern' | 'vintage';
    language: 'fr' | 'en';
    animations: boolean;
    reducedMotion: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showOnline: boolean;
    allowFriendRequests: boolean;
  };
}

// Types pour les actions
export type SettingsAction = 
  | { type: 'UPDATE_SETTING'; payload: { category: keyof AppSettings; key: string; value: any } }
  | { type: 'UPDATE_CATEGORY'; payload: { category: keyof AppSettings; values: Partial<AppSettings[keyof AppSettings]> } }
  | { type: 'RESET_SETTINGS' }
  | { type: 'LOAD_SETTINGS'; payload: AppSettings }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// État des paramètres
export interface SettingsState {
  settings: AppSettings;
  isSaving: boolean;
  hasChanges: boolean;
  error: string | null;
}

// Paramètres par défaut
const defaultSettings: AppSettings = {
  notifications: {
    battles: true,
    teams: true,
    friends: false,
    achievements: true
  },
  audio: {
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 90,
    muteAll: false
  },
  display: {
    theme: 'modern',
    language: 'fr',
    animations: true,
    reducedMotion: false
  },
  privacy: {
    profilePublic: true,
    showOnline: true,
    allowFriendRequests: true
  }
};

// Reducer pour les paramètres
function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'UPDATE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.category]: {
            ...state.settings[action.payload.category],
            [action.payload.key]: action.payload.value
          }
        },
        hasChanges: true,
        error: null
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.category]: {
            ...state.settings[action.payload.category],
            ...action.payload.values
          }
        },
        hasChanges: true,
        error: null
      };

    case 'LOAD_SETTINGS':
      return {
        ...state,
        settings: action.payload,
        hasChanges: false,
        error: null
      };

    case 'RESET_SETTINGS':
      return {
        ...state,
        settings: defaultSettings,
        hasChanges: true,
        error: null
      };

    case 'SET_SAVING':
      return {
        ...state,
        isSaving: action.payload,
        ...(action.payload ? {} : { hasChanges: false })
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isSaving: false
      };

    default:
      return state;
  }
}

// Options pour le hook
export interface UseSettingsOptions {
  initialSettings?: Partial<AppSettings>;
  onSave?: (settings: AppSettings) => Promise<void>;
  onError?: (error: string) => void;
}

// Hook principal
export function useSettings(options: UseSettingsOptions = {}) {
  const {
    initialSettings,
    onSave,
    onError
  } = options;

  const initialState: SettingsState = {
    settings: { ...defaultSettings, ...initialSettings },
    isSaving: false,
    hasChanges: false,
    error: null
  };

  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Actions
  const updateSetting = useCallback((category: keyof AppSettings, key: string, value: any) => {
    dispatch({ type: 'UPDATE_SETTING', payload: { category, key, value } });
  }, []);

  const updateCategory = useCallback((category: keyof AppSettings, values: Partial<AppSettings[keyof AppSettings]>) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: { category, values } });
  }, []);

  const resetSettings = useCallback(() => {
    dispatch({ type: 'RESET_SETTINGS' });
  }, []);

  const loadSettings = useCallback((settings: AppSettings) => {
    dispatch({ type: 'LOAD_SETTINGS', payload: settings });
  }, []);

  const saveSettings = useCallback(async () => {
    if (!state.hasChanges) return;

    dispatch({ type: 'SET_SAVING', payload: true });

    try {
      if (onSave) {
        await onSave(state.settings);
      }
      dispatch({ type: 'SET_SAVING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    }
  }, [state.hasChanges, state.settings, onSave, onError]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Utilitaires
  const getSetting = useCallback((category: keyof AppSettings, key: string) => {
    return (state.settings[category] as any)[key];
  }, [state.settings]);

  const getCategory = useCallback((category: keyof AppSettings) => {
    return state.settings[category];
  }, [state.settings]);

  return {
    // État
    settings: state.settings,
    isSaving: state.isSaving,
    hasChanges: state.hasChanges,
    error: state.error,
    
    // Actions
    updateSetting,
    updateCategory,
    resetSettings,
    loadSettings,
    saveSettings,
    clearError,
    
    // Utilitaires
    getSetting,
    getCategory
  };
} 