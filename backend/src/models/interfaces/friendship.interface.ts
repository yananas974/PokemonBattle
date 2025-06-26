export interface FriendshipDB {
  id: number;
  user_id: number;
  friend_id: number;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: Date;
  updated_at: Date;
}

export interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  updatedAt: string;

  friend?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface CreateFriendshipData {
  friendId: number;
}

export interface FriendshipsResponse {
  message: string;
  friendships: Friendship[];
}

export interface CreateFriendshipResponse {
  message: string;
  friendship: Friendship;
} 