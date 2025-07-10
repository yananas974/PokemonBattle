import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation, useSearchParams } from '@remix-run/react';
import { authService } from '~/services/authService';
import { getUserFromSession, createUserSession } from '~/sessions';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import type { LoginRequest, AuthResponse } from '~/types/shared';
import { authValidators } from '~/types/shared';

export const meta: MetaFunction = () => {
  return [
    { title: 'Connexion - Pokemon Battle' },
    { name: 'description', content: 'Connectez-vous à votre compte Pokemon Battle' },
    { name: 'robots', content: 'noindex' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (user) {
    throw redirect('/dashboard');
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';
  
  return json({ redirectTo });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string || '/dashboard';

  // ✅ Validation avec les schémas partagés
  const loginData: LoginRequest = { email, password };
  
  try {
    const validatedData = authValidators.login.parse(loginData);
    
    // ✅ Authentification
    const authResponse: AuthResponse = await authService.login(validatedData);
    
    if (!authResponse.success || !authResponse.user) {
      return json({
        errors: { general: authResponse.error || 'Identifiants invalides' },
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

  } catch (error: any) {
    // ✅ Gestion d'erreurs de validation
    if (error.errors) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        if (err.path && err.path.length > 0) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      
      return json({
        errors: fieldErrors,
        success: false,
        email
      }, { status: 400 });
    }

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
  
  const isSubmitting = navigation.state === 'submitting';
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const defaultEmail = actionData?.email || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background effects */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl">
              <span className="text-3xl">⚡</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            Pokemon Battle
          </h1>
          
          <h2 className="text-xl text-gray-300 mb-6">
            Connexion Dresseur
          </h2>
          
          <p className="text-sm text-gray-400">
            Pas encore de compte ?{' '}
            <Link
              to={`/register${redirectTo !== '/dashboard' ? `?redirectTo=${redirectTo}` : ''}`}
              className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold"
            >
              S'inscrire ici
            </Link>
          </p>
        </div>

        {/* Main Card */}
        <ModernCard variant="glass" size="lg" className="shadow-2xl">
          <Form method="post" className="space-y-6" replace>
            <input type="hidden" name="redirectTo" value={redirectTo} />
            
            {/* Error message */}
            {actionData?.errors?.general && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-xl backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">⚠️</span>
                  <p className="text-sm font-medium">
                    {actionData.errors.general}
                  </p>
                </div>
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  📧 Adresse Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={defaultEmail}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent backdrop-blur-sm transition-all"
                  placeholder="dresseur@pokemon.com"
                />
                {actionData?.errors?.email && (
                  <p className="mt-2 text-red-400 text-sm">
                    {actionData.errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  🔑 Mot de Passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent backdrop-blur-sm transition-all"
                  placeholder="Mot de passe secret"
                />
                {actionData?.errors?.password && (
                  <p className="mt-2 text-red-400 text-sm">
                    {actionData.errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="space-y-4">
              <ModernButton
                type="submit"
                variant="pokemon"
                size="lg"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Connexion...' : 'Se Connecter'}
              </ModernButton>
            </div>
          </Form>
        </ModernCard>

        {/* Footer */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-6 text-gray-400 text-sm">
            <span className="flex items-center">
              <span className="mr-1">🎯</span>
              Battle
            </span>
            <span className="flex items-center">
              <span className="mr-1">⚡</span>
              Power
            </span>
            <span className="flex items-center">
              <span className="mr-1">🏆</span>
              Victory
            </span>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            © 2024 Pokemon Battle - Tous droits réservés
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <ModernCard variant="glass" size="lg" className="max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">💥</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Erreur de Connexion
          </h2>
          <p className="text-gray-300 mb-6">
            Une erreur inattendue s'est produite
          </p>
          <ModernButton href="/login" variant="pokemon">
            Réessayer
          </ModernButton>
        </div>
      </ModernCard>
    </div>
  );
} 