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
  message: string;
  user: User;
}

export interface AuthError {
  error: string;
  details?: string;
} 