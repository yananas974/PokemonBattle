import type { CreateFriendshipData, FriendshipDB, Friendship } from "../models/interfaces/interfaces.js";

export const mapCreateFriendshipToDb = (data: CreateFriendshipData, userId: number): Omit<FriendshipDB, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: userId,
  friend_id: data.friendId,
  status: 'pending'
});

// ✅ Mapper UPDATE : API → DB
export const mapUpdateFriendshipToDb = (status: 'pending' | 'accepted' | 'blocked'): Partial<FriendshipDB> => ({
  status,
  updated_at: new Date()
});

// ✅ Mapper READ : DB → API
export const mapFriendshipToApi = (friendshipDB: FriendshipDB): Friendship => ({
  id: friendshipDB.id,
  userId: friendshipDB.user_id,
  friendId: friendshipDB.friend_id,
  status: friendshipDB.status,
  createdAt: friendshipDB.created_at.toISOString(),
  updatedAt: friendshipDB.updated_at.toISOString()
});

// ✅ Mapper READ Multiple : DB[] → API[]
export const mapFriendshipsToApi = (friendshipsDB: FriendshipDB[]): Friendship[] => 
  friendshipsDB.map(mapFriendshipToApi); 