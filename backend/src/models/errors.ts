export abstract class BaseError extends Error {
  abstract statusCode: 400 | 401 | 403 | 404 | 409 | 500 | 502;
  abstract code: string;
  
  constructor(
    message: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends BaseError {
  statusCode = 400 as const;
  code = 'VALIDATION_ERROR';
}

export class UnauthorizedError extends BaseError {
  statusCode = 401 as const;
  code = 'UNAUTHORIZED';
}

export class ForbiddenError extends BaseError {
  statusCode = 403 as const;
  code = 'FORBIDDEN';
}

export class NotFoundError extends BaseError {
  statusCode = 404 as const;
  code = 'NOT_FOUND';
  
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`);
  }
}

export class ConflictError extends BaseError {
  statusCode = 409 as const;
  code = 'CONFLICT';
}

export class DatabaseError extends BaseError {
  statusCode = 500 as const;
  code = 'DATABASE_ERROR';
}

export class ExternalServiceError extends BaseError {
  statusCode = 502 as const;
  code = 'EXTERNAL_SERVICE_ERROR';
} 