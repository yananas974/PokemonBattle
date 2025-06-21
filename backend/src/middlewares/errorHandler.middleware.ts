import type { ErrorHandler } from 'hono';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('❌ Erreur globale:', err);
  
  if (err.name === 'ValidationError') {
    return c.json({ error: 'Données invalides', details: err.message }, 400);
  }
  
  return c.json({ error: 'Erreur serveur interne' }, 500);
};

// Dans index.ts
app.onError(errorHandler); 