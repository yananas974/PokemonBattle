import { Pool } from 'pg';

export const client = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const connectToDatabase = async () => {
  try{
    await client.connect();
    console.log('Connected to database');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  try{
    await client.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};
