import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';
import { 
  friendshipHandlers,
  friendshipValidators
} from '../handlers/friendship.handler.js';

const friendshipRoutes = new Hono();

friendshipRoutes.post('/send', authMiddleware, friendshipValidators.sendRequest, friendshipHandlers.sendRequest);
friendshipRoutes.post('/accept/:id', authMiddleware, friendshipValidators.acceptRequest, friendshipHandlers.acceptRequest);
friendshipRoutes.post('/block/:id', authMiddleware, friendshipValidators.blockRequest, friendshipHandlers.blockRequest);
friendshipRoutes.get('/friends', authMiddleware, friendshipHandlers.getFriends);
friendshipRoutes.get('/requests/received', authMiddleware, friendshipHandlers.getPendingRequests);
friendshipRoutes.get('/requests/sent', authMiddleware, friendshipHandlers.getSentRequests);
friendshipRoutes.delete('/:id', authMiddleware, friendshipHandlers.removeFriend);
friendshipRoutes.get('/available-users', authMiddleware, friendshipHandlers.getAvailableUsers);
friendshipRoutes.get('/teams/:friendId', authMiddleware, friendshipHandlers.getFriendTeams);

export { friendshipRoutes };