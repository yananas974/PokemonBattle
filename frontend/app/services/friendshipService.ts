import { apiWithAuth, apiWithToken } from '~/utils/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  updatedAt: string;
  friend?: User;
}

interface SendFriendRequestData {
  friendId: number;
}

interface FriendshipResponse {
  message: string;
  friendship: Friendship;
}

interface FriendsResponse {
  message: string;
  friends: Friendship[];
}

interface UsersResponse {
  message: string;
  users: User[];
}

// ✅ Helper DRY pour les appels API
async function makeApiCall<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`http://backend:3001${endpoint}`, { 
    ...options, 
    headers,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const friendshipService = {
  // ✅ Envoyer une demande d'ami
  async sendFriendRequest(data: SendFriendRequestData, token?: string): Promise<FriendshipResponse> {
    return makeApiCall('/api/friends/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  // ✅ Accepter une demande d'ami
  async acceptFriendRequest(friendshipId: number, token?: string): Promise<FriendshipResponse> {
    return makeApiCall(`/api/friends/accept/${friendshipId}`, {
      method: 'POST',
    }, token);
  },

  // ✅ Bloquer un ami
  async blockFriend(friendshipId: number, token?: string): Promise<FriendshipResponse> {
    return makeApiCall(`/api/friends/block/${friendshipId}`, {
      method: 'POST',
    }, token);
  },

  // ✅ Récupérer tous les amis
  async getFriends(token?: string): Promise<FriendsResponse> {
    return makeApiCall('/api/friends/friends', {}, token);
  },

  // ✅ Récupérer les demandes reçues
  async getPendingRequests(token?: string): Promise<FriendsResponse> {
    return makeApiCall('/api/friends/requests/received', {}, token);
  },

  // ✅ Récupérer les demandes envoyées
  async getSentRequests(token?: string): Promise<FriendsResponse> {
    return makeApiCall('/api/friends/requests/sent', {}, token);
  },

  // ✅ Supprimer un ami
  async removeFriend(friendshipId: number, token?: string): Promise<{ message: string }> {
    return makeApiCall(`/api/friends/${friendshipId}`, {
      method: 'DELETE',
    }, token);
  },

  // ✅ Rechercher des utilisateurs
  async searchUsers(query: string = '', token?: string): Promise<UsersResponse> {
    return makeApiCall('/api/friends/available-users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, token);
  },

  // ✅ Récupérer les équipes d'un ami
  async getFriendTeams(friendId: number, token?: string): Promise<{ message: string; teams: any[] }> {
    return makeApiCall(`/api/friends/teams/${friendId}`, {}, token);
  },
}; 