import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, useLoaderData, Form, useActionData, useNavigation } from '@remix-run/react';
import { getUserFromSession, destroySession, getSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import { 
  VintageCard, 
  VintageTitle, 
  StatCard, 
  QuickActions, 
  VintageButton,
  SimpleWeatherWidget,
  type QuickAction 
} from '~/components';
import { authService } from '~/services/authService';

export const meta: MetaFunction = () => {
  return [
    { title: 'Accueil - Pokemon Battle' },
    { name: 'description', content: 'Tableau de bord Pokemon Battle - Vue d\'ensemble de vos activités' },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'logout') {
    try {
      // Appeler l'API backend pour la déconnexion
      const result = await authService.logout();
      console.log('✅ Backend logout result:', result);

      // Détruire la session côté frontend
      const session = await getSession(request.headers.get('Cookie'));
      
      return redirect('/login', {
        headers: {
          'Set-Cookie': await destroySession(session),
        },
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      return json({ 
        error: 'Erreur lors de la déconnexion',
        success: false 
      });
    }
  }

  return json({ error: 'Action non reconnue' });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  // Si pas d'utilisateur, on laisse le layout parent gérer la redirection
  if (!user) {
    console.log('❌ Dashboard._index - Aucun utilisateur trouvé');
    return json({
      user: null,
      stats: { totalTeams: 0, totalBattles: 0, activeBattles: 0 },
      recentTeams: [],
      recentBattles: []
    });
  }

  // Debug de l'utilisateur et du token
  console.log('🔍 Dashboard._index - User trouvé:', {
    id: user.id,
    email: user.email,
    username: user.username,
    hasToken: !!user.token,
    tokenLength: user.token?.length,
    tokenStart: user.token?.substring(0, 20),
    hasBackendToken: !!user.backendToken,
    backendTokenLength: user.backendToken?.length
  });

  try {
    // Utiliser le token ou backendToken
    const tokenToUse = user.token || user.backendToken;
    console.log('🔑 Token utilisé pour l\'API:', tokenToUse ? `${tokenToUse.substring(0, 20)}...` : 'AUCUN');
    
    if (!tokenToUse) {
      console.error('❌ Aucun token disponible pour l\'API');
      return json({
        user,
        stats: { totalTeams: 0, totalBattles: 0, activeBattles: 0 },
        recentTeams: [],
        recentBattles: []
      });
    }

    // Récupérer les statistiques utilisateur
    console.log('📡 Appel API teamService.getMyTeams...');
    const teamsResponse = await teamService.getMyTeams(tokenToUse);
    const teams = teamsResponse.teams || [];
    const stats = {
      totalTeams: teams.length,
      totalBattles: 0, // TODO: implémenter le service de bataille
      activeBattles: 0
    };

    console.log('✅ Dashboard._index - Stats récupérées:', stats);

    return json({
      user,
      stats,
      recentTeams: teams.slice(0, 3), // Les 3 dernières équipes
      recentBattles: []
    });
  } catch (error) {
    console.error('❌ Erreur lors du chargement des données dashboard:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Unknown error');
    return json({
      user,
      stats: { totalTeams: 0, totalBattles: 0, activeBattles: 0 },
      recentTeams: [],
      recentBattles: []
    });
  }
};

export default function DashboardIndex() {
  const { user, stats, recentTeams, recentBattles } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isLoggingOut = navigation.state === 'submitting' && navigation.formData?.get('intent') === 'logout';

  // Si pas d'utilisateur, affichage de chargement (le layout parent va rediriger)
  if (!user) {
    return (
      <VintageCard padding="lg" className="text-center">
        <div className="text-6xl mb-4 animate-pokemon-blink">⏳</div>
        <p className="font-pokemon text-xs text-pokemon-blue-dark uppercase">
          CHARGEMENT DU SYSTEME...
        </p>
      </VintageCard>
    );
  }

  const quickActions: QuickAction[] = [
    {
      title: 'NOUVEAU COMBAT',
      description: 'DEMARRER UN COMBAT RAPIDE',
      icon: '⚔️',
      href: '/dashboard/battle',
      variant: 'red',
      featured: true
    },
    {
      title: 'MES EQUIPES',
      description: 'VOIR ET GERER MES EQUIPES',
      icon: '👥',
      href: '/dashboard/teams',
      variant: 'blue'
    },
    {
      title: 'CREER UNE EQUIPE',
      description: 'ASSEMBLER UNE NOUVELLE EQUIPE',
      icon: '➕',
      href: '/dashboard/teams/create',
      variant: 'green'
    },
    {
      title: 'EXPLORER POKEMON',
      description: 'DECOUVRIR DE NOUVEAUX POKEMON',
      icon: '🔍',
      href: '/dashboard/pokemon',
      variant: 'yellow'
    },
    {
      title: 'AJOUTER UN AMI',
      description: 'INVITER DES AMIS A JOUER',
      icon: '🤝',
      href: '/dashboard/friends?tab=search',
      variant: 'gray'
    }
  ];

  console.log('🔍 Dashboard quickActions:', quickActions.map(a => ({ title: a.title, href: a.href })));

  return (
    <div className="space-y-6">
      {/* Affichage des erreurs de déconnexion */}
      {actionData?.error && (
        <VintageCard className="border-l-4 border-pokemon-red">
          <div className="bg-red-50 p-4">
            <VintageTitle level={3} className="text-pokemon-red mb-2">
              ❌ ERREUR DECONNEXION
            </VintageTitle>
            <p className="text-red-600 text-sm font-pokemon">{actionData.error}</p>
          </div>
        </VintageCard>
      )}

      {/* Header de bienvenue vintage avec bouton déconnexion */}
      <VintageCard>
        <div className="flex items-center justify-between">
          <div>
            <VintageTitle level={1}>
              SALUT, {user.username?.toUpperCase()} ! ⚡
            </VintageTitle>
            <p className="font-pokemon text-xs text-pokemon-blue">
              PRET POUR DE NOUVEAUX COMBATS ?
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-5xl">
              🎮
            </div>
            {/* Bouton de déconnexion vintage */}
            <Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <VintageButton
                type="submit"
                variant="red"
                size="sm"
                disabled={isLoggingOut}
                className="flex items-center space-x-2"
              >
                {isLoggingOut ? (
                  <>
                    <span>⏳</span>
                    <span>DECONNEXION...</span>
                  </>
                ) : (
                  <>
                    <span>🚪</span>
                    <span>LOGOUT</span>
                  </>
                )}
              </VintageButton>
            </Form>
          </div>
        </div>
      </VintageCard>

      {/* Widget météo vintage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Actions rapides vintage */}
          <VintageCard>
            <VintageTitle level={2}>ACTIONS RAPIDES</VintageTitle>
            <QuickActions actions={quickActions} />
          </VintageCard>
        </div>
        <div className="lg:col-span-1">
          <SimpleWeatherWidget />
        </div>
      </div>

      {/* Message si pas d'équipes */}
      {recentTeams.length === 0 && (
        <VintageCard padding="lg" className="text-center">
          <div className="text-6xl mb-4 opacity-50">👥</div>
          <VintageTitle level={3} className="mb-2">
            AUCUNE EQUIPE
          </VintageTitle>
          <p className="font-pokemon text-xs text-pokemon-blue mb-4 uppercase">
            CREER VOTRE PREMIERE EQUIPE POUR COMMENCER
          </p>
          <VintageButton 
            href="/dashboard/teams/create" 
            variant="green"
          >
            CREER UNE EQUIPE
          </VintageButton>
        </VintageCard>
      )}
    </div>
  );
} 