import { StandardApiResponse, ErrorResponse, ValidationErrorResponse } from '../types/api';
import { ERROR_CODES, DEFAULT_ERROR_MESSAGES, ErrorCode } from '../constants/errors';

// ✅ FORMATTER POUR LES RÉPONSES DE SUCCÈS
export const formatResponse = <T>(
  message: string, 
  data?: T, 
  includeTimestamp: boolean = false
): StandardApiResponse<T> => {
  const response: StandardApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data })
  };
  
  if (includeTimestamp) {
    response.timestamp = new Date().toISOString();
  }
  
  return response;
};

// ✅ FORMATTER POUR LES RÉPONSES D'ERREUR
export const formatErrorResponse = (
  message: string, 
  code?: ErrorCode,
  details?: any,
  path?: string
): ErrorResponse => ({
  success: false,
  error: message,
  ...(code && { code }),
  ...(details && { details }),
  ...(path && { path }),
  timestamp: new Date().toISOString()
});

// ✅ FORMATTER POUR LES ERREURS DE VALIDATION
export const formatValidationErrorResponse = (
  message: string,
  validationErrors: Array<{ field: string; message: string }>,
  path?: string
): ValidationErrorResponse => ({
  success: false,
  error: message,
  code: ERROR_CODES.VALIDATION_ERROR,
  validationErrors,
  ...(path && { path }),
  timestamp: new Date().toISOString()
});

// ✅ FORMATTER POUR LES RÉPONSES PAGINÉES
export const formatPaginatedResponse = <T>(
  data: T[],
  message: string,
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
) => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  return formatResponse(message, {
    items: data,
    pagination: {
      ...pagination,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    }
  });
};

// ✅ HELPER POUR CRÉER UNE ERREUR STANDARD
export const createError = (
  code: ErrorCode,
  customMessage?: string,
  details?: any
): ErrorResponse => {
  const message = customMessage || DEFAULT_ERROR_MESSAGES[code] || 'Unknown error';
  return formatErrorResponse(message, code, details);
};

// ✅ HELPER POUR CRÉER UNE RÉPONSE DE SUCCÈS SIMPLE
export const createSuccessResponse = <T>(
  message: string,
  data?: T
): StandardApiResponse<T> => formatResponse(message, data);

// ✅ HELPER POUR CRÉER UNE RÉPONSE D'ERREUR DE VALIDATION
export const createValidationError = (
  fields: Array<{ field: string; message: string }>,
  customMessage?: string
): ValidationErrorResponse => {
  const message = customMessage || 'Validation failed';
  return formatValidationErrorResponse(message, fields);
};

// ✅ TYPES POUR LES FORMATTERS
export type SuccessResponseFormatter = typeof formatResponse;
export type ErrorResponseFormatter = typeof formatErrorResponse;
export type ValidationErrorFormatter = typeof formatValidationErrorResponse;
export type PaginatedResponseFormatter = typeof formatPaginatedResponse; 