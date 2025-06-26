import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';
import { 
  sendFriendRequestHandler,
  acceptFriendRequestHandler,
  blockFriendRequestHandler,
  getUserFriendsHandler,
  getPendingFriendRequestsHandler,
  getSentFriendRequestsHandler,
  removeFriendHandler,
  getAvailableUsersHandler,
  getFriendTeamsHandler,
  sendFriendRequestValidator,
  acceptFriendRequestValidator,
  blockFriendRequestValidator
} from '../handlers/friendship.handler.js';

const friendshipRoutes = new Hono();

friendshipRoutes.post('/send', authMiddleware, sendFriendRequestValidator, sendFriendRequestHandler);
friendshipRoutes.post('/accept/:id', authMiddleware, acceptFriendRequestValidator, acceptFriendRequestHandler);
friendshipRoutes.post('/block/:id', authMiddleware, blockFriendRequestValidator, blockFriendRequestHandler);
friendshipRoutes.get('/friends', authMiddleware, getUserFriendsHandler);
friendshipRoutes.get('/requests/received', authMiddleware, getPendingFriendRequestsHandler);
friendshipRoutes.get('/requests/sent', authMiddleware, getSentFriendRequestsHandler);
friendshipRoutes.delete('/:id', authMiddleware, removeFriendHandler);
friendshipRoutes.get('/available-users', authMiddleware, getAvailableUsersHandler);
friendshipRoutes.get('/teams/:friendId', authMiddleware, getFriendTeamsHandler);

export { friendshipRoutes };