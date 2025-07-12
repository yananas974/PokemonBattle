import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  useLocation,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { useEffect } from 'react';
import { globalAudio } from '~/utils/globalAudioManager';

import "./tailwind.css";
import "./styles/pokemon-modern.css";
import { AudioProvider } from '~/contexts/AudioContext';
import QuickActionsNavbar from '~/components/QuickActionsNavbar';
import NavbarSpacer from '~/components/NavbarSpacer';
import SimplePokemonParticles from '~/components/SimplePokemonParticles';
import { useOptionalUser } from '~/hooks/useUser';

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AudioProvider>
          {children}
          <ScrollRestoration />
          <Scripts />
        </AudioProvider>
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

export default function App() {
  const location = useLocation();
  const user = useOptionalUser();
  
  // Initialiser l'audio au chargement de l'app
  useEffect(() => {
    globalAudio.initialize();
  }, []);

  // Déterminer si on doit afficher la navigation
  const shouldShowNavigation = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Particules Pokémon en arrière-plan */}
      <SimplePokemonParticles 
        maxParticles={8} 
        speed={0.4} 
        minSize={35} 
        maxSize={65} 
      />
      
      {shouldShowNavigation && <QuickActionsNavbar user={user} />}
      {shouldShowNavigation && <NavbarSpacer />}
      <Outlet />
    </div>
  );
}
