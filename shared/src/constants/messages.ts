// ✅ MESSAGES POUR LES AMITIÉS
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

// ✅ MESSAGES POUR LES DÉFIS DE HACK
export const HACK_CHALLENGE_MESSAGES = {
  CHALLENGE_GENERATED: 'Hack challenge generated successfully',
  CHALLENGE_SOLVED: 'Hack challenge solved successfully',
  CHALLENGE_FAILED: 'Hack challenge failed',
  CHALLENGE_EXPIRED: 'Challenge expired or invalid',
  INCORRECT_ANSWER: 'Incorrect answer, try again',
  WORDS_RETRIEVED: 'Words retrieved successfully'
} as const;

// ✅ MESSAGES POUR L'AUTHENTIFICATION
export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists',
  TOKEN_INVALID: 'Invalid or expired token',
  UNAUTHORIZED: 'Authentication required'
} as const;

// ✅ MESSAGES POUR LES POKÉMON
export const POKEMON_MESSAGES = {
  RETRIEVED: 'Pokemon retrieved successfully',
  NOT_FOUND: 'Pokemon not found',
  CREATED: 'Pokemon created successfully',
  UPDATED: 'Pokemon updated successfully',
  DELETED: 'Pokemon deleted successfully'
} as const;

// ✅ MESSAGES POUR LES ÉQUIPES
export const TEAM_MESSAGES = {
  CREATED: 'Team created successfully',
  RETRIEVED: 'Teams retrieved successfully',
  UPDATED: 'Team updated successfully',
  DELETED: 'Team deleted successfully',
  POKEMON_ADDED: 'Pokemon added to team successfully',
  POKEMON_REMOVED: 'Pokemon removed from team successfully',
  NOT_FOUND: 'Team not found',
  FULL: 'Team is full (maximum 6 Pokemon)'
} as const;

// ✅ MESSAGES POUR LES COMBATS
export const BATTLE_MESSAGES = {
  INITIALIZED: 'Battle initialized successfully',
  MOVE_EXECUTED: 'Move executed successfully',
  BATTLE_FINISHED: 'Battle finished',
  BATTLE_FORFEITED: 'Battle forfeited',
  INVALID_MOVE: 'Invalid move',
  NOT_YOUR_TURN: 'Not your turn',
  BATTLE_NOT_FOUND: 'Battle not found'
} as const;

// ✅ MESSAGES POUR LA MÉTÉO
export const WEATHER_MESSAGES = {
  RETRIEVED: 'Weather data retrieved successfully',
  EFFECTS_APPLIED: 'Weather effects applied successfully',
  SERVICE_UNAVAILABLE: 'Weather service temporarily unavailable'
} as const; 