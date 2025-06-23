import type { ErrorResponse } from '../../models/interfaces/error.interface.js';
import { BaseError } from '../../models/errors.js';

export class ErrorFormatter {
  static format(error: Error, path: string): ErrorResponse {
    const base: ErrorResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      path
    };

    if (error instanceof BaseError) {
      return {
        ...base,
        code: error.code,
        details: error.context
      };
    }

    // Erreurs Zod/Validation
    if (error.name === 'ZodError') {
      return {
        ...base,
        code: 'VALIDATION_ERROR',
        details: (error as any).errors
      };
    }

    // Erreur générique
    return {
      ...base,
      code: 'INTERNAL_ERROR'
    };
  }
} 