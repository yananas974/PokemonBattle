import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { pokemonReference, hacks } from '../src/db/schema.js';
import { eq, lte } from 'drizzle-orm';
import { PokemonMoveService } from '../src/services/pokemonMoveService/pokemonMoveService.js';

interface PokemonApiResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  sprites: {
    front_default: string;
    back_default: string;
  };
}

interface PokemonSpeciesResponse {
  names: Array<{
    name: string;
    language: {
      name: string;
    };
  }>;
}

interface PokemonTypeResponse {
  names: Array<{
    name: string;
    language: {
      name: string;
    };
  }>;
}

class PokemonSeeder {
  private db: ReturnType<typeof drizzle>;
  private pool: Pool;
  private readonly BATCH_SIZE = 10;
  private readonly MAX_RETRIES = 3;
  private readonly DELAY_BETWEEN_REQUESTS = 100; // ms

  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER || 'pokemon_user',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'pokemon_battle',
      password: process.env.DB_PASSWORD || 'lOgan',
      port: Number(process.env.DB_PORT) || 5432,
    });
    
    this.db = drizzle(this.pool);
    console.log('🔌 Connexion à la base de données configurée');
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchPokemonSpecies(id: number): Promise<string | null> {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
      
      if (!response.ok) {
        console.log(`⚠️ Espèce Pokémon ${id} non trouvée`);
        return null;
      }

      const data: PokemonSpeciesResponse = await response.json();
      
      // Chercher le nom français
      const frenchName = data.names.find(nameEntry => 
        nameEntry.language.name === 'fr'
      );
      
      return frenchName?.name || null;
    } catch (error) {
      console.error(`❌ Erreur espèce Pokémon ${id}:`, error);
      return null;
    }
  }

  private async fetchPokemonTypeInFrench(typeUrl: string): Promise<string | null> {
    try {
      const response = await fetch(typeUrl);
      
      if (!response.ok) {
        console.log(`⚠️ Type Pokémon non trouvé: ${typeUrl}`);
        return null;
      }

      const data: PokemonTypeResponse = await response.json();
      
      // Chercher le nom français du type
      const frenchType = data.names.find(nameEntry => 
        nameEntry.language.name === 'fr'
      );
      
      return frenchType?.name || null;
    } catch (error) {
      console.error(`❌ Erreur type Pokémon:`, error);
      return null;
    }
  }

  private async fetchPokemonData(id: number, retries = 0): Promise<PokemonApiResponse | null> {
    try {
      // Requête pour les données de base du Pokémon
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ Pokémon ${id} non trouvé sur l'API`);
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Récupérer en parallèle le nom français et le type français
      const [frenchNameResult, frenchTypeResult] = await Promise.allSettled([
        // Nom français depuis l'espèce
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
          .then(res => res.ok ? res.json() : null)
          .then(speciesData => {
            if (!speciesData) return null;
            const frenchName = speciesData.names.find((nameEntry: any) => 
              nameEntry.language.name === 'fr'
            );
            return frenchName?.name || null;
          }),
        
        // Type français
        this.fetchPokemonTypeInFrench(data.types[0]?.type?.url)
      ]);

      // Ajouter les données françaises
      data.frenchName = frenchNameResult.status === 'fulfilled' ? frenchNameResult.value : null;
      data.frenchType = frenchTypeResult.status === 'fulfilled' ? frenchTypeResult.value : null;
      
      return data;
    } catch (error) {
      if (retries < this.MAX_RETRIES) {
        console.log(`🔄 Retry ${retries + 1}/${this.MAX_RETRIES} pour Pokémon ${id}`);
        await this.delay(1000 * (retries + 1));
        return this.fetchPokemonData(id, retries + 1);
      }
      
      console.error(`❌ Erreur finale pour Pokémon ${id}:`, error);
      return null;
    }
  }

  private async insertPokemon(data: PokemonApiResponse & { frenchName?: string | null; frenchType?: string | null }): Promise<boolean> {
    try {
      // Vérifier si le Pokémon existe déjà
      const existing = await this.db
        .select()
        .from(pokemonReference)
        .where(eq(pokemonReference.pokeapi_id, data.id))
        .limit(1);

      if (existing.length > 0) {
        console.log(`🟡 Pokémon ${data.frenchName || data.name} déjà en base`);
        return true;
      }

      const stats = Object.fromEntries(
        data.stats.map(s => [s.stat.name, s.base_stat])
      );

      // Utiliser les noms français ou anglais en fallback
      const pokemonName = data.frenchName || data.name;
      const pokemonType = data.frenchType || data.types[0]?.type?.name || 'normal';

      await this.db.insert(pokemonReference).values({
        pokeapi_id: data.id,
        name: pokemonName,
        type: pokemonType,
        base_hp: stats.hp || 50,
        base_attack: stats.attack || 50,
        base_defense: stats.defense || 50,
        base_speed: stats.speed || 50,
        height: data.height,
        weight: data.weight,
        sprite_url: data.sprites.front_default || '',
        back_sprite_url: data.sprites.back_default || '',
      });

      console.log(`✅ Ajouté ${pokemonName} - Type: ${pokemonType} (id: ${data.id})`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur insertion ${data.frenchName || data.name}:`, error);
      return false;
    }
  }

  public async seedPokemon(startId = 1, endId = 151): Promise<void> {
    console.log(`🌱 Début du seed Pokémon (${startId} à ${endId})`);
    
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    // Traitement par lots pour éviter de surcharger l'API
    for (let i = startId; i <= endId; i += this.BATCH_SIZE) {
      const batchEnd = Math.min(i + this.BATCH_SIZE - 1, endId);
      console.log(`📦 Traitement du lot ${i}-${batchEnd}`);

      const batchPromises: Promise<{ success: boolean; wasExisting: boolean }>[] = [];
      for (let j = i; j <= batchEnd; j++) {
        batchPromises.push(this.processPokemon(j));
      }

      const results = await Promise.allSettled(batchPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { success, wasExisting } = result.value;
          if (success) {
            if (wasExisting) skipped++;
            else successful++;
          } else {
            failed++;
          }
        } else {
          failed++;
          console.error(`❌ Erreur critique pour Pokémon ${i + index}:`, result.reason);
        }
      });

      // Délai entre les lots pour respecter l'API
      if (batchEnd < endId) {
        await this.delay(this.DELAY_BETWEEN_REQUESTS);
      }
    }

    console.log(`\n🎉 Seed terminé !`);
    console.log(`✅ Succès: ${successful}`);
    console.log(`🟡 Ignorés (déjà présents): ${skipped}`);
    console.log(`❌ Échecs: ${failed}`);
    console.log(`📊 Total traité: ${successful + skipped + failed}/${endId - startId + 1}`);
  }

  private async processPokemon(id: number): Promise<{ success: boolean; wasExisting: boolean }> {
    const data = await this.fetchPokemonData(id);
    
    if (!data) {
      return { success: false, wasExisting: false };
    }

    // Vérifier si déjà existant
    const existing = await this.db
      .select()
      .from(pokemonReference)
      .where(eq(pokemonReference.pokeapi_id, data.id))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, wasExisting: true };
    }

    const insertSuccess = await this.insertPokemon(data);
    return { success: insertSuccess, wasExisting: false };
  }

  /**
   * 🌐 Seed des mots de base pour les hacks
   */
  private async seedHacks(): Promise<void> {
    console.log(`🌐 Ajout des mots de base pour les hacks...`);

    const existing = await this.db.select().from(hacks);
    if (existing.length > 0) {
      console.log(`🟡 Mots de base déjà insérés (${existing.length})`);
      return;
    }

    // ✅ Mots sans difficulté - la difficulté vient du traitement
    const baseWords = [
      { base_word: "FEED" },
      { base_word: "PAUSE" },
      { base_word: "CATCH" },
      { base_word: "OPEN" },
      { base_word: "DEFEND" },
    ];

    try {
      await this.db.insert(hacks).values(baseWords);
      console.log(`✅ Mots de base insérés (${baseWords.length})`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'insertion des mots de base:`, error);
      throw error;
    }
  }

  /**
   * 🎯 Seed des attaques Pokémon depuis PokéAPI
   */
  private async seedPokemonMoves(): Promise<void> {
    console.log(`⚔️ Import des attaques Pokémon depuis PokéAPI...`);
    
    try {
      // ✅ CORRECTION : Récupérer TOUS les Pokémon Gen 1
      const allPokemon = await this.db
        .select({
          id: pokemonReference.id,
          pokeapi_id: pokemonReference.pokeapi_id,
          name: pokemonReference.name
        })
        .from(pokemonReference)
        .where(lte(pokemonReference.pokeapi_id, 151)); // ✅ Utiliser lte (≤) au lieu de eq (=)
      
      console.log(`📊 ${allPokemon.length} Pokémon trouvés pour l'import des attaques`);
      
      if (allPokemon.length === 0) {
        console.log('⚠️ Aucun Pokémon trouvé, veuillez d\'abord seeder les Pokémon');
        return;
      }
      
      let successful = 0;
      let failed = 0;
      
      // ✅ Traiter chaque Pokémon
      for (let i = 0; i < allPokemon.length; i++) {
        const pokemon = allPokemon[i];
        console.log(`\n[${i + 1}/${allPokemon.length}] 🔄 Import attaques: ${pokemon.name} (ID: ${pokemon.pokeapi_id})`);
        
        try {
          await PokemonMoveService.fetchAndSavePokemonMoves(pokemon.pokeapi_id);
          successful++;
          console.log(`✅ Attaques importées pour ${pokemon.name}`);
        } catch (error) {
          failed++;
          console.error(`❌ Erreur pour ${pokemon.name}:`, error);
        }
        
        // ✅ Délai entre chaque Pokémon pour éviter de surcharger l'API
        if (i < allPokemon.length - 1) {
          await this.delay(500);
        }
      }
      
      console.log(`\n🎉 Import des attaques terminé !`);
      console.log(`✅ Succès: ${successful}`);
      console.log(`❌ Échecs: ${failed}`);
      console.log(`📊 Total traité: ${successful + failed}/${allPokemon.length}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'import des attaques:', error);
      throw error;
    }
  }

  /**
   * 🌱 Seed complet : Pokémon + Hacks + Attaques
   */
  public async seedAll(startId = 1, endId = 151): Promise<void> {
    console.log(`🌱 Début du seed complet`);
    
    try {
      // 1. Seed des Pokémon
      await this.seedPokemon(startId, endId);
      
      // 2. Seed des Hacks
      await this.seedHacks();
      
      // 3. ✅ NOUVEAU : Seed des attaques Pokémon
      await this.seedPokemonMoves();
      
      console.log(`🎉 Seed complet terminé avec succès !`);
    } catch (error) {
      console.error(`💥 Erreur lors du seed complet:`, error);
      throw error;
    }
  }

  /**
   * 🎯 Seed seulement les attaques
   */
  public async seedOnlyMoves(): Promise<void> {
    console.log(`⚔️ Seed des attaques uniquement`);
    await this.seedPokemonMoves();
  }

  /**
   * 🎯 Seed seulement les hacks
   */
  public async seedOnlyHacks(): Promise<void> {
    console.log(`🌐 Seed des hacks uniquement`);
    await this.seedHacks();
  }

  public async close(): Promise<void> {
    await this.pool.end();
    console.log('🔌 Connexion fermée');
  }
}

async function main() {
  const seeder = new PokemonSeeder();
  const args = process.argv.slice(2);
  
  try {
    console.log('🔍 Test de connexion à la base de données...');
    await seeder['db'].select().from(pokemonReference).limit(1);
    console.log('✅ Connexion réussie !');

    // ✅ Gestion des arguments étendus
    if (args.includes('--pokemon-only')) {
      console.log('🎯 Seed Pokémon uniquement');
      await seeder.seedPokemon(1, 151);
    } else if (args.includes('--hacks-only')) {
      console.log('🎯 Seed Hacks uniquement');
      await seeder.seedOnlyHacks();
    } else if (args.includes('--moves-only')) {
      console.log('🎯 Seed Attaques uniquement');
      await seeder.seedOnlyMoves();
    } else {
      console.log('🎯 Seed complet (Pokémon + Hacks + Attaques)');
      await seeder.seedAll(1, 151);
    }
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
    process.exit(1);
  } finally {
    await seeder.close();
  }
}

// Gestion des signaux pour fermeture propre
process.on('SIGINT', async () => {
  console.log('\n🛑 Interruption détectée, fermeture...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt demandé, fermeture...');
  process.exit(0);
});

// ✅ Exporter la classe pour pouvoir l'utiliser dans init-db.ts
export { PokemonSeeder };

// Modifiez la section main pour ne s'exécuter que si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 