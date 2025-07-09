import { Get, GetMany, Delete } from "../../db/crud/crud.js";
import { friendships, users } from "../../db/schema.js";
import { eq, and, or } from "drizzle-orm";
import type { 
  FriendshipDB, 
  Friendship
} from '@pokemon-battle/shared';
import { ValidationService } from '@pokemon-battle/shared';
import { mapFriendshipToApi } from "../../mapper/friendship.mapper.js";

export class FriendsListService {

  static async getUserFriends(userId: number): Promise<Friendship[]> {
    console.log(`👥 Récupération amis pour userId=${userId}`);
    
    // ✅ Validation centralisée
    ValidationService.validateUserId(userId);
    
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
        // ✅ Déterminer qui est l'ami pour chaque relation
        const friendId = (friendship as any).user_id === userId ? (friendship as any).friend_id : (friendship as any).user_id;
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
    // ✅ Validation centralisée
    ValidationService.validateFriendshipAction({ friendshipId, userId });
    
    const friendship = await Get<FriendshipDB>(friendships, eq(friendships.id, friendshipId));

    if (!friendship) {
      throw new Error("Friendship not found");
    }

    if ((friendship as any).user_id !== userId && (friendship as any).friend_id !== userId) {
      throw new Error("Unauthorized to delete this friendship");
    }

    await Delete(friendships, eq(friendships.id, friendshipId));
  }

  static async searchUsers(query: string, currentUserId: number): Promise<any[]> {
    // ✅ Validation centralisée
    ValidationService.validateSearchUsers({ query, currentUserId });
    
    const allUsers = await GetMany<typeof users.$inferSelect>(users, eq(users.id, users.id));
    const availableUsers = allUsers.filter(u => u.id !== currentUserId);
    
    const usersWithoutPasswords = availableUsers.map(user => {
      return user;
    });
    
    return usersWithoutPasswords;
  }

  static async getAvailableUsers(currentUserId: number): Promise<any[]> {
    // ✅ Validation centralisée
    ValidationService.validateUserId(currentUserId);
    
    const { getAllUsers } = await import('../authService/userService.js');
    const allUsers = await getAllUsers();
    const availableUsers = allUsers.filter(u => u.id !== currentUserId);
    
    const usersWithoutPasswords = availableUsers.map(user => {
      return user;
    });
    
    return usersWithoutPasswords;
  }

  static async removeFriendWithValidation(friendshipId: number, userId: number): Promise<void> {
    await this.removeFriend(friendshipId, userId);
  }
}
