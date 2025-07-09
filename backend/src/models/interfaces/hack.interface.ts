export interface ChallengeData {
  id: string;
  encrypted_code: string;
  algorithm: string;
  difficulty: string;
  explanation: string;
  time_limit: number;
  createdAt?: number;
  userId?: number;
  solution?: string;
}