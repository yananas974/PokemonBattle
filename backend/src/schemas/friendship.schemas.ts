import { z } from "zod";
import { userIdSchema, friendIdSchema, friendshipIdSchema } from './common.schemas.js';

// ✅ Schémas pour les actions d'amitié
export const sendFriendRequestSchema = z.object({
  friendId: friendIdSchema
});

export const acceptFriendRequestSchema = z.object({
  friendshipId: friendshipIdSchema
});

export const blockFriendRequestSchema = z.object({
  friendshipId: friendshipIdSchema
});

export const getUserFriendsSchema = z.object({
  userId: userIdSchema
});

// ✅ Types inférés
export type SendFriendRequest = z.infer<typeof sendFriendRequestSchema>;
export type AcceptFriendRequest = z.infer<typeof acceptFriendRequestSchema>;
export type BlockFriendRequest = z.infer<typeof blockFriendRequestSchema>;
export type GetUserFriends = z.infer<typeof getUserFriendsSchema>; 