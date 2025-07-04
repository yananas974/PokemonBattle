export interface User {
  id: number;
  email: string;
  username: string;
}

export interface SignupData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface AuthError {
  error: string;
  details?: string;
} 