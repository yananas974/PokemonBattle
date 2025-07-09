import type { ErrorContext } from '@pokemon-battle/shared';

export class ErrorLogger {
  static log(error: Error, context: ErrorContext) {
    const logData = {
      timestamp: new Date().toISOString(),
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      severity: this.getSeverity(error)
    };

    if (logData.severity === 'critical') {
      console.error('🚨 CRITICAL ERROR:', logData);
      // Ici vous pourriez envoyer à un service externe (Sentry, etc.)
    } else if (logData.severity === 'error') {
      console.error('❌ ERROR:', logData);
    } else {
      console.warn('⚠️ WARNING:', logData);
    }
  }

  private static getSeverity(error: Error): 'warning' | 'error' | 'critical' {
    if (error.name === 'DatabaseError') return 'critical';
    if (error.name === 'ExternalServiceError') return 'error';
    if (error.name.includes('Validation')) return 'warning';
    return 'error';
  }
} 