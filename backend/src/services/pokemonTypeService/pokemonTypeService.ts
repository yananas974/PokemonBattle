import { db } from '../../config/drizzle.config.js';
import { sql } from 'drizzle-orm';
import { pokemonReference } from '../../db/schema.js';
import { z } from 'zod';

export class PokemonTypeService {
  private static cachedTypes: string[] | null = null;
  private static cacheExpiry: number = 0;
  private static CACHE_DURATION = 60 * 60 * 1000; // 1 heure
  
  // ✅ Types fallback si problème DB
  private static FALLBACK_TYPES = [
    'Normal', 'Feu', 'Eau', 'Plante', 'Électrik', 'Glace', 
    'Combat', 'Poison', 'Sol', 'Vol', 'Psy', 'Insecte', 
    'Roche', 'Spectre', 'Dragon', 'Ténèbres', 'Acier', 'Fée'
  ];

  /**
   * Récupère tous les types Pokemon uniques depuis la base de données
   * avec cache pour optimiser les performances
   */
  static async getUniqueTypes(): Promise<string[]> {
    // ✅ Vérifier le cache
    if (this.cachedTypes && Date.now() < this.cacheExpiry) {
      console.log('🎯 Types Pokemon récupérés depuis le cache');
      return this.cachedTypes;
    }

    try {
      console.log('🔄 Récupération des types Pokemon depuis la base...');
      
      const result = await db
        .selectDistinct({ type: pokemonReference.type })
        .from(pokemonReference);
      
      const types = result
        .map(row => row.type)
        .filter(Boolean)
        .sort();
      
      if (types.length === 0) {
        console.warn('⚠️ Aucun type trouvé en DB, utilisation du fallback');
        return this.FALLBACK_TYPES;
      }
      
      // ✅ Mettre en cache
      this.cachedTypes = types;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      
      console.log(`✅ ${types.length} types Pokemon récupérés:`, types);
      return types;
      
    } catch (error) {
      console.error('❌ Erreur récupération types Pokemon:', error);
      // ✅ Fallback en cas d'erreur
      return this.FALLBACK_TYPES;
    }
  }

  /**
   * Valide qu'un type Pokemon existe en base de données
   */
  static async isValidType(type: string): Promise<boolean> {
    const validTypes = await this.getUniqueTypes();
    return validTypes.includes(type);
  }

  /**
   * Valide plusieurs types Pokemon
   */
  static async areValidTypes(types: string[]): Promise<{ valid: boolean; invalidTypes: string[] }> {
    const validTypes = await this.getUniqueTypes();
    const invalidTypes = types.filter(type => !validTypes.includes(type));
    
    return {
      valid: invalidTypes.length === 0,
      invalidTypes
    };
  }

  /**
   * Crée un schéma Zod enum dynamique basé sur les types en BDD
   */
  static async createPokemonTypeSchema() {
    const types = await this.getUniqueTypes();
    
    if (types.length === 0) {
      throw new Error('Aucun type Pokemon trouvé en base de données');
    }
    
    // ✅ Créer un enum Zod dynamique
    const firstType = types[0];
    const otherTypes = types.slice(1) as [string, ...string[]];
    
    return z.enum([firstType, ...otherTypes]);
  }

  /**
   * Invalide le cache (utile après ajout de nouveaux Pokemon)
   */
  static invalidateCache(): void {
    this.cachedTypes = null;
    this.cacheExpiry = 0;
    console.log('🗑️ Cache des types Pokemon invalidé');
  }

  /**
   * Récupère les statistiques du cache
   */
  static getCacheStats(): { cached: boolean; expiry: Date | null; typesCount: number } {
    return {
      cached: this.cachedTypes !== null && Date.now() < this.cacheExpiry,
      expiry: this.cacheExpiry > 0 ? new Date(this.cacheExpiry) : null,
      typesCount: this.cachedTypes?.length || 0
    };
  }
} 