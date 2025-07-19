// ✅ COMPOSANTS LAZY LOADÉS POUR OPTIMISATION DU BUNDLE (SSR-COMPATIBLE)

import { createLazyRoute, ComponentSkeleton, PokemonCardSkeleton } from '~/utils/lazyLoader';

// ✅ Composants de combat (lourds)
export const LazyBattleField = createLazyRoute(
  () => import('../battle/BattleField'),
  <ComponentSkeleton className="h-64 bg-gray-100 rounded-lg" lines={4} />
);

export const LazyBattleActions = createLazyRoute(
  () => import('../battle/BattleActions'),
  <ComponentSkeleton className="h-32 bg-gray-100 rounded-lg" lines={3} />
);

export const LazyBattleJournal = createLazyRoute(
  () => import('../battle/BattleJournal'),
  <ComponentSkeleton className="h-48 bg-gray-100 rounded-lg" lines={6} />
);

export const LazyBattleWeatherDisplay = createLazyRoute(
  () => import('../battle/BattleWeatherDisplay'),
  <ComponentSkeleton className="h-24 bg-gray-100 rounded-lg" lines={2} />
);

// ✅ Composants Pokemon (lourds)
export const LazyVirtualizedGrid = createLazyRoute(
  () => import('../pokemon/VirtualizedGrid'),
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <PokemonCardSkeleton key={i} />
    ))}
  </div>
);

export const LazyModernPokemonCard = createLazyRoute(
  () => import('../pokemon/ModernPokemonCard'),
  <PokemonCardSkeleton />
);

// ✅ Composants de dashboard (moyennement lourds)
export const LazyModernDashboard = createLazyRoute(
  () => import('../dashboard/ModernDashboard'),
  <ComponentSkeleton className="h-96 bg-gray-100 rounded-lg" lines={8} />
);

// ✅ Effets et animations (lourds)
export const LazySimplePokemonParticles = createLazyRoute(
  () => import('../effects/SimplePokemonParticles'),
  <div className="absolute inset-0 pointer-events-none opacity-20" />
);

export const LazyWeatherEffect = createLazyRoute(
  () => import('../effects/WeatherEffect'),
  <div className="absolute inset-0 pointer-events-none" />
);

// ✅ Modales (chargées à la demande)
export const LazyHackChallengeModal = createLazyRoute(
  () => import('../modals/HackChallengeModal'),
  <ComponentSkeleton className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" lines={4} />
);

export const LazyBattleResultModal = createLazyRoute(
  () => import('../battle/BattleResultModal'),
  <ComponentSkeleton className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" lines={6} />
);