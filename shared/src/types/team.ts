import { Pokemon, PokemonInTeam } from './pokemon';

// ✅ INTERFACE ÉQUIPE
export interface Team {
  id: number;
  teamName: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// ✅ DONNÉES DE CRÉATION D'ÉQUIPE
export interface CreateTeamData {
  teamName: string;
}

// ✅ DONNÉES DE MISE À JOUR D'ÉQUIPE
export interface UpdateTeamData {
  teamName?: string;
}

// ✅ ÉQUIPE EN BASE DE DONNÉES (avec underscores)
export interface TeamDB {
  id: number;
  team_name: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

// ✅ ÉQUIPE AVEC POKÉMON
export interface TeamWithPokemon extends Team {
  pokemon: Array<{
    id: number;
    name: string;
    name_fr: string;
    type: string;
    level: number;
    sprite_url: string;
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  }>;
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