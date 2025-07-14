import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLocation } from '@remix-run/react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { useState, useEffect } from 'react';
import { AppLink } from '~/components/AppLink';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json(null, { status: 404 });
};

export default function NotFound() {
  const location = useLocation();
  const [showFire, setShowFire] = useState(false);

  // 🔥 Animation feu en boucle
  useEffect(() => {
    const timer = setTimeout(() => setShowFire(true), 1000);
    const interval = setInterval(() => {
      setShowFire(false);
      setTimeout(() => setShowFire(true), 500);
    }, 4000);

    // ⛔️ Bloque le scroll de la page
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      document.body.style.overflow = ''; // reset scroll on unmount
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 overflow-hidden">
      {/* Effet chaleur */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-red-500 to-transparent opacity-10 animate-pulse" />

      <div className="relative z-10 max-w-4xl w-full">
        <ModernCard
          variant="glass"
          size="xl"
          className="text-center shadow-2xl border-2 border-orange-500 border-opacity-30"
        >
          {/* 🔥 Section Dracaufeu */}
          <div className="mb-8 relative">
            <div className="flex justify-center items-center mb-6">
              <div className="relative">
                <img
                  src="/pokemon-png-18176 (1).png"
                  alt="Dracaufeu"
                  className="w-64 h-64 object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 rounded-full opacity-20 animate-pulse blur-2xl scale-110" />
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent animate-pulse">
              🔥 Route Introuvable ! 🔥
            </h1>
          </div>

          {/* 💬 Message d'erreur */}
          <div className="mb-8">
            <p className="text-2xl text-orange-200 mb-4 font-semibold">
              Dracaufeu n'a pas trouvé cette page !
            </p>
            <p className="text-lg text-gray-300 mb-6">
              Même avec son souffle de feu, impossible de localiser cette route...
            </p>
            <div className="bg-black bg-opacity-40 rounded-xl p-6 backdrop-blur-sm border border-orange-500 border-opacity-30">
              <p className="text-orange-400 text-sm mb-2 font-semibold">🔍 Route recherchée :</p>
              <code className="text-yellow-300 font-mono text-lg break-all bg-black bg-opacity-50 px-3 py-2 rounded">
                {location.pathname}
              </code>
            </div>
          </div>

          {/* 🎮 Boutons */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-1">
              <AppLink
                to="/dashboard"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2 text-xl">🏠</span>
                  Retour Accueil
                </span>
              </AppLink>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
