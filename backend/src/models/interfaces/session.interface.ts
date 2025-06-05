export interface Session {
  id: number;
  session_token: string;
  user_id: number;
  expire_at: Date;
  ip_adresse?: string;
  user_agent?: string;
  created_at: Date;
}