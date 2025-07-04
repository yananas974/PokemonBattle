import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import type { Team, TeamsResponse } from '../../../backend/src/models/interfaces/team.interface';
import { 
  VintageCard, 
  VintageTitle, 
  VintageButton,
  StatusIndicator,
  QuickActions,
  TeamCard
} from '~/components';
import type { QuickAction } from '~/components';

export const meta: MetaFunction = () => {
  return [
    { title: 'Mes Équipes - Pokemon Battle' },
    { name: 'description', content: 'Gérez vos équipes Pokémon et préparez vos combats' },
  ];
};

interface LoaderData {
  user: any;
  teams: Team[];
  message?: string;
  error?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  try {
    // ✅ Utiliser le teamService qui gère correctement les tokens
    const data = await teamService.getMyTeams(request);
    
    return json({
      user,
      teams: data.teams || [],
      message: data.message
    } as LoaderData);
  } catch (error) {
    console.error('❌ Erreur lors du chargement des équipes:', error);
    
    return json({
      user,
      teams: [],
      error: 'Impossible de charger les équipes'
    } as LoaderData);
  }
};

export default function TeamsIndex() {
  const data = useLoaderData<LoaderData>();
  const { teams, message } = data;
  const error = 'error' in data ? data.error : undefined;

  const quickActions: QuickAction[] = [
    {
      title: 'NOUVELLE EQUIPE',
      description: 'CREER UNE NOUVELLE EQUIPE',
      icon: '➕',
      href: '/dashboard/teams/create',
      variant: 'green'
    },
    {
      title: 'DEMARRER COMBAT',
      description: 'LANCER UN COMBAT RAPIDE',
      icon: '⚔️',
      href: '/dashboard/battle',
      variant: 'red'
    },
    {
      title: 'EXPLORER POKEMON',
      description: 'DECOUVRIR DE NOUVEAUX POKEMON',
      icon: '🔍',
      href: '/dashboard/pokemon',
      variant: 'yellow'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation de retour */}
      <VintageCard padding="sm">
        <VintageButton 
          href="/dashboard" 
          variant="blue" 
          size="sm"
          className="inline-flex items-center space-x-2"
        >
          <span>🏠</span>
          <span>← RETOUR DASHBOARD</span>
        </VintageButton>
      </VintageCard>

      {/* Header vintage avec titre et stats */}
      <VintageCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <VintageTitle level={1} className="mb-3 flex items-center space-x-2">
              <span>👥</span>
              <span>MES EQUIPES</span>
              <span className="animate-pokemon-blink">⚡</span>
            </VintageTitle>
            <p className="font-pokemon text-xs text-pokemon-blue uppercase">
              {teams.length} EQUIPE{teams.length !== 1 ? 'S' : ''} DISPONIBLE{teams.length !== 1 ? 'S' : ''}
            </p>
          </div>
          
          {teams.length > 0 && (
            <VintageButton 
              href="/dashboard/teams/create" 
              variant="green"
              className="mt-4 md:mt-0"
            >
              ➕ NOUVELLE EQUIPE
            </VintageButton>
          )}
        </div>
      </VintageCard>

      {/* Status indicators */}
      {error && (
        <StatusIndicator
          type="error"
          title="ERREUR SYSTEME"
          message={error}
        />
      )}

      {message && !error && (
        <StatusIndicator
          type="success"
          title="OPERATION REUSSIE"
          message={message}
        />
      )}

      {/* Actions rapides */}
      <VintageCard>
        <VintageTitle level={2} className="mb-4 flex items-center space-x-2">
          <span>🎮</span>
          <span>ACTIONS RAPIDES</span>
        </VintageTitle>
        <QuickActions actions={quickActions} />
      </VintageCard>

      {/* Liste des équipes ou message vide */}
      {teams.length === 0 ? (
        <VintageCard padding="lg" className="text-center">
          <div className="text-6xl mb-4 opacity-50">👥</div>
          <VintageTitle level={3} className="mb-2">
            AUCUNE EQUIPE
          </VintageTitle>
          <p className="font-pokemon text-xs text-pokemon-blue mb-6 uppercase">
            CREER VOTRE PREMIERE EQUIPE POUR COMMENCER VOS AVENTURES
          </p>
          <VintageButton 
            href="/dashboard/teams/create" 
            variant="green"
            size="lg"
          >
            ➕ CREER MA PREMIERE EQUIPE
          </VintageButton>
        </VintageCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: Team) => (
            <TeamCard
              key={team.id}
              id={team.id}
              teamName={team.teamName}
              pokemon={team.pokemon?.map(p => ({
                pokemon_id: p.id,
                name_fr: p.name,
                name: p.name,
                sprite_url: p.sprite_url
              }))}
            />
          ))}
        </div>
      )}

      {/* Statistiques des équipes */}
      {teams.length > 0 && (
        <VintageCard>
          <VintageTitle level={2} className="mb-4">
            STATISTIQUES
          </VintageTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-digital text-pokemon-blue-dark mb-1">
                {teams.length}
              </div>
              <div className="font-pokemon text-xs text-pokemon-blue uppercase">
                EQUIPES
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-digital text-pokemon-green mb-1">
                {teams.reduce((acc, team) => acc + (team.pokemon?.length || 0), 0)}
              </div>
              <div className="font-pokemon text-xs text-pokemon-blue uppercase">
                POKEMON
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-digital text-pokemon-yellow mb-1">
                {teams.filter(team => (team.pokemon?.length || 0) === 6).length}
              </div>
              <div className="font-pokemon text-xs text-pokemon-blue uppercase">
                COMPLETES
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-digital text-pokemon-red mb-1">
                {teams.filter(team => (team.pokemon?.length || 0) > 0).length}
              </div>
              <div className="font-pokemon text-xs text-pokemon-blue uppercase">
                ACTIVES
              </div>
            </div>
          </div>
        </VintageCard>
      )}
    </div>
  );
} 