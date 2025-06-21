import { FriendRequestService } from './friendRequestService.js';
import { FriendsListService } from './friendsListService.js';
import { FriendTeamsService } from './friendTeamsService.js';

// ✅ Service principal qui agrège les sous-services
export class FriendshipService {
  // ✅ Délégation vers les sous-services
  static sendFriendRequest = FriendRequestService.sendFriendRequest;
  static acceptFriendRequest = FriendRequestService.acceptFriendRequest;
  static getPendingFriendRequests = FriendRequestService.getPendingFriendRequests;
  static getSentFriendRequests = FriendRequestService.getSentFriendRequests;
  static updateFriendshipStatus = FriendRequestService.updateFriendshipStatus;
  
  // ✅ Ajouter les fonctions formatées manquantes
  static getPendingFriendRequestsFormatted = FriendRequestService.getPendingFriendRequestsFormatted;
  static getSentFriendRequestsFormatted = FriendRequestService.getSentFriendRequestsFormatted;
  
  static getUserFriends = FriendsListService.getUserFriends;
  static removeFriend = FriendsListService.removeFriend;
  static searchUsers = FriendsListService.searchUsers;
  static getAvailableUsers = FriendsListService.getAvailableUsers;
  
  static getFriendTeams = FriendTeamsService.getFriendTeams;
  static getFriendTeamsWithValidation = FriendTeamsService.getFriendTeamsWithValidation;
}

// ✅ Exports de rétrocompatibilité
export const sendFriendRequest = FriendshipService.sendFriendRequest;
export const acceptFriendRequest = FriendshipService.acceptFriendRequest;
export const updateFriendshipStatus = FriendshipService.updateFriendshipStatus;
export const getUserFriends = FriendshipService.getUserFriends;
export const getPendingFriendRequests = FriendshipService.getPendingFriendRequests;
export const getSentFriendRequests = FriendshipService.getSentFriendRequests;
// ✅ Ajouter les exports formatés
export const getPendingFriendRequestsFormatted = FriendshipService.getPendingFriendRequestsFormatted;
export const getSentFriendRequestsFormatted = FriendshipService.getSentFriendRequestsFormatted;
export const removeFriend = FriendshipService.removeFriend;
export const searchUsers = FriendshipService.searchUsers; 