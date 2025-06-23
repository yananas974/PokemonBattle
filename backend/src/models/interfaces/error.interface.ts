export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

export interface ErrorContext {
  path: string;
  method: string;
  userId?: number;
  ip?: string;
  userAgent?: string;
} 