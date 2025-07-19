// ✅ INTERFACES DE RÉPONSE API STANDARDISÉES
export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

// ✅ TYPES D'ERREUR POUR RÉTROCOMPATIBILITÉ
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  timestamp?: string;
  path?: string;
  code?: string;
  details?: any;
}

export interface ValidationErrorResponse extends ErrorResponse {
  code?: string;
  fields?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
}

// ✅ NOTE: Types d'erreurs étendus disponibles dans types/errors.ts

// ✅ TYPES DE CONTEXTE POUR L'AUTHENTIFICATION
export interface ApiAuthenticatedContext {
  user: {
    id: number;
    email: string;
    username: string;
  };
}

// ✅ TYPES POUR LES HANDLERS
export interface HandlerFunction {
  (c: Record<string, any>): Promise<Response>;
}

export interface AuthenticatedHandler {
  (c: ApiAuthenticatedContext, userId: number): Promise<Response>;
} 