import type { Pokemon } from "./pokemon.interface.js";

// ✅ INTERFACE DB (format base de données)
export interface TeamDB {
  id: number;
  team_name: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

// ✅ INTERFACE API (format frontend)
export interface Team {
  id: number;
  teamName: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  pokemon?: Pokemon[];
}

// ✅ INTERFACES POUR LES REQUÊTES
export interface CreateTeamData {
  teamName: string;
}

export interface UpdateTeamData {
  teamName?: string;
}

// ✅ INTERFACES POUR LES RÉPONSES
export interface TeamsResponse {
  message: string;
  teams: Team[];
}

export interface CreateTeamResponse {
  message: string;
  team: Team;
}

// ✅ AJOUTÉ: Fonction de transformation manquante
export const transformTeamForAPI = (teamDB: TeamDB): Team => ({
  id: teamDB.id,
  teamName: teamDB.team_name,
  userId: teamDB.user_id,
  createdAt: teamDB.created_at.toISOString(),
  updatedAt: teamDB.updated_at.toISOString()
});