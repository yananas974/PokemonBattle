import { Client } from 'pg';

export const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
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
