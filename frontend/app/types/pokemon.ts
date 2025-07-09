// ✅ RÉEXPORT DES TYPES SHARED AVEC ADAPTATIONS FRONTEND
export { 
  Pokemon, 
  PokemonInTeam, 
  PokemonDetail, 
  BattlePokemon, 
  PokemonResponse, 
  PokemonDetailResponse, 
  CreatePokemonRequest,
  PokemonType as PokemonTypeEnum 
} from '@pokemon-battle/shared';

// ✅ TYPES SPÉCIFIQUES AU FRONTEND (si nécessaire)
export interface PokemonCardProps {
  id: number;
  name_fr: string;
  type: string;
  sprite_url: string;
  base_hp: number;
  base_attack: number;
}

export interface PokemonFiltersProps {
  types: string[];
  generations: number[];
  currentFilters: {
    search: string;
    type: string;
    generation: string;
  };
  isLoading: boolean;
} 