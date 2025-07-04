import { db } from '../../config/drizzle.config.js';
import { pokemonReference, pokemonMoves, moves } from '../../db/schema.js';
import { asc, eq } from 'drizzle-orm';
import { PokemonDetail } from '@pokemon-battle/shared';

// Define the DbPokemon interface to match what the service expects
interface DbPokemon {
  pokemon_id: number;
  name_fr: string;
  name_en: string;
  pokemon_type: string;
  base_health_points: number;
  base_attack_points: number;
  base_defense_points: number;
  base_speed_points: number;
  height: number;
  weight: number;
  sprite_url: string;
  back_sprite_url?: string;
  user_id?: number;
  created_at: Date;
  updated_at: Date;
}

export class PokemonService {
  // Récupérer tous les Pokemon
  static async getAllPokemon(): Promise<DbPokemon[]> {
    const pokemon = await db
      .select()
      .from(pokemonReference)
      .orderBy(asc(pokemonReference.pokeapi_id));

    // Mapper les données DB vers notre interface DbPokemon
    return pokemon.map(p => ({
      pokemon_id: p.pokeapi_id,
      name_fr: p.name,
      name_en: p.name,
      pokemon_type: p.type || 'normal',
      base_health_points: p.base_hp || 50,
      base_attack_points: p.base_attack || 50,
      base_defense_points: p.base_defense || 50,
      base_speed_points: p.base_speed || 50,
      height: p.height || 10,
      weight: p.weight || 100,
      sprite_url: p.sprite_url || '',
      back_sprite_url: p.back_sprite_url || undefined,
      user_id: undefined,
      created_at: new Date(),
      updated_at: new Date()
    }));
  }

  // Récupérer un Pokemon par ID
  static async getPokemonById(pokemonId: number): Promise<DbPokemon | null> {
    const pokemon = await db
      .select()
      .from(pokemonReference)
      .where(eq(pokemonReference.pokeapi_id, pokemonId))
      .limit(1);

    if (pokemon.length === 0) {
      return null;
    }

    const p = pokemon[0];
    return {
      pokemon_id: p.pokeapi_id,
      name_fr: p.name,
      name_en: p.name,
      pokemon_type: p.type || 'normal',
      base_health_points: p.base_hp || 50,
      base_attack_points: p.base_attack || 50,
      base_defense_points: p.base_defense || 50,
      base_speed_points: p.base_speed || 50,
      height: p.height || 10,
      weight: p.weight || 100,
      sprite_url: p.sprite_url || '',
      back_sprite_url: p.back_sprite_url || undefined,
      user_id: undefined,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // Récupérer les détails complets d'un Pokemon pour la page de détail
  static async getPokemonDetailById(pokemonId: number): Promise<PokemonDetail | null> {
    const pokemon = await db
      .select()
      .from(pokemonReference)
      .where(eq(pokemonReference.pokeapi_id, pokemonId))
      .limit(1);

    if (pokemon.length === 0) {
      return null;
    }

    const p = pokemon[0];

    // Récupérer les attaques du Pokémon
    const pokemonMovesData = await db
      .select({
        move_name: moves.name_fr
      })
      .from(pokemonMoves)
      .innerJoin(moves, eq(pokemonMoves.move_id, moves.id))
      .where(eq(pokemonMoves.pokemon_reference_id, p.id))
      .limit(4);

    const moveNames = pokemonMovesData.map(m => m.move_name || 'Attaque Inconnue');

    // Construire l'objet PokemonDetail complet
    const pokemonDetail: PokemonDetail = {
      // Champs de base de Pokemon
      id: p.pokeapi_id,
      name_fr: p.name,
      name_en: p.name,
      type: p.type || 'normal',
      base_hp: p.base_hp || 50,
      base_attack: p.base_attack || 50,
      base_defense: p.base_defense || 50,
      base_speed: p.base_speed || 50,
      height: p.height || 10,
      weight: p.weight || 100,
      sprite_url: p.sprite_url || '',
      back_sprite_url: p.back_sprite_url || undefined,

      // Champs spécifiques à PokemonDetail
      types: [p.type || 'normal'],
      generation: p.pokeapi_id <= 151 ? 1 : 2, // Génération basée sur l'ID
      abilities: ['Statik', 'Foudre'], // Données par défaut pour l'instant
      stats: {
        hp: p.base_hp || 50,
        attack: p.base_attack || 50,
        defense: p.base_defense || 50,
        special_attack: p.base_attack || 50, // Utiliser attack comme special_attack
        special_defense: p.base_defense || 50, // Utiliser defense comme special_defense
        speed: p.base_speed || 50
      },
      description: `${p.name} est un Pokémon de type ${p.type || 'normal'} de la génération ${p.pokeapi_id <= 151 ? 1 : 2}.`,
      moves: moveNames.length > 0 ? moveNames : ['Charge', 'Rugissement', 'Éclair', 'Vive-Attaque']
    };

    return pokemonDetail;
  }
}

// Export par défaut pour faciliter l'import
export const pokemonService = PokemonService; 