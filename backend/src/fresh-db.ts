import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import 'dotenv/config';

const pool = new Pool({
  user: process.env.DB_USER || 'pokemon_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pokemon_battle',
  password: process.env.DB_PASSWORD || 'lOgan',
  port: Number(process.env.DB_PORT) || 5432,
});

const db = drizzle(pool);

async function freshDatabase() {
  try {
    console.log('🗑️  Suppression de toutes les tables...');
    
    // Supprimer toutes les tables
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO pokemon_user`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);
    
    console.log('✅ Base de données nettoyée');
    
    // Appliquer les nouvelles migrations
    console.log('🔄 Application des migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('✅ Migrations appliquées');
    
    // Fermer la connexion
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

freshDatabase(); 