import { Hono } from "hono";
import { client } from "../../config/dataBase.Config";

const authService = new Hono();

export const insertUser = async (email: string, username: string, password: string) => {
  try {
    const query = 'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING *';
    const values = [email, username, password];
    const result = await client.query(query, values);
    
    if (!result.rows[0]) {
      throw new Error('No user returned after insert');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in insertUser:', error);
    throw error; // Rethrow pour que le contrôleur puisse le gérer
  }
};

export default authService;