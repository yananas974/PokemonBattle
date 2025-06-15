import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import 'dotenv/config';

// ✅ UTILISER DATABASE_URL ou configuration par défaut
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://pokemon_user:lOgan@postgres:5432/pokemon_battle?sslmode=disable'
});

const db = drizzle(pool);

async function resetDatabase() {
  try {
    console.log('🗑️  Suppression de toutes les tables...');
    
    // ✅ MÉTHODE PLUS RADICALE : Supprimer tout le schéma public
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO pokemon_user`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);
    
    console.log('✅ Toutes les tables ont été supprimées');
    
    // Fermer la connexion
    await pool.end();
    
    console.log('🔄 Base de données complètement nettoyée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    process.exit(1);
  }
}

resetDatabase(); 