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
  getFriendTeamsHandler
} from '../handlers/friendship.handler.js';

const friendshipRoutes = new Hono();
friendshipRoutes.use(authMiddleware);

friendshipRoutes.post('/send', sendFriendRequestHandler);
friendshipRoutes.post('/accept/:id', acceptFriendRequestHandler);
friendshipRoutes.post('/block/:id', blockFriendRequestHandler);
friendshipRoutes.get('/friends', getUserFriendsHandler);
friendshipRoutes.get('/requests/received', getPendingFriendRequestsHandler);
friendshipRoutes.get('/requests/sent', getSentFriendRequestsHandler);
friendshipRoutes.delete('/:id', removeFriendHandler);
friendshipRoutes.get('/available-users', getAvailableUsersHandler);
friendshipRoutes.get('/teams/:friendId', getFriendTeamsHandler);

export default friendshipRoutes; 