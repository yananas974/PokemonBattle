import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { authService } from '~/services/authService';
import { createUserSession } from '~/sessions';

export const meta: MetaFunction = () => {
  return [
    { title: 'Connexion - Pokemon Battle' },
    { name: 'description', content: 'Connectez-vous à votre compte Pokemon Battle' },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log('=== ACTION LOGIN APPELÉE ===');
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  console.log('Données reçues - Email:', email, 'Password:', password ? 'fourni' : 'manquant');

  const errors: { [key: string]: string } = {};

  if (!email) {
    errors.email = 'L\'email est requis';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'L\'email n\'est pas valide';
  }

  if (!password) {
    errors.password = 'Le mot de passe est requis';
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors, success: false });
  }

  try {
    console.log('Appel du service de connexion...');
    const result = await authService.login({ email, password });
    console.log('Connexion réussie:', result);
    
    console.log('Création de la session utilisateur avec token...');
    
    // ✅ Stocker le token dans la session utilisateur
    const userData = {
      ...result.user,
      backendToken: result.token // ✅ Changé de token à backendToken
    };
    
    return createUserSession(result.user.id.toString(), userData, '/dashboard');
  } catch (error) {
    console.log('Erreur de connexion:', error);
    return json({
      errors: { general: error instanceof Error ? error.message : 'Erreur de connexion' },
      success: false,
    });
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              créez un nouveau compte
            </Link>
          </p>
        </div>

        <Form method="post" className="mt-8 space-y-6">
          {actionData?.errors?.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-700">{actionData.errors.general}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Adresse email"
              />
              {actionData?.errors && 'email' in actionData.errors && (
                <p className="mt-1 text-sm text-red-600">{actionData.errors.email}</p>
              )}
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Mot de passe"
              />
              {actionData?.errors && 'password' in actionData.errors && (
                <p className="mt-1 text-sm text-red-600">{actionData.errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">
              Retour à l'accueil
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
} 