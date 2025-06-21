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
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
         style={{
           backgroundImage: 'url(/0a7fb6143ad3113e76e1de04a9eaee16.png)',
           backgroundSize: '20%',
           backgroundPosition: 'left center',
           backgroundRepeat: 'no-repeat'
         }}>
      {/* Overlay avec dégradé Pokémon */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-blue-900/40 to-yellow-900/40"></div>
      
      <div className="relative max-w-md w-full space-y-8 z-10">
        {/* Logo Pokémon au-dessus */}
        <div className="text-center mb-8">
          <img 
            src="/0f05e7b85a1b3ba4fce9be78fde09861.png" 
            alt="Pokémon Logo" 
            className="mx-auto h-120 w-120  drop-shadow-2xl"
          />
        </div>

        {/* Container principal style Pokédex */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-1 rounded-3xl shadow-2xl">
          <div className="bg-gradient-to-br from-gray-100 to-white rounded-3xl p-6 relative overflow-hidden">
            
            {/* Éléments décoratifs style Pokédex */}
            <div className="absolute top-4 left-4 flex space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg"></div>
            </div>

            {/* Header avec style Pokémon */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
                🔴 POKÉDEX LOGIN
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Connectez-vous, Dresseur !
              </h2>
              <p className="text-sm text-gray-600">
                Accédez à votre <span className="text-blue-600 font-semibold">Pokédex</span> personnel
              </p>
            </div>

            {/* Messages d'erreur avec style Pokémon */}
            {actionData?.errors?.general && (
              <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 mb-6 relative">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <p className="text-sm text-red-700 font-medium">{actionData.errors.general}</p>
                </div>
              </div>
            )}

            <Form method="post" className="space-y-6">
              {/* Input Email style Pokémon */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                  ✉️
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-blue-300"
                  placeholder="Votre email de Dresseur"
                />
                {actionData?.errors && 'email' in actionData.errors && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">🚫</span>
                    {actionData.errors.email}
                  </p>
                )}
              </div>

              {/* Input Password style Pokémon */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500">
                  🔐
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:border-red-300"
                  placeholder="Mot de passe secret"
                  style={{
                    color: '#ef4444', // Texte rouge
                    WebkitTextSecurity: 'disc',
                  }}
                />
                {actionData?.errors && 'password' in actionData.errors && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">🚫</span>
                    {actionData.errors.password}
                  </p>
                )}
              </div>

              {/* Bouton de connexion style Pokéball */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-red-400"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">⚡</span>
                    Se connecter au Pokédex
                    <span className="ml-2">⚡</span>
                  </span>
                )}
              </button>

              {/* Liens avec style Pokémon */}
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Nouveau Dresseur ?{' '}
                  <Link
                    to="/signup"
                    className="font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                  >
                    Créer un compte 🎒
                  </Link>
                </p>
                
                <Link 
                  to="/" 
                  className="inline-flex items-center text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors duration-200 hover:underline"
                >
                  <span className="mr-1">🏠</span>
                  Retour au Centre Pokémon
                </Link>
              </div>

              {/* Éléments décoratifs bottom */}
              <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
                <span className="text-xl animate-bounce" style={{animationDelay: '0s'}}>⚡</span>
                <span className="text-xl animate-bounce" style={{animationDelay: '0.1s'}}>🔥</span>
                <span className="text-xl animate-bounce" style={{animationDelay: '0.2s'}}>💧</span>
                <span className="text-xl animate-bounce" style={{animationDelay: '0.3s'}}>🌿</span>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
} 