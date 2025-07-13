import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import StatusMessage from './StatusMessage';

export default function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <StatusMessage
        type="error"
        title={`Erreur ${error.status}`}
        message={error.statusText || 'Une erreur est survenue'}
      />
    );
  }

  return (
    <StatusMessage
      type="error"
      title="Erreur inattendue"
      message={error instanceof Error ? error.message : 'Erreur inconnue'}
    />
  );
}