import { Create, Get, GetMany, Update } from "../../db/crud/crud.js";
import { friendships, users } from "../../db/schema.js";
import { eq, and, or } from "drizzle-orm";
import type { 
  FriendshipDB, 
  Friendship, 
  CreateFriendshipData
} from "../../models/interfaces/interfaces.js";
import { mapFriendshipToApi, mapCreateFriendshipToDb } from "../../mapper/friendship.mapper.js";
import { z } from "zod";

// ✅ Schémas Zod
const sendFriendRequestSchema = z.object({
  friendId: z.number().min(1, "Friend ID must be positive")
});

const friendshipActionSchema = z.object({
  friendshipId: z.number().min(1, "Friendship ID must be positive"),
  userId: z.number().min(1, "User ID must be positive")
});

const updateStatusSchema = z.object({
  friendshipId: z.number().min(1, "Friendship ID must be positive"),
  userId: z.number().min(1, "User ID must be positive"),
  status: z.enum(['blocked', 'pending', 'accepted'])
});

export class FriendRequestService {
  
  static async sendFriendRequest(data: CreateFriendshipData, userId: number): Promise<Friendship> {
    console.log(`📤 Envoi demande d'ami: ${userId} -> ${data.friendId}`);
    
    // ✅ Validation Zod
    sendFriendRequestSchema.parse({ friendId: data.friendId });
    
    if (data.friendId === userId) {
      throw new Error("Cannot add yourself as friend");
    }

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

    const friendshipDB = await Create<FriendshipDB>(friendships, mapCreateFriendshipToDb(data, userId));
    console.log(`✅ Demande créée:`, friendshipDB);
    return mapFriendshipToApi(friendshipDB);  
  }

  static async acceptFriendRequest(friendshipId: number, userId: number): Promise<Friendship> {
    console.log(`🤝 Acceptation demande: friendshipId=${friendshipId}, userId=${userId}`);
    
    // ✅ Validation Zod
    friendshipActionSchema.parse({ friendshipId, userId });
    
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
    return mapFriendshipToApi(updatedFriendship);
  }

  static async getPendingFriendRequests(userId: number): Promise<Friendship[]> {
    console.log(`📥 Récupération demandes en attente pour userId=${userId}`);
    
    const pendingRequests = await GetMany<FriendshipDB>(
      friendships,
      and(eq(friendships.friend_id, userId), eq(friendships.status, 'pending'))!
    );

    console.log(`📊 Demandes en attente trouvées:`, pendingRequests.length);

    const requestsWithDetails = await Promise.all(
      pendingRequests.map(async (friendship) => {
        const senderId = friendship.user_id;
        const sender = await Get<typeof users.$inferSelect>(users, eq(users.id, senderId));
        
        console.log(`👤 Expéditeur trouvé: ${sender?.username} (ID: ${senderId})`);
        
        return {
          ...mapFriendshipToApi(friendship),
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

  static async getSentFriendRequests(userId: number): Promise<Friendship[]> {
    const sentRequests = await GetMany<FriendshipDB>(
      friendships,
      and(eq(friendships.user_id, userId), eq(friendships.status, 'pending'))!
    );

    const requestsWithDetails = await Promise.all(
      sentRequests.map(async (friendship) => {
        const recipientId = friendship.friend_id;
        const recipient = await Get<typeof users.$inferSelect>(users, eq(users.id, recipientId));
        
        return {
          ...mapFriendshipToApi(friendship),
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

  static async updateFriendshipStatus(
    friendshipId: number, 
    userId: number, 
    status: 'blocked' | 'pending' | 'accepted'
  ): Promise<Friendship> {
    // ✅ Validation Zod
    updateStatusSchema.parse({ friendshipId, userId, status });
    
    const friendship = await Get<FriendshipDB>(friendships, eq(friendships.id, friendshipId));

    if (!friendship) {
      throw new Error("Friendship not found");
    }

    if (friendship.user_id !== userId && friendship.friend_id !== userId) {
      throw new Error("Unauthorized to modify this friendship");
    }

    const updatedFriendship = await Update<FriendshipDB>(
      friendships, 
      eq(friendships.id, friendshipId), 
      { status, updated_at: new Date() }
    );
      return mapFriendshipToApi(updatedFriendship);
  }

  // ✅ Méthodes avec validation
  static async sendFriendRequestWithValidation(friendId: number, userId: number): Promise<Friendship> {
    if (!friendId) {
      throw new Error('Friend ID is required');
    }
    const data: CreateFriendshipData = { friendId };
    return await this.sendFriendRequest(data, userId);
  }

  static async acceptFriendRequestWithValidation(friendshipId: number, userId: number): Promise<Friendship> {
    if (!friendshipId || isNaN(friendshipId)) {
      throw new Error('Invalid friendship ID');
    }
    return await this.acceptFriendRequest(friendshipId, userId);
  }

  static async blockFriendWithValidation(friendshipId: number, userId: number): Promise<Friendship> {
    if (!friendshipId || isNaN(friendshipId)) {
      throw new Error('Invalid friendship ID');
    }
    return await this.updateFriendshipStatus(friendshipId, userId, 'blocked');
  }

  static async getSentFriendRequestsFormatted(userId: number): Promise<Friendship[]> {
    return await this.getSentFriendRequests(userId);
  }

  static async getPendingFriendRequestsFormatted(userId: number): Promise<Friendship[]> {
    return await this.getPendingFriendRequests(userId);
  }
}
