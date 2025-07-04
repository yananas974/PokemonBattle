// ✅ INTERFACE UTILISATEUR
export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

// ✅ UTILISATEUR AVEC TOKEN (pour les sessions)
export interface UserWithToken extends User {
  token: string;
  backendToken?: string;
}

// ✅ REQUÊTES ET RÉPONSES AUTH
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserWithToken;
  message?: string;
  error?: string;
}

// ✅ PROFIL UTILISATEUR
export interface UserProfile extends User {
  totalTeams: number;
  totalBattles: number;
  winRate: number;
  favoriteType?: string;
} 