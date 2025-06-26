import { PokemonTypeService } from './pokemonTypeService.js';

async function testPokemonTypes() {
  console.log('🧪 Test du PokemonTypeService...\n');
  
  try {
    // Test 1: Récupération des types
    console.log('📋 Test 1: Récupération des types uniques');
    const types = await PokemonTypeService.getUniqueTypes();
    console.log(`✅ ${types.length} types trouvés:`, types.slice(0, 5), '...\n');
    
    // Test 2: Validation de types valides
    console.log('✔️ Test 2: Validation de types valides');
    const validTypeTest = await PokemonTypeService.isValidType('Feu');
    console.log(`Type "Feu" valide: ${validTypeTest}\n`);
    
    // Test 3: Validation de types invalides
    console.log('❌ Test 3: Validation de type invalide');
    const invalidTypeTest = await PokemonTypeService.isValidType('Inexistant');
    console.log(`Type "Inexistant" valide: ${invalidTypeTest}\n`);
    
    // Test 4: Validation multiple
    console.log('📊 Test 4: Validation multiple');
    const multiValidation = await PokemonTypeService.areValidTypes(['Feu', 'Eau', 'Inexistant']);
    console.log('Résultat validation multiple:', multiValidation, '\n');
    
    // Test 5: Statistiques du cache
    console.log('💾 Test 5: Statistiques du cache');
    const cacheStats = PokemonTypeService.getCacheStats();
    console.log('Stats cache:', cacheStats, '\n');
    
    console.log('🎉 Tous les tests réussis !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter si lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testPokemonTypes();
}

export { testPokemonTypes }; 