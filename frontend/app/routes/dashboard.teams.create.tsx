import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, Link, Form, useActionData, useNavigation } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import { useState } from 'react';

// Types pour les données
interface LoaderData {
  user: any;
}

interface ActionData {
  error?: string;
  success?: boolean;
  team?: any;
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Créer une Équipe - Pokemon Battle' },
    { name: 'description', content: 'Créez une nouvelle équipe de Pokémon' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs): Promise<Response> => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return json<LoaderData>({ user });
};

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const teamName = formData.get('teamName') as string;

  if (!teamName || teamName.trim().length === 0) {
    return json<ActionData>({
      error: 'Le nom de l\'équipe est requis'
    });
  }

  if (teamName.length > 30) {
    return json<ActionData>({
      error: 'Le nom de l\'équipe ne peut pas dépasser 30 caractères'
    });
  }

  try {
    const result = await teamService.createTeam(
      { teamName: teamName.trim() },
      user.backendToken || user.token
    );
    
    return redirect('/dashboard/teams');
  } catch (error) {
    return json<ActionData>({
      error: 'Erreur lors de la création de l\'équipe. Veuillez réessayer.'
    });
  }
};

export default function TeamsCreate() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [teamName, setTeamName] = useState('');

  const isSubmitting = navigation.state === 'submitting';

  // Suggestions de noms d'équipes vintage
  const teamNameSuggestions = [
    'TEAM ROCKET',
    'CHAMPIONS KANTO',
    'MAITRES POKEMON',
    'DRESSEURS ELITE',
    'GARDIENS LEGENDAIRES',
    'EXPLORATEURS',
    'COMBATTANTS',
    'AVENTURIERS'
  ];

  return (
    <div className="pokemon-vintage-bg min-h-screen p-5">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation de retour */}
        <nav className="pokemon-card-vintage">
          <div className="p-4 flex items-center space-x-3">
            <Link 
              to="/dashboard/teams" 
              className="pokemon-btn-vintage pokemon-btn-blue text-xs inline-flex items-center space-x-2"
            >
              <span>👥</span>
              <span>← RETOUR EQUIPES</span>
            </Link>
            <span className="font-pokemon text-xs text-gray-600">→</span>
            <span className="font-pokemon text-xs text-gray-800 uppercase">
              CREATION EQUIPE
            </span>
          </div>
        </nav>

        {/* Header vintage avec titre */}
        <div className="pokemon-card-vintage">
          <div className="p-6">
            <h1 className="font-pokemon text-2xl text-gray-700 mb-3 uppercase tracking-wide flex items-center space-x-3">
              <span className="text-3xl pokemon-blink">➕</span>
              <span>CREER UNE NOUVELLE EQUIPE</span>
            </h1>
            <p className="text-gray-600 text-sm">
              ASSEMBLEZ VOTRE EQUIPE DE REVE POUR DOMINER LES COMBATS POKEMON !
            </p>
          </div>
        </div>

        {/* Messages d'état vintage */}
        {actionData?.error && (
          <div className="pokemon-card-vintage border-l-4 border-red-500">
            <div className="p-4 bg-red-50">
              <h3 className="font-pokemon text-red-700 uppercase text-sm mb-2">
                ❌ ERREUR CREATION
              </h3>
              <p className="text-red-600 text-sm">{actionData.error}</p>
            </div>
          </div>
        )}

        {/* Formulaire de création vintage */}
        <div className="pokemon-card-vintage">
          <div className="p-6">
            <h2 className="font-pokemon text-lg text-gray-700 mb-4 uppercase">
              🎮 CONFIGURATION EQUIPE
            </h2>
            
            <Form method="post" className="space-y-6">
              {/* Nom de l'équipe */}
              <div>
                <label className="block font-pokemon text-sm text-gray-700 mb-2 uppercase">
                  NOM DE L'EQUIPE *
                </label>
                <div className="pokemon-lcd-screen p-3">
                  <input
                    type="text"
                    name="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-pokemon text-sm text-gray-800 uppercase placeholder-gray-500"
                    placeholder="ENTREZ LE NOM DE VOTRE EQUIPE..."
                    maxLength={30}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-pokemon text-xs text-gray-500">
                    MAX 30 CARACTERES
                  </span>
                  <span className="font-pokemon text-xs text-gray-500">
                    {teamName.length}/30
                  </span>
                </div>
              </div>

              {/* Suggestions de noms */}
              <div>
                <h3 className="font-pokemon text-sm text-gray-700 mb-3 uppercase">
                  💡 SUGGESTIONS DE NOMS
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {teamNameSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setTeamName(suggestion)}
                      className="pokemon-btn-vintage pokemon-btn-gray font-pokemon text-xs uppercase text-center"
                      disabled={isSubmitting}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Informations sur l'équipe */}
              <div className="pokemon-lcd-screen p-4">
                <h3 className="font-pokemon text-sm text-gray-700 mb-3 uppercase">
                  📋 INFORMATIONS EQUIPE
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-pokemon text-gray-600">DRESSEUR:</span>
                    <span className="font-pokemon text-gray-800 uppercase">{user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-pokemon text-gray-600">SLOTS POKEMON:</span>
                    <span className="font-pokemon text-gray-800">0/6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-pokemon text-gray-600">STATUT:</span>
                    <span className="font-pokemon text-yellow-600">EN CREATION</span>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !teamName.trim()}
                  className="flex-1 pokemon-btn-vintage pokemon-btn-green font-pokemon text-sm uppercase flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="pokemon-blink">⏳</span>
                      <span>CREATION EN COURS...</span>
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      <span>CREER L'EQUIPE</span>
                    </>
                  )}
                </button>
                
                <Link
                  to="/dashboard/teams"
                  className="flex-1 pokemon-btn-vintage pokemon-btn-red font-pokemon text-sm uppercase text-center flex items-center justify-center space-x-2"
                >
                  <span>❌</span>
                  <span>ANNULER</span>
                </Link>
              </div>
            </Form>
          </div>
        </div>

        {/* Étapes suivantes */}
        <div className="pokemon-card-vintage">
          <div className="p-5">
            <h3 className="font-pokemon text-lg text-gray-700 mb-4 uppercase">
              🗺️ ETAPES SUIVANTES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="pokemon-lcd-screen p-4 text-center">
                <div className="text-2xl mb-2">1️⃣</div>
                <h4 className="font-pokemon text-xs text-gray-700 mb-2 uppercase">
                  CREER L'EQUIPE
                </h4>
                <p className="text-xs text-gray-600">
                  Donnez un nom à votre équipe
                </p>
              </div>
              
              <div className="pokemon-lcd-screen p-4 text-center opacity-60">
                <div className="text-2xl mb-2">2️⃣</div>
                <h4 className="font-pokemon text-xs text-gray-700 mb-2 uppercase">
                  AJOUTER POKEMON
                </h4>
                <p className="text-xs text-gray-600">
                  Sélectionnez vos Pokémon
                </p>
              </div>
              
              <div className="pokemon-lcd-screen p-4 text-center opacity-60">
                <div className="text-2xl mb-2">3️⃣</div>
                <h4 className="font-pokemon text-xs text-gray-700 mb-2 uppercase">
                  COMBATTRE
                </h4>
                <p className="text-xs text-gray-600">
                  Lancez-vous dans l'arène !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 