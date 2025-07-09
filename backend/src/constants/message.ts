// backend/src/constants/messages.ts
export const FRIENDSHIP_MESSAGES = {
  SENT: 'Friend request sent successfully',
  ACCEPTED: 'Friend request accepted successfully',
  BLOCKED: 'Friend blocked successfully',
  RETRIEVED: 'Friends retrieved successfully',
  PENDING_RETRIEVED: 'Pending friend requests retrieved successfully',
  SENT_RETRIEVED: 'Sent friend requests retrieved successfully',
  REMOVED: 'Friend removed successfully',
  USERS_RETRIEVED: 'Available users retrieved successfully',
  TEAMS_RETRIEVED: 'Friend teams retrieved successfully'
} as const;

export const HACK_CHALLENGE_MESSAGES = {
  CHALLENGE_GENERATED: 'Hack challenge generated successfully',
  CHALLENGE_SOLVED: 'Hack challenge solved successfully',
  CHALLENGE_FAILED: 'Hack challenge failed',
  CHALLENGE_EXPIRED: 'Challenge expired or invalid',
  INCORRECT_ANSWER: 'Incorrect answer, try again',
  WORDS_RETRIEVED: 'Words retrieved successfully'
} as const;