import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation, useSearchParams } from '@remix-run/react';
import { authService } from '~/services/authService';
import { getUserFromSession, createUserSession } from '~/sessions';
import { VintageCard } from '~/components/VintageCard';
import { VintageTitle } from '~/components/VintageTitle';
import { VintageInput } from '~/components/VintageInput';
import { VintageButton } from '~/components/VintageButton';

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

    // ✅ Stocker le token dans l'objet utilisateur
    const userWithToken = {
      ...authResponse.user,
      backendToken: authResponse.token
    };

    // ✅ Créer session et rediriger
    return createUserSession(
      authResponse.user.id.toString(),
      userWithToken,
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
  const redirectTo = searchParams.get('redirectTo') || '/dashboard/teams';
  
  // ✅ Préserver l'email en cas d'erreur
  const defaultEmail = actionData?.email || '';

  return (
    <div className="min-h-screen bg-pokemon-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Effet Game Boy - écran avec scanlines */}
      <div className="absolute inset-0 bg-pokemon-screen opacity-10 pointer-events-none" 
           style={{
             backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)'
           }} 
      />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* ✅ Header vintage style Game Boy */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            <div className="inline-block bg-pokemon-yellow border-4 border-pokemon-blue-dark rounded-full p-4 shadow-lg">
              <span className="text-2xl">🎮</span>
            </div>
          </div>
          
          <VintageTitle level={1} animated>
            Pokemon Battle
          </VintageTitle>
          
          <VintageTitle level={3} className="text-pokemon-blue">
            Connexion Dresseur
          </VintageTitle>
          
          <div className="mt-4 font-pokemon text-xs text-pokemon-blue-dark">
            Pas encore de compte ?{' '}
            <Link
              to={`/register${redirectTo !== '/dashboard/teams' ? `?redirectTo=${redirectTo}` : ''}`}
              className="text-pokemon-red hover:text-pokemon-yellow transition-colors font-bold"
            >
              S'INSCRIRE ICI
            </Link>
          </div>
        </div>

        {/* ✅ Carte principale vintage */}
        <VintageCard padding="lg" className="bg-pokemon-cream shadow-xl">
          <Form method="post" className="space-y-6" replace>
            <input type="hidden" name="redirectTo" value={redirectTo} />
            
            {/* ✅ Message d'erreur général style Game Boy */}
            {actionData?.errors?.general && (
              <div className="pokemon-card-vintage bg-pokemon-red border-pokemon-red text-white p-4 animate-pokemon-blink">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">⚠️</span>
                  <p className="font-pokemon text-xs uppercase">
                    {actionData.errors.general}
                  </p>
                </div>
              </div>
            )}

            {/* ✅ Inputs vintage */}
            <div className="space-y-6">
              <VintageInput
                id="email"
                name="email"
                type="email"
                label="Adresse Email"
                placeholder="DRESSEUR@POKEMON.COM"
                required
                autoComplete="email"
                defaultValue={defaultEmail}
                icon="📧"
              />
              
              {actionData?.errors?.email && (
                <div className="text-pokemon-red font-pokemon text-xs uppercase">
                  {actionData.errors.email}
                </div>
              )}

              <VintageInput
                id="password"
                name="password"
                type="password"
                label="Mot de Passe"
                placeholder="MOT DE PASSE SECRET"
                required
                autoComplete="current-password"
                icon="🔑"
              />
              
              {actionData?.errors?.password && (
                <div className="text-pokemon-red font-pokemon text-xs uppercase">
                  {actionData.errors.password}
                </div>
              )}
            </div>

            {/* ✅ Boutons vintage */}
            <div className="space-y-4">
              <VintageButton
                type="submit"
                variant="blue"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⚡</span>
                    CONNEXION...
                  </span>
                ) : (
                  'SE CONNECTER'
                )}
              </VintageButton>
              
              <div className="flex space-x-3">
                <VintageButton
                  href="/dashboard/pokemon"
                  variant="yellow"
                  size="md"
                  className="flex-1"
                >
                  POKEMON
                </VintageButton>
                
                <VintageButton
                  href="/dashboard/teams"
                  variant="green"
                  size="md"
                  className="flex-1"
                >
                  EQUIPES
                </VintageButton>
              </div>
            </div>
          </Form>
        </VintageCard>

        {/* ✅ Footer vintage */}
        <div className="text-center">
          <div className="font-pokemon text-xs text-pokemon-blue-dark space-y-2">
            <div className="flex justify-center items-center space-x-4">
              <span>🎯 BATTLE</span>
              <span>⚡ POWER</span>
              <span>🏆 VICTORY</span>
            </div>
            <div className="border-t-2 border-pokemon-blue-dark pt-2">
              © 2024 POKEMON BATTLE VINTAGE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Error Boundary spécifique
export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-pokemon-background flex items-center justify-center">
      <VintageCard padding="lg" className="max-w-md w-full">
        <VintageTitle level={2} className="text-pokemon-red text-center">
          Erreur de Connexion
        </VintageTitle>
        <div className="mt-4 text-center">
          <p className="font-pokemon text-xs text-pokemon-blue-dark mb-4">
            QUELQUE CHOSE S'EST MAL PASSÉ...
          </p>
          <VintageButton href="/auth/login" variant="blue">
            RÉESSAYER
          </VintageButton>
        </div>
      </VintageCard>
    </div>
  );
} 