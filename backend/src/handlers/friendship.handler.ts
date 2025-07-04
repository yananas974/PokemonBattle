import type { Context } from 'hono';
import { FriendshipService } from '../services/services.js';
import { 
  sendFriendRequestSchema,
  acceptFriendRequestSchema,
  blockFriendRequestSchema,
  getUserFriendsSchema
} from '../schemas/index.js';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { asyncHandler, authAsyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError, NotFoundError, ConflictError } from '../models/errors.js';

// ✅ Créer les validators
export const sendFriendRequestValidator = zValidator('json', sendFriendRequestSchema);
export const acceptFriendRequestValidator = zValidator('param', z.object({ id: z.string() }));
export const blockFriendRequestValidator = zValidator('param', z.object({ id: z.string() }));

// ✅ Handlers refactorisés sans try/catch
export const sendFriendRequestHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  const { friendId } = await c.req.json();

  if (friendId === user.id) {
    throw new ValidationError('Vous ne pouvez pas vous envoyer une demande d\'ami à vous-même');
  }

  const friendship = await FriendshipService.sendFriendRequest({ friendId }, user.id);

  return c.json({
    success: true,
    message: 'Friend request sent successfully',
    friendship
  });
});

export const acceptFriendRequestHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  const friendshipId = parseInt(c.req.param('id'));

  if (isNaN(friendshipId)) {
    throw new ValidationError('ID de demande d\'ami invalide');
  }

  const friendship = await FriendshipService.acceptFriendRequest(friendshipId, user.id);

  return c.json({
    success: true,
    message: 'Friend request accepted successfully',
    friendship
  });
});

export const blockFriendRequestHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  const friendshipId = parseInt(c.req.param('id'));

  if (isNaN(friendshipId)) {
    throw new ValidationError('ID de demande d\'ami invalide');
  }

  const friendship = await FriendshipService.updateFriendshipStatus(friendshipId, user.id, 'blocked');

  return c.json({
    success: true,
    message: 'Friend blocked successfully',
    friendship
  });
});

export const getUserFriendsHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  console.log(`👥 Récupération amis pour user ${user.id}`);
  
  const friends = await FriendshipService.getUserFriends(user.id);
  console.log(`✅ ${friends.length} amis trouvés`);
  
  return c.json({
    success: true,
    message: 'Friends retrieved successfully',
    friends
  });
});

export const getPendingFriendRequestsHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  console.log(`📥 Récupération demandes reçues pour user ${user.id}`);
  
  const requests = await FriendshipService.getPendingFriendRequests(user.id);
  console.log(`✅ ${requests.length} demandes trouvées`);
  
  return c.json({
    success: true,
    message: 'Pending friend requests retrieved successfully',
    friends: requests
  });
});

export const getSentFriendRequestsHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  
  const requests = await FriendshipService.getSentFriendRequests(user.id);
  
  return c.json({
    success: true,
    message: 'Sent friend requests retrieved successfully',
    requests
  });
});

export const removeFriendHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  const friendshipId = parseInt(c.req.param('id'));
  
  if (isNaN(friendshipId)) {
    throw new ValidationError('ID d\'amitié invalide');
  }
  
  await FriendshipService.removeFriend(friendshipId, user.id);
  
  return c.json({
    success: true,
    message: 'Friend removed successfully'
  });
});

export const getAvailableUsersHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  
  const usersWithoutPasswords = await FriendshipService.getAvailableUsers(user.id);
  
  return c.json({
    success: true,
    message: 'Available users retrieved successfully',
    users: usersWithoutPasswords
  });
});

export const getFriendTeamsHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  const friendId = parseInt(c.req.param('friendId'));

  if (isNaN(friendId)) {
    throw new ValidationError('ID d\'ami invalide');
  }

  const teams = await FriendshipService.getFriendTeamsWithValidation(friendId, user.id);

  return c.json({
    success: true,
    message: 'Friend teams retrieved successfully',
    teams
  });
});