import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, Link, Form, useActionData, useNavigation } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import { useState } from 'react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';

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
      { teamName: teamName.trim() }, // Fixed: using 'teamName' to match shared types
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

  // Suggestions de noms d'équipes modernes
  const teamNameSuggestions = [
    'Team Rocket',
    'Champions Kanto',
    'Maîtres Pokémon',
    'Dresseurs Elite',
    'Gardiens Légendaires',
    'Explorateurs',
    'Combattants',
    'Aventuriers'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-pulse">⚡</div>
        <div className="absolute top-40 right-20 text-4xl animate-bounce delay-300">🔮</div>
        <div className="absolute bottom-32 left-20 text-5xl animate-pulse delay-700">🎯</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-bounce delay-1000">🏆</div>
        <div className="absolute top-1/3 left-1/4 text-3xl animate-pulse delay-500">⭐</div>
        <div className="absolute top-2/3 right-1/3 text-3xl animate-bounce delay-1200">💎</div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Navigation Header */}
          <ModernCard variant="glass" className="backdrop-blur-xl bg-white/10">
            <div className="p-6">
              <nav className="flex items-center space-x-4">
                <Link 
                  to="/dashboard/teams"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 text-white hover:scale-105"
                >
                  <span className="text-lg">👥</span>
                  <span className="font-medium">← Retour aux Équipes</span>
                </Link>
                <span className="text-white/60">→</span>
                <h1 className="text-white font-bold text-lg">
                  🎮 Création d'Équipe
                </h1>
              </nav>
            </div>
          </ModernCard>

          {/* Error Message */}
          {actionData?.error && (
            <ModernCard variant="glass" className="border-l-4 border-red-400 bg-red-500/20">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h3 className="text-red-200 font-bold mb-2">
                      Erreur de Création
                    </h3>
                    <p className="text-red-100">{actionData.error}</p>
                  </div>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Main Creation Form */}
          <ModernCard variant="glass" size="xl" className="shadow-2xl">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  🏗️ Nouvelle Équipe Pokémon
                </h2>
                <p className="text-white/70">
                  Créez votre équipe de combat parfaite
                </p>
              </div>
              
              <Form method="post" className="space-y-8">
                {/* Team Name Input */}
                <div className="space-y-4">
                  <label className="block text-white font-semibold text-lg">
                    Nom de l'Équipe <span className="text-red-400">*</span>
                  </label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      name="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                      placeholder="Entrez le nom de votre équipe..."
                      maxLength={30}
                      required
                      disabled={isSubmitting}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">
                      {teamName.length}/30
                    </div>
                  </div>
                </div>

                {/* Name Suggestions */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold text-lg flex items-center space-x-2">
                    <span>💡</span>
                    <span>Suggestions de Noms</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {teamNameSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setTeamName(suggestion)}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Information Card */}
                <ModernCard variant="glass" className="bg-white/5">
                  <div className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-4 flex items-center space-x-2">
                      <span>📋</span>
                      <span>Informations de l'Équipe</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl mb-2">👤</div>
                        <div className="text-white/70 text-sm">Dresseur</div>
                        <div className="text-white font-medium">{user.username}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl mb-2">⚡</div>
                        <div className="text-white/70 text-sm">Pokémon</div>
                        <div className="text-white font-medium">0/6</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔄</div>
                        <div className="text-white/70 text-sm">Statut</div>
                        <div className="text-yellow-400 font-medium">En Création</div>
                      </div>
                    </div>
                  </div>
                </ModernCard>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <ModernButton
                    type="submit"
                    variant="pokemon"
                    size="lg"
                    disabled={isSubmitting || !teamName.trim()}
                    loading={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      "Création en cours..."
                    ) : (
                      <>
                        <span className="mr-2">✅</span>
                        Créer l'Équipe
                      </>
                    )}
                  </ModernButton>
                  
                  <Link
                    to="/dashboard/teams"
                    className="flex-1"
                  >
                    <ModernButton
                      variant="secondary"
                      size="lg"
                      className="w-full"
                    >
                      <span className="mr-2">❌</span>
                      Annuler
                    </ModernButton>
                  </Link>
                </div>
              </Form>
            </div>
          </ModernCard>

          {/* Tips Card */}
          <ModernCard variant="glass" className="bg-blue-500/20">
            <div className="p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center space-x-2">
                <span>💡</span>
                <span>Conseils pour votre Équipe</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">⚖️</span>
                  <div>
                    <div className="font-medium mb-1">Équilibre des Types</div>
                    <div className="text-sm">Variez les types pour couvrir plus de faiblesses</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-lg">📈</span>
                  <div>
                    <div className="font-medium mb-1">Niveaux Équilibrés</div>
                    <div className="text-sm">Gardez vos Pokémon à des niveaux similaires</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-lg">🎯</span>
                  <div>
                    <div className="font-medium mb-1">Stratégie</div>
                    <div className="text-sm">Pensez à votre style de combat</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-lg">🏆</span>
                  <div>
                    <div className="font-medium mb-1">Synergies</div>
                    <div className="text-sm">Choisissez des Pokémon qui se complètent</div>
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>
    </div>
  );
} 