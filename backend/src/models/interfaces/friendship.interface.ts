// ✅ INTERFACE DB (format base de données)
export interface FriendshipDB {
  id: number;
  user_id: number;
  friend_id: number;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: Date;
  updated_at: Date;
}

// ✅ INTERFACE API (format frontend)
export interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  updatedAt: string;
  // Informations de l'ami (jointure)
  friend?: {
    id: number;
    username: string;
    email: string;
  };
}

// ✅ INTERFACES POUR LES REQUÊTES
export interface CreateFriendshipData {
  friendId: number;
}

export interface UpdateFriendshipData {
  status: 'pending' | 'accepted' | 'blocked';
}

// ✅ INTERFACES POUR LES RÉPONSES
export interface FriendshipsResponse {
  message: string;
  friendships: Friendship[];
}

export interface CreateFriendshipResponse {
  message: string;
  friendship: Friendship;
} 