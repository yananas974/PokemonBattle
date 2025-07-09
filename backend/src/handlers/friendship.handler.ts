import type { Context } from 'hono';
import { FriendshipService } from '../services/services.js';
import { sendFriendRequestSchema } from '../schemas/index.js';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authAsyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError } from '../models/errors.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { FRIENDSHIP_MESSAGES } from '../constants/message.js';
import { validateId } from '../utils/validators.js';

// Types
interface FriendshipHandler {
  [key: string]: (c: Context) => Promise<Response>;
}

interface AuthenticatedContext extends Context {
  user: { id: number };
}

// Helpers
const withUser = <T>(handler: (c: AuthenticatedContext, userId: number) => Promise<T>) => {
  return authAsyncHandler(async (c: Context) => {
    const user = c.get('user');
    return handler(c as AuthenticatedContext, user.id);
  });
};

const withIdParam = async (
  c: AuthenticatedContext, 
  userId: number,
  paramName: string,
  serviceCall: (id: number, userId: number) => Promise<any>,
  message: string
) => {
  const id = validateId(c.req.param(paramName), `ID ${paramName}`);
  const result = await serviceCall(id, userId);
  return c.json(formatResponse(message, result));
};

// Validators groupés
export const friendshipValidators = {
  sendRequest: zValidator('json', sendFriendRequestSchema),
  acceptRequest: zValidator('param', z.object({ id: z.string() })),
  blockRequest: zValidator('param', z.object({ id: z.string() }))
};

// Handlers regroupés
export const friendshipHandlers: FriendshipHandler = {
  sendRequest: withUser(async (c, userId) => {
    const { friendId } = await c.req.json();
    if (friendId === userId) {
      throw new ValidationError('Vous ne pouvez pas vous envoyer une demande d\'ami à vous-même');
    }
    const friendship = await FriendshipService.sendFriendRequest({ friendId }, userId);
    return c.json(formatResponse(FRIENDSHIP_MESSAGES.SENT, { friendship }));
  }),

  acceptRequest: withUser(async (c, userId) => 
    withIdParam(c, userId, 'id', FriendshipService.acceptFriendRequest, FRIENDSHIP_MESSAGES.ACCEPTED)
  ),

  blockRequest: withUser(async (c, userId) => 
    withIdParam(c, userId, 'id', 
      (id, uId) => FriendshipService.updateFriendshipStatus(id, uId, 'blocked'),
      FRIENDSHIP_MESSAGES.BLOCKED
    )
  ),

  getFriends: withUser(async (c, userId) => {
    const friends = await FriendshipService.getUserFriends(userId);
    return c.json(formatResponse(FRIENDSHIP_MESSAGES.RETRIEVED, { friends }));
  }),

  getPendingRequests: withUser(async (c, userId) => {
    const requests = await FriendshipService.getPendingFriendRequests(userId);
    return c.json(formatResponse(FRIENDSHIP_MESSAGES.PENDING_RETRIEVED, { friends: requests }));
  }),

  getSentRequests: withUser(async (c, userId) => {
    const requests = await FriendshipService.getSentFriendRequests(userId);
    return c.json(formatResponse(FRIENDSHIP_MESSAGES.SENT_RETRIEVED, { friends: requests }));
  }),

  removeFriend: withUser(async (c, userId) => 
    withIdParam(c, userId, 'id', FriendshipService.removeFriend, FRIENDSHIP_MESSAGES.REMOVED)
  ),

  getAvailableUsers: withUser(async (c, userId) => {
    const users = await FriendshipService.getAvailableUsers(userId);
    return c.json(formatResponse(FRIENDSHIP_MESSAGES.USERS_RETRIEVED, { users }));
  }),

  getFriendTeams: withUser(async (c, userId) => 
    withIdParam(c, userId, 'friendId', FriendshipService.getFriendTeamsWithValidation, FRIENDSHIP_MESSAGES.TEAMS_RETRIEVED)
  )
};