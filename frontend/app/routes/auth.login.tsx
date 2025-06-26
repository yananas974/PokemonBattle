import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation, useSearchParams } from '@remix-run/react';
import { authService } from '~/services/authService';
import { getUserFromSession, createUserSession } from '~/sessions';

export const meta: MetaFunction = () => {
  return [
    { title: 'Connexion - Pokemon Battle' },
    { name: 'description', content: 'Connectez-vous à votre compte Pokemon Battle' },
    { name: 'robots', content: 'noindex' }, // SEO: pas d'indexation
  ];
};

// ✅ Loader pour redirection si déjà connecté
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (user) {
    throw redirect('/dashboard');
  }

  // Récupérer le redirectTo depuis l'URL
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';
  
  return json({ redirectTo });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string || '/dashboard';

  // ✅ Validation côté serveur robuste
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = 'L\'email est requis';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Format d\'email invalide';
  }

  if (!password) {
    errors.password = 'Le mot de passe est requis';
  } else if (password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
  }

  if (Object.keys(errors).length > 0) {
    return json({ 
      errors, 
      success: false,
      email // ✅ Préserver l'email en cas d'erreur
    }, { status: 400 });
  }

  try {
    // ✅ Authentification
    const authResponse = await authService.login({ email, password });
    
    if (!authResponse.success || !authResponse.user) {
      return json({
        errors: { general: 'Identifiants invalides' },
        success: false,
        email
      }, { status: 401 });
    }

    // ✅ Créer session et rediriger
    return createUserSession(
      authResponse.user.id.toString(),
      authResponse.user,
      redirectTo
    );

  } catch (error) {
    console.error('Login error:', error);
    
    return json({
      errors: { 
        general: error instanceof Error 
          ? error.message 
          : 'Erreur de connexion. Veuillez réessayer.' 
      },
      success: false,
      email
    }, { status: 500 });
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  
  // ✅ États optimisés
  const isSubmitting = navigation.state === 'submitting';
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  
  // ✅ Préserver l'email en cas d'erreur
  const defaultEmail = actionData?.email || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ✅ Header amélioré */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">🎮</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Connexion
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link
              to={`/auth/signup${redirectTo !== '/dashboard' ? `?redirectTo=${redirectTo}` : ''}`}
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              créez un nouveau compte
            </Link>
          </p>
        </div>

        {/* ✅ Formulaire optimisé */}
        <Form method="post" className="mt-8 space-y-6" replace>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          
          {/* ✅ Message d'erreur général */}
          {actionData?.errors?.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
              <div className="flex">
                <span className="text-red-500 mr-2">⚠️</span>
                <p className="text-sm text-red-700">{actionData.errors.general}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* ✅ Champ Email optimisé */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={defaultEmail}
                aria-invalid={actionData?.errors?.email ? 'true' : undefined}
                aria-describedby={actionData?.errors?.email ? 'email-error' : undefined}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  actionData?.errors?.email
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="votre@email.com"
              />
              {actionData?.errors?.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                  {actionData.errors.email}
                </p>
              )}
            </div>

            {/* ✅ Champ Password optimisé */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={actionData?.errors?.password ? 'true' : undefined}
                aria-describedby={actionData?.errors?.password ? 'password-error' : undefined}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  actionData?.errors?.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="••••••••"
              />
              {actionData?.errors?.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {actionData.errors.password}
                </p>
              )}
            </div>
          </div>

          {/* ✅ Bouton submit optimisé */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

          {/* ✅ Liens additionnels */}
          <div className="flex items-center justify-between text-sm">
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              ← Retour à l'accueil
            </Link>
            <Link
              to="/auth/forgot-password"
              className="text-gray-600 hover:text-gray-500 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </Form>

        {/* ✅ Footer de sécurité */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 Connexion sécurisée SSL
          </p>
        </div>
      </div>
    </div>
  );
}

// ✅ Error Boundary spécifique
export function ErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de connexion</h1>
        <p className="text-gray-600 mb-4">Une erreur inattendue s'est produite.</p>
        <Link
          to="/auth/login"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Réessayer
        </Link>
      </div>
    </div>
  );
} 