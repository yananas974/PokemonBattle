import { useRouteLoaderData } from '@remix-run/react';
import type { User } from '@pokemon-battle/shared';

export function useUser(): User | undefined {
  // Essayer de récupérer l'utilisateur depuis différentes sources
  const dashboardData = useRouteLoaderData('routes/dashboard._index') as any;
  const pokemonData = useRouteLoaderData('routes/dashboard.pokemon._index') as any;
  const teamsData = useRouteLoaderData('routes/dashboard.teams._index') as any;
  const teamSelectPokemonData = useRouteLoaderData('routes/dashboard.teams.$teamId.select-pokemon') as any;
  const battleData = useRouteLoaderData('routes/dashboard.battle._index') as any;
  const battleInteractiveData = useRouteLoaderData('routes/dashboard.battle.interactive') as any;
  const friendsData = useRouteLoaderData('routes/dashboard.friends._index') as any;
  const profileData = useRouteLoaderData('routes/dashboard.profile') as any;
  
  // Retourner le premier utilisateur trouvé
  return dashboardData?.user || 
         pokemonData?.user || 
         teamsData?.user || 
         teamSelectPokemonData?.user ||
         battleData?.user || 
         battleInteractiveData?.user ||
         friendsData?.user || 
         profileData?.user;
}

export function useOptionalUser(): User | undefined {
  try {
    return useUser();
  } catch {
    return undefined;
  }
} 