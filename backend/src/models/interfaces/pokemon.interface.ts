export interface Pokemon {
  id: number; 
  pokemon_id: number;
  name: string;
  type: string; 
  level: number; 
  hp: number;
  attack: number; 
  defense: number; 
  speed: number; 
  height: number; 
  weight: number; 
  sprite_url: string; 
  user_id: number; 
  created_at: Date; 
}