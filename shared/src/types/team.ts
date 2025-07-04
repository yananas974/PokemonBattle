import { Pokemon, PokemonInTeam } from './pokemon';

// ✅ INTERFACE ÉQUIPE
export interface Team {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// ✅ ÉQUIPE AVEC POKEMON
export interface TeamWithPokemon extends Team {
  pokemon: PokemonInTeam[];
}

// ✅ REQUÊTES ET RÉPONSES API
export interface CreateTeamRequest {
  name: string;
}

export interface CreateTeamResponse {
  success: boolean;
  team?: Team;
  message?: string;
  error?: string;
}

export interface TeamsResponse {
  success: boolean;
  teams: TeamWithPokemon[];
  totalCount?: number;
}

export interface AddPokemonToTeamRequest {
  pokemon_id: number;
  level?: number;
}

export interface AddPokemonToTeamResponse {
  success: boolean;
  team?: TeamWithPokemon;
  message?: string;
  error?: string;
} 