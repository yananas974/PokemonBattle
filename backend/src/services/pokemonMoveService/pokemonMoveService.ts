import { db } from '../../config/drizzle.config.js';
import { moves, pokemonMoves, pokemonReference } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { serviceWrapper } from '../../utils/asyncWrapper.js';
import { NotFoundError, ExternalServiceError } from '../../models/errors.js';

export interface PokeApiMove {
  id: number;
  name: string;
  type: {
    name: string;
  };
  power: number | null;
  accuracy: number | null;
  pp: number;
  damage_class: {
    name: string; // physical, special, status
  };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
    };
  }>;
  names: Array<{
    name: string;
    language: {
      name: string;
    };
  }>;
}

export interface PokeApiPokemonMoves {
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: {
        name: string;
      };
      version_group: {
        name: string;
      };
    }>;
  }>;
}

export class PokemonMoveService {
  
  /**
   * Récupérer et sauvegarder une attaque depuis PokéAPI
   */
  static async fetchAndSaveMove(moveUrl: string): Promise<number | null> {
    return serviceWrapper(async () => {
      console.log(`🔍 Récupération de l'attaque: ${moveUrl}`);
      
      const response = await fetch(moveUrl);
      if (!response.ok) {
        throw new ExternalServiceError(`Erreur API PokéAPI: ${response.status}`);
      }
      
      const moveData: PokeApiMove = await response.json();
      
      // ✅ Vérifier si l'attaque existe déjà
      const existingMove = await db
        .select()
        .from(moves)
        .where(eq(moves.pokeapi_id, moveData.id))
        .limit(1);
      
      if (existingMove.length > 0) {
        return existingMove[0].id;
      }
      
      // ✅ Extraire les noms français
      const frenchName = moveData.names.find(n => n.language.name === 'fr')?.name || moveData.name;
      const frenchDescription = moveData.flavor_text_entries
        .find(entry => entry.language.name === 'fr')?.flavor_text || '';
      
      // ✅ Sauvegarder l'attaque
      const [newMove] = await db
        .insert(moves)
        .values({
          pokeapi_id: moveData.id,
          name: moveData.name,
          name_fr: frenchName,
          type: moveData.type.name,
          power: moveData.power,
          accuracy: moveData.accuracy,
          pp: moveData.pp,
          category: moveData.damage_class.name,
          description: moveData.name,
          description_fr: frenchDescription.replace(/\n/g, ' ')
        })
        .returning();
      
      console.log(`✅ Attaque sauvegardée: ${frenchName} (${moveData.name})`);
      return newMove.id;
    });
  }
  
  /**
   * Récupérer et sauvegarder les attaques d'un Pokémon
   */
  static async fetchAndSavePokemonMoves(pokemonId: number): Promise<void> {
    return serviceWrapper(async () => {
      console.log(`🔍 Récupération des attaques pour le Pokémon ID: ${pokemonId}`);
      
      // ✅ Récupérer les données du Pokémon depuis PokéAPI
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      if (!response.ok) {
        throw new ExternalServiceError(`Pokémon non trouvé: ${pokemonId}`);
      }
      
      const pokemonData: PokeApiPokemonMoves = await response.json();
      
      // ✅ Trouver le pokemon_reference correspondant
      const pokemonRef = await db
        .select()
        .from(pokemonReference)
        .where(eq(pokemonReference.pokeapi_id, pokemonId))
        .limit(1);
      
      if (pokemonRef.length === 0) {
        throw new NotFoundError(`Pokémon en BDD: ${pokemonId}`);
      }
      
      const pokemonRefId = pokemonRef[0].id;
      
      // ✅ Récupérer les attaques par niveau
      const levelUpMoves = pokemonData.moves
        .filter(moveData => {
          const gen1Details = moveData.version_group_details.find(
            detail => (detail.version_group.name === 'red-blue' || 
                       detail.version_group.name === 'yellow') && 
                     detail.move_learn_method.name === 'level-up'
          );
          return gen1Details && gen1Details.level_learned_at <= 20;
        })
        .sort((a, b) => {
          const levelA = a.version_group_details.find(d => d.version_group.name === 'red-blue')?.level_learned_at || 999;
          const levelB = b.version_group_details.find(d => d.version_group.name === 'red-blue')?.level_learned_at || 999;
          return levelA - levelB;
        })
        .slice(0, 4);
      
      console.log(`📝 ${levelUpMoves.length} attaques trouvées pour ${pokemonRef[0].name}`);
      
      // ✅ Traiter chaque attaque
      for (const moveData of levelUpMoves) {
        const moveUrl = moveData.move.url;
        const moveId = await this.fetchAndSaveMove(moveUrl);
        
        if (moveId) {
          const gen1Details = moveData.version_group_details.find(
            detail => detail.version_group.name === 'red-blue'
          );
          
          // ✅ Sauvegarder la relation pokemon-move
          await db
            .insert(pokemonMoves)
            .values({
              pokemon_reference_id: pokemonRefId,
              move_id: moveId,
              learn_method: gen1Details?.move_learn_method.name || 'level-up',
              level_learned: gen1Details?.level_learned_at || 1
            })
            .onConflictDoNothing();
          
          console.log(`✅ Relation sauvegardée: ${pokemonRef[0].name} → ${moveData.move.name}`);
        }
        
        // ✅ Délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });
  }
  
  /**
   * Récupérer les attaques d'un Pokémon depuis la BDD
   */
  static async getPokemonMoves(pokemonId: number) {
    return serviceWrapper(async () => {
      const movesData = await db
        .select({
          move_id: moves.id,
          name: moves.name,
          name_fr: moves.name_fr,
          type: moves.type,
          power: moves.power,
          accuracy: moves.accuracy,
          pp: moves.pp,
          category: moves.category,
          description_fr: moves.description_fr,
          level_learned: pokemonMoves.level_learned
        })
        .from(pokemonMoves)
        .innerJoin(moves, eq(pokemonMoves.move_id, moves.id))
        .where(eq(pokemonMoves.pokemon_reference_id, pokemonId))
        .orderBy(pokemonMoves.level_learned)
        .limit(4);
      
      if (!movesData || movesData.length === 0) {
        throw new NotFoundError(`Moves for Pokemon ${pokemonId}`);
      }
      
      // ✅ Mapper vers l'interface PokemonMove
      return movesData.map(move => ({
        name: move.name,
        type: move.type,
        power: move.power || 0,
        accuracy: move.accuracy || 100,
        pp: move.pp || 10,
        category: move.category as 'physical' | 'special' | 'status' || 'physical',
        criticalHitRatio: 6.25, // Valeur par défaut Gen 1
        description: move.description_fr || move.name
      }));
    });
  }
} 