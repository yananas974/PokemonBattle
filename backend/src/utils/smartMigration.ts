import { db } from '../config/drizzle.config.js';
import { sql } from 'drizzle-orm';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TableInfo {
  table_name: string;
  column_count: number;
}

export class SmartMigration {
  // Définition des tables attendues avec leurs colonnes
  private static expectedTables = {
    'users': ['id', 'email', 'password_hash', 'username', 'created_at', 'updated_at'],
    'sessions': ['id', 'session_token', 'user_id', 'expires_at', 'created_at', 'updated_at', 'last_accessed'],
    'friendships': ['id', 'requester_id', 'addressee_id', 'status', 'created_at', 'updated_at'],
    'team': ['id', 'team_name', 'user_id', 'created_at', 'updated_at'],
    'pokemon': ['id', 'pokemon_id', 'nickname', 'level', 'team_id', 'pokemon_reference_id', 'created_at', 'updated_at', 'position'],
    'pokemon_reference': ['id', 'name', 'type1', 'type2', 'hp', 'attack', 'defense', 'special_attack', 'special_defense', 'speed', 'sprite_url', 'pokemon_id'],
    'battles': ['id', 'challenger_team_id', 'opponent_team_id', 'winner_team_id', 'battle_log', 'created_at'],
    'hacks': ['id', 'name', 'description', 'severity', 'created_at', 'updated_at']
  };

  // SQL pour créer seulement la table hacks
  private static hacksTableSQL = `
    CREATE TABLE IF NOT EXISTS "hacks" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar(255) NOT NULL,
      "description" text,
      "severity" varchar(50) DEFAULT 'low',
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp DEFAULT now()
    );
  `;

  /**
   * Vérifier quelles tables existent dans la base
   */
  private static async getExistingTables(): Promise<string[]> {
    try {
      const result = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `);
      
      return result.rows.map((row: any) => row.table_name);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des tables:', error);
      return [];
    }
  }

  /**
   * Créer seulement les tables manquantes
   */
  private static async createMissingTablesDirectly(missingTables: string[]): Promise<void> {
    for (const tableName of missingTables) {
      try {
        console.log(`🔨 Création de la table: ${tableName}`);
        
        switch (tableName) {
          case 'hacks':
            await db.execute(sql.raw(this.hacksTableSQL));
            console.log(`✅ Table ${tableName} créée avec succès`);
            break;
          
          // Ajouter d'autres tables si nécessaire
          default:
            console.log(`⚠️ Définition manquante pour la table: ${tableName}`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la création de la table ${tableName}:`, error);
        throw error;
      }
    }
  }

  /**
   * Nettoyer les anciens fichiers de migration
   */
  private static cleanOldMigrations(): void {
    try {
      const migrationsDir = path.join(process.cwd(), 'drizzle');
      if (fs.existsSync(migrationsDir)) {
        const files = fs.readdirSync(migrationsDir);
        const sqlFiles = files.filter(f => f.endsWith('.sql'));
        
        if (sqlFiles.length > 0) {
          console.log(`🧹 Nettoyage de ${sqlFiles.length} anciens fichiers de migration`);
          sqlFiles.forEach(file => {
            fs.unlinkSync(path.join(migrationsDir, file));
          });
          
          // Nettoyer aussi les métadonnées
          const metaDir = path.join(migrationsDir, 'meta');
          if (fs.existsSync(metaDir)) {
            const metaFiles = fs.readdirSync(metaDir);
            metaFiles.forEach(file => {
              if (file.endsWith('.json') && file !== '_journal.json') {
                fs.unlinkSync(path.join(metaDir, file));
              }
            });
            
            // Réinitialiser le journal
            const journalPath = path.join(metaDir, '_journal.json');
            fs.writeFileSync(journalPath, JSON.stringify({
              version: "7",
              dialect: "postgresql",
              entries: []
            }, null, 2));
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Erreur lors du nettoyage (non critique):', error);
    }
  }

  /**
   * Exécuter la migration intelligente
   */
  static async runSmartMigration(): Promise<void> {
    try {
      console.log('🚀 === DÉMARRAGE MIGRATION INTELLIGENTE ===');
      
      // 1. Vérifier les tables existantes
      console.log('🔍 Vérification des tables existantes...');
      const existingTables = await this.getExistingTables();
      const expectedTables = Object.keys(this.expectedTables);
      
      console.log('✅ Tables existantes:', existingTables);
      console.log('🔍 Tables attendues:', expectedTables);
      
      // 2. Identifier les tables manquantes
      const missingTables = expectedTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length === 0) {
        console.log('✅ Toutes les tables sont présentes, aucune migration nécessaire');
        return;
      }
      
      console.log('❌ Tables manquantes:', missingTables);
      
      // 3. Nettoyer les anciennes migrations pour éviter les conflits
      this.cleanOldMigrations();
      
      // 4. Créer directement les tables manquantes
      console.log('🔨 Création directe des tables manquantes...');
      await this.createMissingTablesDirectly(missingTables);
      
      console.log('✅ Migration intelligente terminée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration intelligente:', error);
      throw error;
    }
  }
} 