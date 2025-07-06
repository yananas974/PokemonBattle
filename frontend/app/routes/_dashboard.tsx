import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Outlet, useLoaderData, Form, Link, useNavigate, useRouteError } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import BottomNavigation from '~/components/BottomNavigation';
import { PokemonAudioPlayer } from '~/components/PokemonAudioPlayer';
import ClientOnly from '~/components/ClientOnly';
import { isRouteErrorResponse } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon Battle - Dashboard' },
    { name: 'description', content: 'Application Pokemon Battle - Gérez vos équipes, combattez et amusez-vous!' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userId, user } = await getUserFromSession(request);
  
  if (!userId || !user) {
    throw redirect('/login');
  }

  return json({
    user,
    currentPath: new URL(request.url).pathname
  });
};

export default function DashboardLayout() {
  const { user, currentPath } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  console.log('🔍 Dashboard Layout rendering for user:', user?.username);
  console.log('📍 Current path:', currentPath);

  return (
    <div className="pokemon-vintage-bg min-h-screen">
      {/* Header vintage Pokémon Bleu */}
      <header className="pokemon-card-vintage border-b-4 border-pokemon-blue sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo/Titre vintage */}
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-3 text-pokemon-yellow font-pokemon text-sm hover:text-pokemon-cream"
            >
              <span className="text-2xl">⚡</span>
              <span className="hidden sm:inline uppercase tracking-wider">POKEMON BATTLE</span>
            </Link>

            {/* Actions rapides vintage */}
            <div className="flex items-center space-x-3">
              {/* Profile Avatar vintage */}
              <Link
                to="/dashboard/profile"
                className="flex items-center space-x-2 pokemon-nav-item rounded-lg px-2 py-1"
              >
                <div className="w-8 h-8 bg-pokemon-blue rounded-lg flex items-center justify-center text-pokemon-yellow text-sm font-pokemon border-2 border-pokemon-blue-dark">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline text-sm font-pokemon text-pokemon-blue-dark">
                  {user.username?.toUpperCase()}
                </span>
              </Link>

              {/* Menu Burger vintage pour mobile */}
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="sm:hidden pokemon-btn-vintage pokemon-btn-yellow"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <span className="text-lg">⚙️</span>
              </button>

              {/* Logout vintage pour desktop */}
              <Form method="post" action="/logout" className="hidden sm:block">
                <button
                  type="submit"
                  className="pokemon-btn-vintage pokemon-btn-red"
                >
                  LOGOUT
                </button>
              </Form>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal avec espacement pour navigation */}
      <main className="flex-1 pb-24 sm:pb-20 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 main-content-with-sidebar">
          {/* Breadcrumb vintage pour navigation avancée */}
          <nav className="hidden sm:flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-pokemon-blue hover:text-pokemon-blue-dark font-pokemon">
                  ACCUEIL
                </Link>
              </li>
              {currentPath !== '/dashboard' && (
                <>
                  <span className="text-pokemon-blue-dark">→</span>
                  <li className="text-pokemon-blue-dark font-pokemon font-bold">
                    {getCurrentPageName(currentPath).toUpperCase()}
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Zone de contenu dynamique */}
          <Outlet context={{ user }} />
        </div>
      </main>

      {/* Navigation mobile vintage */}
      <div className="block">
        <BottomNavigation />
      </div>

      {/* Navigation desktop vintage */}
      <nav className="hidden sm:block fixed left-4 top-1/2 transform -translate-y-1/2 z-30">
        <div className="pokemon-nav-vintage p-3 space-y-2">
          {[
            { path: '/dashboard', icon: '🏠', label: 'Accueil' },
            { path: '/dashboard/pokemon', icon: '🔴', label: 'Pokémon' },
            { path: '/dashboard/teams', icon: '👥', label: 'Équipes' },
            { path: '/dashboard/battle', icon: '⚔️', label: 'Combat' },
            { path: '/dashboard/friends', icon: '🤝', label: 'Amis' },
            { path: '/dashboard/profile', icon: '👤', label: 'Profil' },
            { path: '/dashboard/settings', icon: '⚙️', label: 'Paramètres' },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-3 py-2 pokemon-nav-item transition-all duration-200
                ${currentPath.startsWith(item.path) ? 'active' : ''}
              `}
              title={item.label}
            >
              <span className="text-lg pokemon-icon-vintage">{item.icon}</span>
              <span className="text-xs font-pokemon">{item.label.toUpperCase()}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Audio Player vintage fixe - ClientOnly pour éviter l'hydratation */}
      <ClientOnly fallback={
        <div className="fixed bottom-20 right-4 z-50 pokemon-card-vintage p-3 min-w-72">
          <div className="text-xs font-pokemon text-pokemon-blue-dark text-center">
            🎵 CHARGEMENT AUDIO...
          </div>
        </div>
      }>
        <PokemonAudioPlayer />
      </ClientOnly>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  console.error('🚨 Dashboard Route Error:', error);
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="pokemon-vintage-bg min-h-screen flex items-center justify-center">
        <div className="pokemon-card-vintage p-8 text-center max-w-md">
          <div className="text-6xl mb-4 animate-pokemon-blink">❌</div>
          <h1 className="font-pokemon text-lg text-pokemon-blue-dark mb-4 uppercase">
            ERREUR {error.status}
          </h1>
          <p className="font-pokemon text-xs text-pokemon-blue mb-6 uppercase">
            {error.status === 404 ? 'PAGE NON TROUVEE' : 'ERREUR SYSTEME'}
          </p>
          <Link 
            to="/dashboard" 
            className="pokemon-btn-vintage pokemon-btn-blue inline-block"
          >
            RETOUR ACCUEIL
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pokemon-vintage-bg min-h-screen flex items-center justify-center">
      <div className="pokemon-card-vintage p-8 text-center max-w-md">
        <div className="text-6xl mb-4 animate-pokemon-blink">⚠️</div>
        <h1 className="font-pokemon text-lg text-pokemon-blue-dark mb-4 uppercase">
          ERREUR CRITIQUE
        </h1>
        <p className="font-pokemon text-xs text-pokemon-blue mb-6 uppercase">
          SYSTEME DEFAILLANT
        </p>
        <Link 
          to="/dashboard" 
          className="pokemon-btn-vintage pokemon-btn-blue inline-block"
        >
          REDEMARRER
        </Link>
      </div>
    </div>
  );
}

function getCurrentPageName(path: string): string {
  switch (true) {
    case path.includes('/pokemon'):
      return 'Pokémon';
    case path.includes('/teams'):
      return 'Équipes';
    case path.includes('/battle'):
      return 'Combat';
    case path.includes('/friends'):
      return 'Amis';
    case path.includes('/profile'):
      return 'Profil';
    case path.includes('/settings'):
      return 'Paramètres';
    default:
      return 'Dashboard';
  }
} 