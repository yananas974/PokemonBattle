import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from '@remix-run/react';

// Types
interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
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

interface FriendsState {
  activeTab: 'friends' | 'pending' | 'sent' | 'search';
  searchQuery: string;
  filteredUsers: User[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

type FriendsAction =
  | { type: 'SET_ACTIVE_TAB'; payload: 'friends' | 'pending' | 'sent' | 'search' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERED_USERS'; payload: User[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS_MESSAGE'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' };

const initialState: FriendsState = {
  activeTab: 'friends',
  searchQuery: '',
  filteredUsers: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

function friendsReducer(state: FriendsState, action: FriendsAction): FriendsState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTERED_USERS':
      return { ...state, filteredUsers: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, successMessage: null };
    case 'SET_SUCCESS_MESSAGE':
      return { ...state, successMessage: action.payload, error: null };
    case 'CLEAR_MESSAGES':
      return { ...state, error: null, successMessage: null };
    default:
      return state;
  }
}

interface UseFriendsParams {
  user: User;
  friends: Friendship[];
  pendingRequests: Friendship[];
  sentRequests: Friendship[];
  availableUsers: User[];
  isSubmitting: boolean;
  actionData?: {
    success: boolean;
    message?: string;
    error?: string;
  };
}

export function useFriends({
  user,
  friends,
  pendingRequests,
  sentRequests,
  availableUsers,
  isSubmitting,
  actionData,
}: UseFriendsParams) {
  const [state, dispatch] = useReducer(friendsReducer, initialState);
  const [searchParams] = useSearchParams();

  // Set loading state based on navigation
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isSubmitting });
  }, [isSubmitting]);

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['friends', 'pending', 'sent', 'search'].includes(tabParam)) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tabParam as any });
    }
  }, [searchParams]);

  // Handle success messages from URL
  useEffect(() => {
    const successParam = searchParams.get('success');
    if (successParam) {
      const messages = {
        'request-sent': '✅ Demande d\'ami envoyée avec succès !',
        'request-accepted': '✅ Demande d\'ami acceptée !',
        'user-blocked': '🚫 Utilisateur bloqué !',
        'friend-removed': '🗑️ Ami supprimé !'
      };
      const message = messages[successParam as keyof typeof messages];
      if (message) {
        dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: message });
      }
    }
  }, [searchParams]);

  // Handle action data messages
  useEffect(() => {
    if (actionData) {
      if (actionData.success && actionData.message) {
        dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: actionData.message });
      } else if (actionData.error) {
        dispatch({ type: 'SET_ERROR', payload: actionData.error });
      }
    }
  }, [actionData]);

  // Filter available users based on search query
  useEffect(() => {
    if (!availableUsers || !Array.isArray(availableUsers)) {
      dispatch({ type: 'SET_FILTERED_USERS', payload: [] });
      return;
    }

    const filtered = availableUsers.filter(u => {
      // Exclude self
      if (u.id === user.id) return false;
      
      // Filter by search query
      if (state.searchQuery && !u.username.toLowerCase().includes(state.searchQuery.toLowerCase())) {
        return false;
      }
      
      // Exclude existing friends
      if (friends?.some(f => f.friend?.id === u.id)) return false;
      
      // Exclude pending requests
      if (pendingRequests?.some(p => p.userId === u.id)) return false;
      
      // Exclude sent requests
      if (sentRequests?.some(s => s.friend?.id === u.id)) return false;
      
      return true;
    });
    
    dispatch({ type: 'SET_FILTERED_USERS', payload: filtered });
  }, [state.searchQuery, availableUsers, user.id, friends, pendingRequests, sentRequests]);

  // Actions
  const setActiveTab = useCallback((tab: 'friends' | 'pending' | 'sent' | 'search') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  // Memoized statistics
  const statistics = useMemo(() => ({
    friendsCount: friends?.length || 0,
    pendingCount: pendingRequests?.length || 0,
    sentCount: sentRequests?.length || 0,
    availableCount: availableUsers?.length || 0,
  }), [friends, pendingRequests, sentRequests, availableUsers]);

  // Memoized tabs configuration
  const tabs = useMemo(() => [
    { 
      key: 'friends' as const, 
      label: `Amis (${statistics.friendsCount})`, 
      icon: '👥', 
      color: 'from-blue-500 to-cyan-600' 
    },
    { 
      key: 'pending' as const, 
      label: `Reçues (${statistics.pendingCount})`, 
      icon: '📥', 
      color: 'from-green-500 to-emerald-600' 
    },
    { 
      key: 'sent' as const, 
      label: `Envoyées (${statistics.sentCount})`, 
      icon: '📤', 
      color: 'from-orange-500 to-red-600' 
    },
    { 
      key: 'search' as const, 
      label: 'Rechercher', 
      icon: '🔍', 
      color: 'from-purple-500 to-pink-600' 
    }
  ], [statistics]);

  // Helper function to get user from request
  const getUserFromRequest = useCallback((request: Friendship, isReceived: boolean = false) => {
    if (isReceived) {
      // For received requests, find the sender in availableUsers
      return availableUsers?.find(u => u.id === request.userId) || {
        id: request.userId,
        username: `User ${request.userId}`,
        email: 'unknown@example.com'
      } as User;
    }
    // For sent requests, use the friend data
    return request.friend;
  }, [availableUsers]);

  return {
    // State
    activeTab: state.activeTab,
    searchQuery: state.searchQuery,
    filteredUsers: state.filteredUsers,
    isLoading: state.isLoading,
    error: state.error,
    successMessage: state.successMessage,
    
    // Data
    statistics,
    tabs,
    
    // Actions
    setActiveTab,
    setSearchQuery,
    clearMessages,
    
    // Helpers
    getUserFromRequest,
    
    // Computed values
    hasMessage: !!(state.error || state.successMessage),
    shouldShowSearchResults: state.searchQuery.length > 0,
    hasSearchResults: state.filteredUsers.length > 0,
  };
} 