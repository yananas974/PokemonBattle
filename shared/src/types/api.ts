// ✅ INTERFACES DE RÉPONSE API STANDARDISÉES
export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
}

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
  (c: any): Promise<Response>;
}

export interface AuthenticatedHandler {
  (c: ApiAuthenticatedContext, userId: number): Promise<Response>;
} 