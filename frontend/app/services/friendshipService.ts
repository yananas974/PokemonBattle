import { apiCallWithRequest, apiCall, handleApiError } from '~/utils/api';

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
  success: boolean;
  message: string;
  data: {
    friends: Friendship[];
  };
}

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
  };
}

// ✅ HELPER DRY POUR LES APPELS API côté serveur (loaders)
async function makeApiCallServer<T>(
  endpoint: string, 
  request: Request,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiCallWithRequest(endpoint, request, options);
  await handleApiError(response);
  return response.json();
}

// ✅ HELPER DRY POUR LES APPELS API côté client (actions)
async function makeApiCall<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  token?: string
): Promise<T> {
  const response = await apiCall(endpoint, options, token);
  await handleApiError(response);
  return response.json();
}

export const friendshipService = {
  // ✅ Envoyer une demande d'ami
  async sendFriendRequest(data: SendFriendRequestData, requestOrToken?: Request | string): Promise<FriendshipResponse> {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer('/api/friends/send', requestOrToken, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } else {
      return makeApiCall('/api/friends/send', {
        method: 'POST',
        body: JSON.stringify(data),
      }, requestOrToken);
    }
  },

  // ✅ Accepter une demande d'ami
  async acceptFriendRequest(friendshipId: number, requestOrToken?: Request | string): Promise<FriendshipResponse> {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer(`/api/friends/accept/${friendshipId}`, requestOrToken, {
        method: 'POST',
      });
    } else {
      return makeApiCall(`/api/friends/accept/${friendshipId}`, {
        method: 'POST',
      }, requestOrToken);
    }
  },

  // ✅ Bloquer un ami
  async blockFriend(friendshipId: number, requestOrToken?: Request | string): Promise<FriendshipResponse> {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer(`/api/friends/block/${friendshipId}`, requestOrToken, {
        method: 'POST',
      });
    } else {
      return makeApiCall(`/api/friends/block/${friendshipId}`, {
        method: 'POST',
      }, requestOrToken);
    }
  },

  // ✅ Récupérer tous les amis
  async getFriends(requestOrToken?: Request | string): Promise<FriendsResponse> {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer('/api/friends', requestOrToken);
    } else {
      return makeApiCall('/api/friends', {}, requestOrToken);
    }
  },

  // ✅ Récupérer les demandes reçues
  async getPendingRequests(requestOrToken?: Request | string): Promise<FriendsResponse> {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer('/api/friends/requests/received', requestOrToken);
    } else {
      return makeApiCall('/api/friends/requests/received', {}, requestOrToken);
    }
  },

  // ✅ Récupérer les demandes envoyées
  async getSentRequests(requestOrToken?: Request | string): Promise<FriendsResponse> {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer('/api/friends/requests/sent', requestOrToken);
    } else {
      return makeApiCall('/api/friends/requests/sent', {}, requestOrToken);
    }
  },

  // ✅ Supprimer un ami
  async removeFriend(friendshipId: number, requestOrToken?: Request | string): Promise<{ message: string }> {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer(`/api/friends/${friendshipId}`, requestOrToken, {
        method: 'DELETE',
      });
    } else {
      return makeApiCall(`/api/friends/${friendshipId}`, {
        method: 'DELETE',
      }, requestOrToken);
    }
  },

  // ✅ Rechercher des utilisateurs
  async searchUsers(query: string = '', requestOrToken?: Request | string): Promise<UsersResponse> {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer('/api/friends/available-users', requestOrToken);
    } else {
      return makeApiCall('/api/friends/available-users', {}, requestOrToken);
    }
  },

  // ✅ Récupérer les équipes d'un ami
  async getFriendTeams(friendId: number, requestOrToken?: Request | string): Promise<{ success: boolean; message: string; data: any[] }> {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer(`/api/friends/teams/${friendId}`, requestOrToken);
    } else {
      return makeApiCall(`/api/friends/teams/${friendId}`, {}, requestOrToken);
    }
  },
}; 