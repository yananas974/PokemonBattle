import { FriendshipStatus, FriendshipStatusType } from '../enums';

// ✅ INTERFACE DE BASE POUR L'AMITIÉ
export interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: FriendshipStatusType;
  createdAt: string;
  updatedAt: string;
}

// ✅ DONNÉES DE CRÉATION D'AMITIÉ
export interface CreateFriendshipData {
  userId: number;
  friendId: number;
  status: FriendshipStatusType;
}

// ✅ AMITIÉ EN BASE DE DONNÉES (avec timestamps)
export interface FriendshipDB extends Friendship {
  created_at: string;
  updated_at: string;
}

// ✅ AMITIÉ AVEC DÉTAILS UTILISATEUR
export interface FriendshipWithUser extends Friendship {
  friend: {
    id: number;
    username: string;
    email: string;
  };
}

// ✅ REQUÊTE D'ENVOI D'AMITIÉ
export interface SendFriendRequestRequest {
  friendId: number;
}

// ✅ REQUÊTE D'ACCEPTATION D'AMITIÉ
export interface AcceptFriendRequestRequest {
  id: number;
}

// ✅ REQUÊTE DE BLOCAGE D'AMITIÉ
export interface BlockFriendRequestRequest {
  id: number;
}

// ✅ RÉPONSE D'AMITIÉ
export interface FriendshipResponse {
  success: boolean;
  friendship?: Friendship;
  message?: string;
  error?: string;
}

// ✅ RÉPONSE LISTE D'AMIS
export interface FriendsListResponse {
  success: boolean;
  friends: FriendshipWithUser[];
  totalCount?: number;
  message?: string;
  error?: string;
}

// ✅ UTILISATEUR DISPONIBLE POUR AMITIÉ
export interface AvailableUser {
  id: number;
  username: string;
  email: string;
  isFriend: boolean;
  hasPendingRequest: boolean;
  hasSentRequest: boolean;
}

// ✅ RÉPONSE UTILISATEURS DISPONIBLES
export interface AvailableUsersResponse {
  success: boolean;
  users: AvailableUser[];
  message?: string;
  error?: string;
}

// ✅ ÉQUIPE D'AMI
export interface FriendTeam {
  id: number;
  teamName: string;
  pokemon: Array<{
    id: number;
    name: string;
    type: string;
    level: number;
    sprite_url: string;
  }>;
  createdAt: string;
}

// ✅ RÉPONSE ÉQUIPES D'AMI
export interface FriendTeamsResponse {
  success: boolean;
  teams: FriendTeam[];
  friend: {
    id: number;
    username: string;
  };
  message?: string;
  error?: string;
}

// ✅ STATISTIQUES D'AMITIÉ
export interface FriendshipStats {
  totalFriends: number;
  pendingRequests: number;
  sentRequests: number;
  blockedUsers: number;
  recentActivity: Array<{
    type: 'request_sent' | 'request_received' | 'request_accepted' | 'friend_removed';
    friendUsername: string;
    timestamp: string;
  }>;
}

// ✅ CONTEXTE AUTHENTIFIÉ POUR LES AMITIÉS
export interface AuthenticatedContext {
  user: {
    id: number;
    email: string;
    username: string;
  };
}

// ✅ TYPES POUR LES HANDLERS D'AMITIÉ
export type FriendshipHandler = {
  [key: string]: (c: any) => Promise<Response>;
};

// ✅ TYPES POUR LES VALIDATEURS D'AMITIÉ
export type FriendshipValidator = {
  [key: string]: (data: any) => any;
}; 