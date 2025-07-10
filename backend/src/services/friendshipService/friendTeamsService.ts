import { Get, GetMany } from "../../db/crud/crud.js";
import { friendships, Team } from "../../db/schema.js";
import { eq, and, or } from "drizzle-orm";
import type { FriendshipDB, TeamDB } from '@pokemon-battle/shared';
import { z } from "zod";
import { mapTeamToApi } from '../../mapper/team.mapper.js';
import { getTeamPokemon } from '../pokemonTeamService/pokemonTeamService.js';

// ✅ Schémas Zod
const getFriendTeamsSchema = z.object({
  friendId: z.number().min(1, "Friend ID must be positive"),
  userId: z.number().min(1, "User ID must be positive")
});

export class FriendTeamsService {

  static async getFriendTeams(friendId: number, userId: number) {
    // Vérifier l'amitié
    const friendship = await Get<FriendshipDB>(
      friendships,
      and(
        or(
          and(eq(friendships.user_id, userId), eq(friendships.friend_id, friendId)),
          and(eq(friendships.user_id, friendId), eq(friendships.friend_id, userId))
        ),
        eq(friendships.status, 'accepted')
      )!
    );
    
    if (!friendship) {
      throw new Error("Not authorized to view this user's teams");
    }
    
    // Récupérer les équipes de l'ami
    const teamsDB = await GetMany<TeamDB>(Team, eq(Team.user_id, friendId));
    
    // Ajoute les pokémon à chaque équipe
    const teamsWithPokemon = await Promise.all(
      teamsDB.map(async (team) => {
        const teamAPI = mapTeamToApi(team);
        const pokemon = await getTeamPokemon(team.id);
        return { ...teamAPI, pokemon: pokemon || [] };
      })
    );
    
    return teamsWithPokemon;
  }

  static async getFriendTeamsWithValidation(friendId: number, userId: number) {
    // ✅ Validation Zod
    getFriendTeamsSchema.parse({ friendId, userId });
    
    if (!friendId || isNaN(friendId)) {
      throw new Error('Invalid friend ID');
    }

    return await FriendTeamsService.getFriendTeams(friendId, userId);
  }
} 