import type { CreateFriendshipData, FriendshipDB, Friendship } from '@pokemon-battle/shared';

export const mapUpdateFriendshipToDb = (status: string): any => ({
  status,
  updated_at: new Date().toISOString()
});

export const mapCreateFriendshipToDb = (data: CreateFriendshipData): any => ({
  userId: data.userId,
  friendId: data.friendId,
  status: data.status
});

export const mapFriendshipToApi = (friendshipDB: any): Friendship => ({
  id: friendshipDB.id,
  userId: friendshipDB.userId || friendshipDB.user_id,
  friendId: friendshipDB.friendId || friendshipDB.friend_id,
  status: friendshipDB.status,
  createdAt: friendshipDB.createdAt || friendshipDB.created_at || new Date().toISOString(),
  updatedAt: friendshipDB.updatedAt || friendshipDB.updated_at || new Date().toISOString()
});

export const mapFriendshipsToApi = (friendshipsDB: any[]): Friendship[] => 
  friendshipsDB.map(mapFriendshipToApi); 