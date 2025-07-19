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
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useEffect } from 'react';
import { getSecurityHeaders, generateNonce } from '~/utils/security';
import { preloader, shouldPreload } from '~/utils/preloader';
import { globalAudio } from '~/utils/globalAudioManager';

import "./tailwind.css";
import "./styles/pokemon-modern.css";
import { AudioProvider } from '~/contexts/AudioContext';
import { ErrorProvider } from '~/contexts/ErrorContext';
import { ErrorDisplay, GlobalErrorBoundary } from '~/components/feedback/ErrorDisplay';
import QuickActionsNavbar from '~/components/layout/QuickActionsNavbar';
import NavbarSpacer from '~/components/layout/NavbarSpacer';
import SimplePokemonParticles from '~/components/effects/SimplePokemonParticles';
import { useOptionalUser } from '~/hooks/useUser';

// ✅ Loader avec headers de sécurité
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const nonce = generateNonce();
  
  return new Response(JSON.stringify({ nonce }), {
    headers: {
      'Content-Type': 'application/json',
      ...getSecurityHeaders(nonce),
    },
  });
};

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
        <ErrorProvider>
          <AudioProvider>
            <GlobalErrorBoundary>
              {children}
              <ErrorDisplay />
            </GlobalErrorBoundary>
            <ScrollRestoration />
            <Scripts />
          </AudioProvider>
        </ErrorProvider>
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
  
  useEffect(() => {
    globalAudio.initialize();
  }, []);

  // ✅ Preloading intelligent basé sur la route
  useEffect(() => {
    if (!shouldPreload()) return;

    const pathname = location.pathname;
    
    if (pathname.includes('/dashboard')) {
      preloader.preloadForRoute('dashboard');
    }
    if (pathname.includes('/pokemon')) {
      preloader.preloadForRoute('pokemon');
    }
    if (pathname.includes('/battle')) {
      preloader.preloadForRoute('battle');
    }
  }, [location.pathname]);

  const shouldShowNavigation = location.pathname.startsWith('/dashboard');

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url("/detective-pikachu.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      <div className="relative z-10">
        {/* ✅ Navigation sera maintenant gérée par le layout dashboard */}
        {shouldShowNavigation && <QuickActionsNavbar user={user} />}
        {shouldShowNavigation && <NavbarSpacer />}
        <Outlet />
      </div>
    </div>
  );
}
