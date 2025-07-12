import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLocation } from '@remix-run/react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { useState, useEffect } from 'react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Simply return a 404 for all unmatched routes
  return json(null, { status: 404 });
};

// Composant pour les particules de feu
const FireParticles = () => {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        >
          <span className="text-2xl opacity-60">
            {['🔥', '💥', '⚡', '✨'][Math.floor(Math.random() * 4)]}
          </span>
        </div>
      ))}
    </div>
  );
};

// Composant pour l'effet de feu du Dracaufeu
const DragonFireEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Flammes qui sortent de la bouche */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* Flamme principale */}
          <div className="absolute -right-20 -top-4 w-32 h-8 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 rounded-full animate-pulse opacity-80 blur-sm"></div>
          <div className="absolute -right-24 -top-2 w-28 h-6 bg-gradient-to-r from-orange-500 via-yellow-400 to-red-300 rounded-full animate-ping opacity-60"></div>
          
          {/* Étincelles */}
          <div className="absolute -right-16 -top-6 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
          <div className="absolute -right-12 -top-8 w-1 h-1 bg-orange-400 rounded-full animate-ping opacity-60"></div>
          <div className="absolute -right-20 top-2 w-1 h-1 bg-red-400 rounded-full animate-pulse opacity-70"></div>
          
          {/* Fumée */}
          <div className="absolute -right-8 -top-12 w-16 h-16 bg-gray-400 rounded-full animate-pulse opacity-20 blur-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default function NotFound() {
  const location = useLocation();
  const [showFire, setShowFire] = useState(false);
  
  useEffect(() => {
    // Déclencher l'effet de feu après un délai
    const timer = setTimeout(() => {
      setShowFire(true);
    }, 1000);
    
    // Répéter l'effet de feu toutes les 4 secondes
    const interval = setInterval(() => {
      setShowFire(false);
      setTimeout(() => setShowFire(true), 500);
    }, 4000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Particules de feu en arrière-plan */}
      <FireParticles />
      
      {/* Effet de chaleur ondulante */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-red-500 to-transparent opacity-10 animate-pulse" />
      
      <div className="relative z-10 max-w-4xl w-full">
        <ModernCard variant="glass" size="xl" className="text-center shadow-2xl border-2 border-orange-500 border-opacity-30">
          
          {/* Section Dracaufeu */}
          <div className="mb-8 relative">
            <div className="flex justify-center items-center mb-6">
              <div className="relative">
                {/* Image de Dracaufeu */}
                <img 
                  src="/pokemon-png-18176 (1).png" 
                  alt="Dracaufeu crachant du feu" 
                  className="w-64 h-64 object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
                  style={{ imageRendering: 'pixelated' }}
                />
                
               
                
                {/* Aura de feu autour de Dracaufeu */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 rounded-full opacity-20 animate-pulse blur-2xl scale-110"></div>
              </div>
            </div>
            
            {/* Titre avec effet de feu */}
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent animate-pulse">
              🔥 Route Introuvable ! 🔥
            </h1>
            
            <div className="flex justify-center space-x-4 text-4xl opacity-60 mb-6">
              <span className="animate-bounce delay-100">🔥</span>
              <span className="animate-bounce delay-200">💥</span>
              <span className="animate-bounce delay-300">⚡</span>
              <span className="animate-bounce delay-400">✨</span>
            </div>
          </div>
          
          {/* Message d'erreur avec style feu */}
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
          
          {/* Boutons d'action avec thème feu */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModernButton
                href="/"
                variant="pokemon"
                size="lg"
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2 text-xl">🏠</span>
                  Retour Accueil
                </span>
              </ModernButton>
              
              <ModernButton
                href="/dashboard"
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2 text-xl">🎮</span>
                  Dashboard
                </span>
              </ModernButton>
            </div>
            
            {/* Liens d'accès rapide avec thème feu */}
            <div className="pt-6 border-t border-orange-500 border-opacity-30">
              <p className="text-orange-300 text-sm mb-4 font-semibold">🔥 Ou explorez les flammes :</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ModernButton
                  href="/login"
                  variant="secondary"
                  size="sm"
                  className="text-xs bg-red-800 bg-opacity-50 hover:bg-red-700 hover:bg-opacity-70 border-red-500 border-opacity-50"
                >
                  <span className="flex flex-col items-center">
                    <span className="text-lg mb-1">🔐</span>
                    <span>Connexion</span>
                  </span>
                </ModernButton>
                
                <ModernButton
                  href="/register"
                  variant="secondary"
                  size="sm"
                  className="text-xs bg-orange-800 bg-opacity-50 hover:bg-orange-700 hover:bg-opacity-70 border-orange-500 border-opacity-50"
                >
                  <span className="flex flex-col items-center">
                    <span className="text-lg mb-1">⭐</span>
                    <span>Inscription</span>
                  </span>
                </ModernButton>
                
                <ModernButton
                  href="/dashboard/pokemon"
                  variant="secondary"
                  size="sm"
                  className="text-xs bg-yellow-800 bg-opacity-50 hover:bg-yellow-700 hover:bg-opacity-70 border-yellow-500 border-opacity-50"
                >
                  <span className="flex flex-col items-center">
                    <span className="text-lg mb-1">🔴</span>
                    <span>Pokémon</span>
                  </span>
                </ModernButton>
                
                <ModernButton
                  href="/dashboard/teams"
                  variant="secondary"
                  size="sm"
                  className="text-xs bg-red-800 bg-opacity-50 hover:bg-red-700 hover:bg-opacity-70 border-red-500 border-opacity-50"
                >
                  <span className="flex flex-col items-center">
                    <span className="text-lg mb-1">👥</span>
                    <span>Équipes</span>
                  </span>
                </ModernButton>
              </div>
            </div>
          </div>
          
          {/* Message de pied de page avec thème feu */}
          <div className="mt-8 pt-6 border-t border-orange-500 border-opacity-30">
            <p className="text-orange-400 text-sm font-semibold">
              🔥 Dracaufeu vous guide vers de nouvelles aventures ! 🔥
            </p>
          </div>
        </ModernCard>
        
        {/* Éléments flottants avec thème feu */}
        <div className="absolute -top-4 -left-4 text-4xl opacity-50 animate-bounce">🔥</div>
        <div className="absolute -top-4 -right-4 text-4xl opacity-50 animate-bounce delay-1000">💥</div>
        <div className="absolute -bottom-4 -left-4 text-4xl opacity-50 animate-bounce delay-500">⚡</div>
        <div className="absolute -bottom-4 -right-4 text-4xl opacity-50 animate-bounce delay-1500">✨</div>
        
        {/* Éléments supplémentaires pour l'ambiance feu */}
        <div className="absolute top-1/4 -left-8 text-3xl opacity-30 animate-pulse delay-2000">🌋</div>
        <div className="absolute top-3/4 -right-8 text-3xl opacity-30 animate-pulse delay-2500">🔥</div>
      </div>
    </div>
  );
} 