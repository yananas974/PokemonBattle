import { db } from '../../config/drizzle.config.js';
import { eq, and, sql, asc } from 'drizzle-orm';
import { pokemonReference, Team, pokemon, moves, pokemonMoves, users } from '../../db/schema.js';

// ✅ SERVICE D'OPTIMISATION DE BASE DE DONNÉES

export class DatabaseOptimizer {
  
  // ✅ CACHE DE REQUÊTES FRÉQUENTES
  private static queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  /**
   * Cache intelligent pour requêtes répétitives
   */
  private static async getCachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 minutes par défaut
  ): Promise<T> {
    const cached = this.queryCache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < cached.ttl) {
      console.log(`📋 Cache hit pour: ${key}`);
      return cached.data;
    }
    
    console.log(`🔄 Cache miss pour: ${key}, exécution de la requête`);
    const data = await queryFn();
    
    this.queryCache.set(key, {
      data,
      timestamp: now,
      ttl
    });
    
    return data;
  }
  
  /**
   * Requête optimisée pour récupérer les Pokémon avec leurs relations
   */
  static async getOptimizedPokemonList(
    limit: number = 20,
    offset: number = 0,
    typeFilter?: string,
    searchTerm?: string
  ) {
    const cacheKey = `pokemon_list_${limit}_${offset}_${typeFilter || 'all'}_${searchTerm || 'none'}`;
    
    return this.getCachedQuery(cacheKey, async () => {
      const conditions = [];
      
      if (typeFilter && typeFilter !== 'all') {
        conditions.push(eq(pokemonReference.type, typeFilter));
      }
      
      if (searchTerm) {
        // Utiliser ilike pour recherche insensible à la casse
        conditions.push(
          sql`${pokemonReference.name} ILIKE ${`%${searchTerm}%`}`
        );
      }
      
      const queryBase = db
        .select({
          id: pokemonReference.id,
          pokeapi_id: pokemonReference.pokeapi_id,
          name: pokemonReference.name,
          type: pokemonReference.type,
          base_hp: pokemonReference.base_hp,
          base_attack: pokemonReference.base_attack,
          base_defense: pokemonReference.base_defense,
          base_speed: pokemonReference.base_speed,
          sprite_url: pokemonReference.sprite_url,
          height: pokemonReference.height,
          weight: pokemonReference.weight
        })
        .from(pokemonReference);
      
      const query = conditions.length > 0
        ? queryBase.where(and(...conditions))
        : queryBase;
      
      return query
        .orderBy(asc(pokemonReference.pokeapi_id))
        .limit(limit)
        .offset(offset);
    }, 10 * 60 * 1000); // Cache 10 minutes pour les listes
  }
  
  /**
   * Requête optimisée pour récupérer une équipe avec tous ses Pokémon
   */
  static async getOptimizedTeamWithPokemon(teamId: number, userId: number) {
    const cacheKey = `team_with_pokemon_${teamId}_${userId}`;
    
    return this.getCachedQuery(cacheKey, async () => {
      // ✅ JOINTURE OPTIMISÉE EN UNE SEULE REQUÊTE
      const result = await db
        .select({
          // Team info
          teamId: Team.id,
          teamName: Team.team_name,
          teamCreatedAt: Team.created_at,
          teamUserId: Team.user_id,
          
          // Pokemon info
          pokemonId: pokemonReference.id,
          pokemonPokeapiId: pokemonReference.pokeapi_id,
          pokemonName: pokemonReference.name,
          pokemonType: pokemonReference.type,
          pokemonBaseHp: pokemonReference.base_hp,
          pokemonBaseAttack: pokemonReference.base_attack,
          pokemonBaseDefense: pokemonReference.base_defense,
          pokemonBaseSpeed: pokemonReference.base_speed,
          pokemonSpriteUrl: pokemonReference.sprite_url,
          
          // Pokemon instance info
          pokemonLevel: pokemon.level,
          pokemonHp: pokemon.hp,
          pokemonAttack: pokemon.attack,
          pokemonDefense: pokemon.defense,
          pokemonSpeed: pokemon.speed
        })
        .from(Team)
        .leftJoin(pokemon, eq(Team.id, pokemon.team_id))
        .leftJoin(pokemonReference, eq(pokemon.pokemon_reference_id, pokemonReference.id))
        .where(and(
          eq(Team.id, teamId),
          eq(Team.user_id, userId)
        ))
        .orderBy(asc(pokemonReference.pokeapi_id));
      
      if (result.length === 0) {
        return null;
      }
      
      // ✅ TRANSFORMATION OPTIMISÉE DES DONNÉES
      const team = {
        id: result[0].teamId,
        team_name: result[0].teamName,
        created_at: result[0].teamCreatedAt,
        user_id: result[0].teamUserId,
        pokemon: result
          .filter(row => row.pokemonId !== null)
          .map(row => ({
            id: row.pokemonId,
            pokeapi_id: row.pokemonPokeapiId,
            name: row.pokemonName,
            type: row.pokemonType,
            base_hp: row.pokemonBaseHp,
            base_attack: row.pokemonBaseAttack,
            base_defense: row.pokemonBaseDefense,
            base_speed: row.pokemonBaseSpeed,
            sprite_url: row.pokemonSpriteUrl,
            level: row.pokemonLevel,
            hp: row.pokemonHp,
            attack: row.pokemonAttack,
            defense: row.pokemonDefense,
            speed: row.pokemonSpeed
          }))
          .sort((a, b) => (a.pokeapi_id || 0) - (b.pokeapi_id || 0))
      };
      
      return team;
    }, 5 * 60 * 1000); // Cache 5 minutes pour les équipes
  }
  
  /**
   * Requête optimisée pour récupérer les attaques d'un Pokémon
   */
  static async getOptimizedPokemonMoves(pokemonId: number) {
    const cacheKey = `pokemon_moves_${pokemonId}`;
    
    return this.getCachedQuery(cacheKey, async () => {
      return db
        .select({
          moveId: moves.id,
          moveName: moves.name,
          moveNameFr: moves.name_fr,
          moveType: moves.type,
          movePower: moves.power,
          moveAccuracy: moves.accuracy,
          movePp: moves.pp,
          moveCategory: moves.category,
          moveDescription: moves.description,
          
          // Relation info
          levelLearned: pokemonMoves.level_learned
        })
        .from(pokemonMoves)
        .innerJoin(moves, eq(pokemonMoves.move_id, moves.id))
        .where(eq(pokemonMoves.pokemon_reference_id, pokemonId))
        .orderBy(asc(pokemonMoves.level_learned), asc(moves.name));
    }, 15 * 60 * 1000); // Cache 15 minutes pour les attaques
  }
  
  /**
   * Requête optimisée pour les statistiques utilisateur
   */
  static async getOptimizedUserStats(userId: number) {
    const cacheKey = `user_stats_${userId}`;
    
    return this.getCachedQuery(cacheKey, async () => {
      // ✅ REQUÊTE AGRÉGÉE OPTIMISÉE
      const stats = await db
        .select({
          totalTeams: sql<number>`COUNT(DISTINCT ${Team.id})`,
          totalPokemon: sql<number>`COUNT(DISTINCT ${pokemon.pokemon_reference_id})`,
          favoriteType: sql<string>`
            MODE() WITHIN GROUP (ORDER BY ${pokemonReference.type})
          `
        })
        .from(Team)
        .leftJoin(pokemon, eq(Team.id, pokemon.team_id))
        .leftJoin(pokemonReference, eq(pokemon.pokemon_reference_id, pokemonReference.id))
        .where(eq(Team.user_id, userId))
        .groupBy(Team.user_id);
      
      return stats[0] || {
        totalTeams: 0,
        totalPokemon: 0,
        favoriteType: null
      };
    }, 30 * 60 * 1000); // Cache 30 minutes pour les stats
  }
  
  /**
   * Batch insert optimisé pour les Pokémon
   */
  static async batchInsertPokemon(pokemonData: any[]) {
    const BATCH_SIZE = 100;
    const results = [];
    
    console.log(`📦 Insertion par batch de ${pokemonData.length} Pokémon (taille batch: ${BATCH_SIZE})`);
    
    for (let i = 0; i < pokemonData.length; i += BATCH_SIZE) {
      const batch = pokemonData.slice(i, i + BATCH_SIZE);
      
      console.log(`📥 Traitement du batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(pokemonData.length / BATCH_SIZE)}`);
      
      const batchResult = await db
        .insert(pokemonReference)
        .values(batch)
        .onConflictDoUpdate({
          target: pokemonReference.pokeapi_id,
          set: {
            name: sql`excluded.name`,
            type: sql`excluded.type`,
            base_hp: sql`excluded.base_hp`,
            base_attack: sql`excluded.base_attack`,
            base_defense: sql`excluded.base_defense`,
            base_speed: sql`excluded.base_speed`,
            sprite_url: sql`excluded.sprite_url`,
            height: sql`excluded.height`,
            weight: sql`excluded.weight`
          }
        })
        .returning();
      
      results.push(...batchResult);
    }
    
    console.log(`✅ Insertion terminée: ${results.length} Pokémon traités`);
    
    // Invalider le cache après insertion
    this.invalidateCache('pokemon_');
    
    return results;
  }
  
  /**
   * Nettoyage du cache
   */
  static invalidateCache(pattern?: string) {
    if (pattern) {
      const keysToDelete = Array.from(this.queryCache.keys()).filter(key => key.includes(pattern));
      keysToDelete.forEach(key => this.queryCache.delete(key));
      console.log(`🗑️ Cache invalidé: ${keysToDelete.length} entrées supprimées (pattern: ${pattern})`);
    } else {
      this.queryCache.clear();
      console.log('🗑️ Cache complètement vidé');
    }
  }
  
  /**
   * Statistiques du cache
   */
  static getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    this.queryCache.forEach(entry => {
      if ((now - entry.timestamp) < entry.ttl) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });
    
    return {
      totalEntries: this.queryCache.size,
      validEntries,
      expiredEntries,
      cacheHitRate: validEntries / (validEntries + expiredEntries) || 0
    };
  }
  
  /**
   * Nettoyage automatique des entrées expirées
   */
  static cleanupExpiredCache() {
    const now = Date.now();
    const initialSize = this.queryCache.size;
    
    this.queryCache.forEach((entry, key) => {
      if ((now - entry.timestamp) >= entry.ttl) {
        this.queryCache.delete(key);
      }
    });
    
    const cleaned = initialSize - this.queryCache.size;
    if (cleaned > 0) {
      console.log(`🧹 Nettoyage du cache: ${cleaned} entrées expirées supprimées`);
    }
  }
}

// ✅ NETTOYAGE AUTOMATIQUE TOUTES LES 10 MINUTES
setInterval(() => {
  DatabaseOptimizer.cleanupExpiredCache();
}, 10 * 60 * 1000);