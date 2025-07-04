import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { getUserFromSession, createUserSession } from '~/sessions';
import { authService } from '~/services/authService';
import { 
  VintageCard, 
  VintageTitle, 
  VintageButton,
  VintageInput,
  StatusIndicator
} from '~/components';

export const meta: MetaFunction = () => {
  return [
    { title: 'Inscription - Pokemon Battle' },
    { name: 'description', content: 'Créez votre compte Pokemon Battle' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userId } = await getUserFromSession(request);
  
  // Si déjà connecté, rediriger vers l'app
  if (userId) {
    throw redirect('/dashboard');
  }
  
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;

  if (!email || !password || !username) {
    return json(
      { error: 'Tous les champs sont requis' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return json(
      { error: 'Le mot de passe doit contenir au moins 6 caractères' },
      { status: 400 }
    );
  }

  try {
    const result = await authService.signup({ email, password, username });
    
    // Le token est déjà dans result.user.token
    const userWithToken = {
      ...result.user,
      backendToken: result.user?.token // Garder une copie pour compatibilité
    };
    
    return createUserSession(result.user?.id.toString() || '', userWithToken, '/dashboard');
  } catch (error) {
    return json(
      { error: 'Erreur lors de la création du compte. Vérifiez que l\'email n\'est pas déjà utilisé.' },
      { status: 400 }
    );
  }
};

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="pokemon-vintage-bg min-h-screen flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header vintage Pokemon */}
        <div className="text-center">
          <div className="text-8xl mb-4 animate-pokemon-bounce">⚡</div>
          <VintageTitle level={1} className="mb-4">
            POKEMON BATTLE
          </VintageTitle>
          <p className="font-pokemon text-xs text-pokemon-blue uppercase tracking-wider">
            NOUVEAU DRESSEUR
          </p>
        </div>

        {/* Message d'erreur vintage */}
        {actionData?.error && (
          <StatusIndicator
            type="error"
            title="ERREUR INSCRIPTION"
            message={actionData.error}
            animate
          />
        )}

        {/* Formulaire d'inscription vintage */}
        <VintageCard padding="lg">
          <div className="space-y-6">
            <VintageTitle level={2} className="text-center mb-6">
              ➕ CREATION COMPTE
            </VintageTitle>

            <Form method="post" className="space-y-6">
              {/* Nom d'utilisateur vintage */}
              <VintageInput
                id="username"
                name="username"
                type="text"
                label="NOM DE DRESSEUR"
                placeholder="VOTRE PSEUDO"
                icon="👤"
                autoComplete="username"
                required
              />

              {/* Email vintage */}
              <VintageInput
                id="email"
                name="email"
                type="email"
                label="ADRESSE EMAIL"
                placeholder="VOTRE@EMAIL.COM"
                icon="📧"
                autoComplete="email"
                required
              />

              {/* Mot de passe vintage */}
              <div>
                <VintageInput
                  id="password"
                  name="password"
                  type="password"
                  label="MOT DE PASSE"
                  placeholder="••••••••"
                  icon="🔑"
                  autoComplete="new-password"
                  required
                />
                <p className="mt-2 font-pokemon text-xs text-pokemon-blue uppercase">
                  ⚠️ MINIMUM 6 CARACTERES
                </p>
              </div>

              {/* Bouton d'inscription vintage */}
              <VintageButton
                type="submit"
                variant="green"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="animate-pokemon-blink">⏳</span>
                    <span>CREATION EN COURS...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🎯</span>
                    <span>CREER MON COMPTE</span>
                  </div>
                )}
              </VintageButton>
            </Form>

            {/* Séparateur vintage */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-pokemon-blue-dark"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-pokemon-cream px-3 font-pokemon text-pokemon-blue-dark">
                  DEJA DRESSEUR ?
                </span>
              </div>
            </div>

            {/* Lien vers connexion vintage */}
            <div className="text-center">
              <VintageButton
                href="/login"
                variant="blue"
                size="md"
                className="w-full"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>🚀</span>
                  <span>SE CONNECTER</span>
                </div>
              </VintageButton>
            </div>
          </div>
        </VintageCard>
       

        {/* Footer vintage */}
        <div className="text-center">
          <p className="font-pokemon text-xs text-pokemon-blue opacity-75 uppercase">
            © 2024 POKEMON BATTLE SYSTEM
          </p>
         
        </div>

      </div>
    </div>
  );
} 