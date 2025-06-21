import { Get, GetMany, Delete } from "../../db/crud/crud.js";
import { friendships, users } from "../../db/schema.js";
import { eq, and, or } from "drizzle-orm";
import type { 
  FriendshipDB, 
  Friendship
} from "../../models/interfaces/interfaces.js";
import { mapFriendshipToApi } from "../../mapper/friendship.mapper.js";
import { z } from "zod";

// ✅ Schémas Zod
const searchUsersSchema = z.object({
  query: z.string().min(0).max(100),
  currentUserId: z.number().min(1)
});

const removeFriendSchema = z.object({
  friendshipId: z.number().min(1, "Friendship ID must be positive"),
  userId: z.number().min(1, "User ID must be positive")
});

export class FriendsListService {

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

    const friendsWithDetails = await Promise.all(
      userFriendships.map(async (friendship) => {
        const friendId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
        const friend = await Get<typeof users.$inferSelect>(users, eq(users.id, friendId));
        
        console.log(`👤 Ami trouvé: ${friend?.username} (ID: ${friendId})`);
        
        return {
          ...mapFriendshipToApi(friendship),
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

  static async removeFriend(friendshipId: number, userId: number): Promise<void> {
    const friendship = await Get<FriendshipDB>(friendships, eq(friendships.id, friendshipId));

    if (!friendship) {
      throw new Error("Friendship not found");
    }

    if (friendship.user_id !== userId && friendship.friend_id !== userId) {
      throw new Error("Unauthorized to delete this friendship");
    }

    await Delete(friendships, eq(friendships.id, friendshipId));
  }

  static async searchUsers(query: string, currentUserId: number): Promise<any[]> {
    // ✅ Validation Zod
    searchUsersSchema.parse({ query, currentUserId });
    
    const allUsers = await GetMany<typeof users.$inferSelect>(users, eq(users.id, users.id));
    const availableUsers = allUsers.filter(u => u.id !== currentUserId);
    
    const usersWithoutPasswords = availableUsers.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return usersWithoutPasswords;
  }

  static async getAvailableUsers(currentUserId: number): Promise<any[]> {
    const { getAllUsers } = await import('../authService/userService.js');
    const allUsers = await getAllUsers();
    const availableUsers = allUsers.filter(u => u.id !== currentUserId);
    
    const usersWithoutPasswords = availableUsers.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return usersWithoutPasswords;
  }

  static async removeFriendWithValidation(friendshipId: number, userId: number): Promise<void> {
    // ✅ Validation Zod
    removeFriendSchema.parse({ friendshipId, userId });
    
    if (!friendshipId || isNaN(friendshipId)) {
      throw new Error('Invalid friendship ID');
    }

    await this.removeFriend(friendshipId, userId);
  }
}
