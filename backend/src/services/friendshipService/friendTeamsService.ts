import { Get } from "../../db/crud/crud.js";
import { friendships } from "../../db/schema.js";
import { eq, and, or } from "drizzle-orm";
import type { FriendshipDB, TeamDB } from '@pokemon-battle/shared';
import { z } from "zod";
import { mapTeamToApi } from '../../mapper/team.mapper.js';

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
    const { Team } = await import('../../db/schema.js');
    const { GetMany } = await import('../../db/crud/crud.js');
    const { getTeamPokemon } = await import('../pokemonTeamService/pokemonTeamService.js');

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

    return await this.getFriendTeams(friendId, userId);
  }
} 