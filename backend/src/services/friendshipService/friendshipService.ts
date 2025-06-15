import { Create, Get, GetMany, Delete, Update } from "../../db/crud/crud.js";
import { friendships, users } from "../../db/schema.js";
import { eq, and, or, type SQL } from "drizzle-orm";
import type { 
  FriendshipDB, 
  Friendship, 
  CreateFriendshipData, 
  UpdateFriendshipData, 
  TeamDB
} from "../../models/interfaces/interfaces.js";
import { 
  transformFriendshipForAPI,
  transformFriendshipForDB 
} from "../../models/interfaces/friendship.interface.js";


// ✅ DRY : Classe avec méthodes typées
export class FriendshipService {
  
  // ✅ Envoyer une demande d'ami
  static async sendFriendRequest(data: CreateFriendshipData, userId: number): Promise<Friendship> {
    console.log(`📤 Envoi demande d'ami: ${userId} -> ${data.friendId}`);
    
    // Vérifier qu'on ne s'ajoute pas soi-même
    if (data.friendId === userId) {
      throw new Error("Cannot add yourself as friend");
    }

    // Vérifier que la relation n'existe pas déjà
    const existingFriendships = await GetMany<FriendshipDB>(
      friendships, 
      or(
        and(eq(friendships.user_id, userId), eq(friendships.friend_id, data.friendId)),
        and(eq(friendships.user_id, data.friendId), eq(friendships.friend_id, userId))
      )!
    );

    if (existingFriendships.length > 0) {
      console.log(`❌ Amitié existe déjà:`, existingFriendships[0]);
      throw new Error("Friendship already exists");
    }

    const friendshipDB = await Create<FriendshipDB>(friendships, transformFriendshipForDB(data, userId));
    console.log(`✅ Demande créée:`, friendshipDB);
    return transformFriendshipForAPI(friendshipDB);
  }

  // ✅ Accepter une demande d'ami
  static async acceptFriendRequest(friendshipId: number, userId: number): Promise<Friendship> {
    console.log(`🤝 Acceptation demande: friendshipId=${friendshipId}, userId=${userId}`);
    
    // Vérifier que l'utilisateur est le destinataire de la demande
    const friendship = await Get<FriendshipDB>(
      friendships, 
      and(eq(friendships.id, friendshipId), eq(friendships.friend_id, userId))!
    );

    if (!friendship) {
      console.log(`❌ Demande non trouvée ou non autorisée`);
      throw new Error("Friend request not found or unauthorized");
    }

    if (friendship.status !== 'pending') {
      console.log(`❌ Demande pas en attente, statut: ${friendship.status}`);
      throw new Error("Friend request is not pending");
    }

    console.log(`📝 Mise à jour statut vers 'accepted'`);
    const updatedFriendship = await Update<FriendshipDB>(
      friendships, 
      eq(friendships.id, friendshipId), 
      { status: 'accepted', updated_at: new Date() }
    );

    console.log(`✅ Amitié acceptée:`, updatedFriendship);
    return transformFriendshipForAPI(updatedFriendship);
  }

  // ✅ Récupérer tous les amis d'un utilisateur
  static async getUserFriends(userId: number): Promise<Friendship[]> {
    console.log(`👥 Récupération amis pour userId=${userId}`);
    
    const userFriendships = await GetMany<FriendshipDB>(
      friendships,
      or(
        and(eq(friendships.user_id, userId), eq(friendships.status, 'accepted')),
        and(eq(friendships.friend_id, userId), eq(friendships.status, 'accepted'))
      )!
    );

    console.log(`📊 Amitiés trouvées:`, userFriendships.length);

    // Récupérer les informations des amis
    const friendsWithDetails = await Promise.all(
      userFriendships.map(async (friendship) => {
        const friendId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
        const friend = await Get<typeof users.$inferSelect>(users, eq(users.id, friendId));
        
        console.log(`👤 Ami trouvé: ${friend?.username} (ID: ${friendId})`);
        
        return {
          ...transformFriendshipForAPI(friendship),
          friend: friend ? {
            id: friend.id,
            username: friend.username,
            email: friend.email
          } : undefined
        };
      })
    );

    console.log(`✅ Amis avec détails:`, friendsWithDetails.length);
    return friendsWithDetails;
  }

  // ✅ Récupérer les demandes d'amis en attente (reçues)
  static async getPendingFriendRequests(userId: number): Promise<Friendship[]> {
    console.log(`📥 Récupération demandes en attente pour userId=${userId}`);
    
    const pendingRequests = await GetMany<FriendshipDB>(
      friendships,
      and(eq(friendships.friend_id, userId), eq(friendships.status, 'pending'))!
    );

    console.log(`📊 Demandes en attente trouvées:`, pendingRequests.length);

    // Récupérer les informations des utilisateurs qui ont envoyé les demandes
    const requestsWithDetails = await Promise.all(
      pendingRequests.map(async (friendship) => {
        const senderId = friendship.user_id; // Celui qui a envoyé la demande
        const sender = await Get<typeof users.$inferSelect>(users, eq(users.id, senderId));
        
        console.log(`👤 Expéditeur trouvé: ${sender?.username} (ID: ${senderId})`);
        
        return {
          ...transformFriendshipForAPI(friendship),
          friend: sender ? {
            id: sender.id,
            username: sender.username,
            email: sender.email
          } : undefined
        };
      })
    );

    console.log(`✅ Demandes avec détails:`, requestsWithDetails.length);
    return requestsWithDetails;
  }

  // ✅ Récupérer les demandes d'amis envoyées
  static async getSentFriendRequests(userId: number): Promise<Friendship[]> {
    const sentRequests = await GetMany<FriendshipDB>(
      friendships,
      and(eq(friendships.user_id, userId), eq(friendships.status, 'pending'))!
    );

    // Récupérer les informations des destinataires
    const requestsWithDetails = await Promise.all(
      sentRequests.map(async (friendship) => {
        const recipientId = friendship.friend_id;
        const recipient = await Get<typeof users.$inferSelect>(users, eq(users.id, recipientId));
        
        return {
          ...transformFriendshipForAPI(friendship),
          friend: recipient ? {
            id: recipient.id,
            username: recipient.username,
            email: recipient.email
          } : undefined
        };
      })
    );

    return requestsWithDetails;
  }

  // ✅ Supprimer une amitié
  static async removeFriend(friendshipId: number, userId: number): Promise<void> {
    const friendship = await Get<FriendshipDB>(friendships, eq(friendships.id, friendshipId));

    if (!friendship) {
      throw new Error("Friendship not found");
    }

    // Vérifier que l'utilisateur est impliqué dans cette relation
    if (friendship.user_id !== userId && friendship.friend_id !== userId) {
      throw new Error("Unauthorized to delete this friendship");
    }

    await Delete(friendships, eq(friendships.id, friendshipId));
  }

  // ✅ Refuser/Bloquer une demande d'ami
  static async updateFriendshipStatus(
    friendshipId: number, 
    userId: number, 
    status: 'blocked' | 'pending' | 'accepted'
  ): Promise<Friendship> {
    const friendship = await Get<FriendshipDB>(friendships, eq(friendships.id, friendshipId));

    if (!friendship) {
      throw new Error("Friendship not found");
    }

    // Vérifier que l'utilisateur est impliqué dans cette relation
    if (friendship.user_id !== userId && friendship.friend_id !== userId) {
      throw new Error("Unauthorized to modify this friendship");
    }

    const updatedFriendship = await Update<FriendshipDB>(
      friendships, 
      eq(friendships.id, friendshipId), 
      { status, updated_at: new Date() }
    );

    return transformFriendshipForAPI(updatedFriendship);
  }

  // ✅ Récupérer les équipes d'un ami (si on est ami)
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
    const { transformTeamForAPI } = await import('../../models/interfaces/team.interface.js');
    const { getTeamPokemon } = await import('../pokemonTeamService/teamPokemonService.js');

    const teamsDB = await GetMany<TeamDB>(Team, eq(Team.user_id, friendId));
    
    // Ajoute les pokémon à chaque équipe
    const teamsWithPokemon = await Promise.all(
      teamsDB.map(async (team) => {
        const teamAPI = transformTeamForAPI(team);
        const pokemon = await getTeamPokemon(team.id);
        return { ...teamAPI, pokemon: pokemon || [] };
      })
    );
    
    return teamsWithPokemon;
  }

  // ✅ Rechercher des utilisateurs par username (pour ajouter des amis)
  static async searchUsers(query: string, currentUserId: number): Promise<any[]> {
    // Récupérer tous les utilisateurs sauf l'utilisateur actuel
    const allUsers = await GetMany<typeof users.$inferSelect>(users, eq(users.id, users.id));
    const availableUsers = allUsers.filter(u => u.id !== currentUserId);
    
    // Retirer les mots de passe des résultats
    const usersWithoutPasswords = availableUsers.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return usersWithoutPasswords;
  }

  // ✅ Envoyer une demande d'ami (avec validation)
  static async sendFriendRequestWithValidation(friendId: number, userId: number): Promise<Friendship> {
    if (!friendId) {
      throw new Error('Friend ID is required');
    }

    const data: CreateFriendshipData = { friendId };
    return await this.sendFriendRequest(data, userId);
  }

  // ✅ Accepter une demande d'ami (avec validation)
  static async acceptFriendRequestWithValidation(friendshipId: number, userId: number): Promise<Friendship> {
    if (!friendshipId || isNaN(friendshipId)) {
      throw new Error('Invalid friendship ID');
    }

    // Utiliser la méthode acceptFriendRequest au lieu de updateFriendshipStatus
    return await this.acceptFriendRequest(friendshipId, userId);
  }

  // ✅ Bloquer un ami (avec validation)
  static async blockFriendWithValidation(friendshipId: number, userId: number): Promise<Friendship> {
    if (!friendshipId || isNaN(friendshipId)) {
      throw new Error('Invalid friendship ID');
    }

    return await this.updateFriendshipStatus(friendshipId, userId, 'blocked');
  }

  // ✅ Supprimer un ami (avec validation)
  static async removeFriendWithValidation(friendshipId: number, userId: number): Promise<void> {
    if (!friendshipId || isNaN(friendshipId)) {
      throw new Error('Invalid friendship ID');
    }

    await this.removeFriend(friendshipId, userId);
  }

  // ✅ Récupérer les utilisateurs disponibles (avec filtrage)
  static async getAvailableUsers(currentUserId: number): Promise<any[]> {
    // Récupérer tous les utilisateurs sauf l'utilisateur actuel
    const { getAllUsers } = await import('../authService/userService.js');
    const allUsers = await getAllUsers();
    const availableUsers = allUsers.filter(u => u.id !== currentUserId);
    
    // Retirer les mots de passe des résultats
    const usersWithoutPasswords = availableUsers.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return usersWithoutPasswords;
  }

  // ✅ Récupérer les équipes d'un ami (avec validation)
  static async getFriendTeamsWithValidation(friendId: number, userId: number) {
    if (!friendId || isNaN(friendId)) {
      throw new Error('Invalid friend ID');
    }

    return await this.getFriendTeams(friendId, userId);
  }

  // ✅ Récupérer les demandes envoyées (formatées pour le frontend)
  static async getSentFriendRequestsFormatted(userId: number): Promise<Friendship[]> {
    const requests = await this.getSentFriendRequests(userId);
    return requests;
  }

  // ✅ Récupérer les demandes reçues (formatées pour le frontend)
  static async getPendingFriendRequestsFormatted(userId: number): Promise<Friendship[]> {
    const requests = await this.getPendingFriendRequests(userId);
    return requests;
  }
}

// ✅ Export des fonctions individuelles (rétrocompatibilité)
export const sendFriendRequest = FriendshipService.sendFriendRequest;
export const acceptFriendRequest = FriendshipService.acceptFriendRequest;
export const updateFriendshipStatus = FriendshipService.updateFriendshipStatus;
export const getUserFriends = FriendshipService.getUserFriends;
export const getPendingFriendRequests = FriendshipService.getPendingFriendRequests;
export const getSentFriendRequests = FriendshipService.getSentFriendRequests;
export const removeFriend = FriendshipService.removeFriend;
export const searchUsers = FriendshipService.searchUsers; 