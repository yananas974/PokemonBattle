import type { Context } from 'hono';
import { FriendshipService } from '../services/services.js';
import type { CreateFriendshipData } from '../models/interfaces/interfaces.js';
import { getAllUsers } from '../services/services.js';


export const sendFriendRequestHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    const { friendId } = await c.req.json();

    // ✅ Déléguer TOUTE la logique au service
    const friendship = await FriendshipService.sendFriendRequestWithValidation(friendId, user.id);

    return c.json({
      message: 'Friend request sent successfully',
      friendship
    });

  } catch (error: any) {
    console.error('Error in sendFriendRequest:', error);
    return c.json({ 
      error: error.message || 'Failed to send friend request' 
    }, 500);
  }
};

export const acceptFriendRequestHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    const friendshipId = parseInt(c.req.param('id'));

    // ✅ Déléguer TOUTE la logique au service
    const friendship = await FriendshipService.acceptFriendRequestWithValidation(friendshipId, user.id);

    return c.json({
      message: 'Friend request accepted successfully',
      friendship
    });

  } catch (error: any) {
    console.error('Error in acceptFriendRequest:', error);
    return c.json({ 
      error: error.message || 'Failed to accept friend request' 
    }, 500);
  }
};

export const blockFriendRequestHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    const friendshipId = parseInt(c.req.param('id'));

    // ✅ Déléguer TOUTE la logique au service
    const friendship = await FriendshipService.blockFriendWithValidation(friendshipId, user.id);

    return c.json({
      message: 'Friend blocked successfully',
      friendship
    });

  } catch (error: any) {
    console.error('Error in blockFriend:', error);
    return c.json({ 
      error: error.message || 'Failed to block friend' 
    }, 500);
  }
};

export const getUserFriendsHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    console.log(`👥 Récupération amis pour user ${user.id}`);
    
    // ✅ Déléguer TOUTE la logique au service
    const friends = await FriendshipService.getUserFriends(user.id);
    console.log(`✅ ${friends.length} amis trouvés`);
    
    return c.json({
      message: 'Friends retrieved successfully',
      friends
    });

  } catch (error: any) {
    console.error('Error in getUserFriends:', error);
    return c.json({ 
      error: 'Failed to retrieve friends' 
    }, 500);
  }
};

export const getPendingFriendRequestsHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    console.log(`📥 Récupération demandes reçues pour user ${user.id}`);
    
    // ✅ Déléguer TOUTE la logique au service
    const requests = await FriendshipService.getPendingFriendRequestsFormatted(user.id);
    console.log(`✅ ${requests.length} demandes trouvées`);
    
    return c.json({
      message: 'Pending friend requests retrieved successfully',
      friends: requests // ✅ Retourner 'friends' pour correspondre au frontend
    });

  } catch (error: any) {
    console.error('Error in getPendingFriendRequests:', error);
    return c.json({ 
      error: 'Failed to retrieve friend requests' 
    }, 500);
  }
};

export const getSentFriendRequestsHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    
    // ✅ Déléguer TOUTE la logique au service
    const requests = await FriendshipService.getSentFriendRequestsFormatted(user.id);
    
    return c.json({
      message: 'Sent friend requests retrieved successfully',
      requests
    });

  } catch (error: any) {
    console.error('Error in getSentFriendRequests:', error);
    return c.json({ 
      error: 'Failed to retrieve sent requests' 
    }, 500);
  }
};

export const removeFriendHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    const friendshipId = parseInt(c.req.param('id'));
    
    // ✅ Déléguer TOUTE la logique au service
    await FriendshipService.removeFriendWithValidation(friendshipId, user.id);
    
    return c.json({
      message: 'Friend removed successfully'
    });

  } catch (error: any) {
    console.error('Error in removeFriend:', error);
    return c.json({ 
      error: error.message || 'Failed to remove friend' 
    }, 500);
  }
};

export const getAvailableUsersHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    
    // ✅ Déléguer TOUTE la logique au service
    const usersWithoutPasswords = await FriendshipService.getAvailableUsers(user.id);
    
    return c.json({
      message: 'Available users retrieved successfully',
      users: usersWithoutPasswords
    });

  } catch (error: any) {
    console.error('Error in getAvailableUsers:', error);
    return c.json({ 
      error: 'Failed to retrieve available users' 
    }, 500);
  }
};

export const getFriendTeamsHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    const friendId = parseInt(c.req.param('friendId'));

    // ✅ Déléguer TOUTE la logique au service
    const teams = await FriendshipService.getFriendTeamsWithValidation(friendId, user.id);

    return c.json({
      message: 'Friend teams retrieved successfully',
      teams
    });

  } catch (error: any) {
    console.error('Error in getFriendTeams:', error);
    return c.json({ 
      error: error.message || 'Failed to retrieve friend teams' 
    }, 500);
  }
};