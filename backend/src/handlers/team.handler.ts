import type { Context } from "hono";
import { TeamService } from "../services/createTeamService/teamService.js"; 
import { PokemonTeamService } from "../services/pokemonTeamService/pokemonTeamService.js";



// ✅ Handlers temporaires sans logique complexe
export const getTeamsHandler = async (c: Context) => {
  console.log('🏆 === GET TEAMS HANDLER APPELÉ ===');
  
  try {
    const user = c.get('user') as any;
    console.log('👤 Utilisateur dans GET TEAMS:', user ? user.email : 'AUCUN');
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401);
    }

    // ✅ UTILISER LE SERVICE AVEC POKÉMONS INCLUS
    console.log('🔍 Récupération des équipes avec Pokémons pour utilisateur:', user.id);
    const teamsWithPokemon = await PokemonTeamService.getTeamsWithPokemon(user.id);
    console.log('✅ Équipes avec Pokémons récupérées:', teamsWithPokemon.length);
    
    // Afficher les détails pour debug
    teamsWithPokemon.forEach(team => {
      console.log(`📋 Équipe "${team.teamName}": ${team.pokemon?.length || 0} Pokémons`);
      if (team.pokemon && team.pokemon.length > 0) {
        team.pokemon.forEach(pokemon => {
          console.log(`  - ${pokemon.name} (#${pokemon.pokemon_id})`);
        });
      }
    });
    
    return c.json({
      success: true,
      teams: teamsWithPokemon
    });
  } catch (error) {
    console.error('❌ Erreur dans getTeamsHandler:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch teams' 
    }, 500);
  }
};

export const createTeamHandler = async (c: Context) => {
  console.log('🏆 === CREATE TEAM HANDLER APPELÉ ===');
  
  try {
    const user = c.get('user') as any;
    const data = await c.req.json();
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401);
    }

    // ✅ UTILISER LE VRAI SERVICE
    const team = await TeamService.createTeam(data, user.id);
    
    return c.json({
      success: true,
      message: 'Team created successfully',
      team
    });
  } catch (error: any) {
    console.error('❌ Erreur dans createTeamHandler:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to create team' 
    }, 500);
  }
};

// ✅ Handlers temporaires sans logique complexe
export const deleteTeamHandler = async (c: Context) => {
  console.log('🗑️ === DELETE TEAM HANDLER APPELÉ ===');
  
  try {
    const user = c.get('user') as any;
    const teamId = parseInt(c.req.param('id'));
    
    console.log('👤 Utilisateur dans DELETE TEAM:', user ? user.email : 'AUCUN');
    console.log('🔍 Team ID à supprimer:', teamId);
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401);
    }

    if (!teamId || isNaN(teamId)) {
      return c.json({ success: false, error: 'ID d\'équipe invalide' }, 400);
    }

    // ✅ Vérifier que l'équipe appartient à l'utilisateur
    const isOwner = await TeamService.verifyTeamOwnership(teamId, user.id);
    if (!isOwner) {
      return c.json({ success: false, error: 'Équipe non trouvée ou non autorisée' }, 404);
    }

    // ✅ Supprimer l'équipe (les Pokémon seront supprimés automatiquement par CASCADE)
    await TeamService.deleteTeam(teamId);
    
    console.log('✅ Équipe supprimée avec succès:', teamId);
    
    return c.json({
      success: true,
      message: 'Équipe supprimée avec succès'
    });
  } catch (error: any) {
    console.error('❌ Erreur dans deleteTeamHandler:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to delete team' 
    }, 500);
  }
};

export const addPokemonToTeamHandler = async (c: Context) => {
  console.log('🏆 === ADD POKEMON HANDLER APPELÉ ===');
  
  try {
    const user = c.get('user') as any;
    const data = await c.req.json();
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401);
    }

    // ✅ Récupérer teamId depuis les paramètres d'URL
    const teamId = c.req.param('teamId');
    const pokemonId = data.pokemonId;

    console.log('🔍 TeamId depuis URL:', teamId);
    console.log('🔍 PokemonId depuis body:', pokemonId);

    if (!teamId || !pokemonId) {
      return c.json({ 
        success: false, 
        error: 'TeamId et PokemonId sont requis' 
      }, 400);
    }

    const result = await PokemonTeamService.addPokemonToTeam(
      Number(teamId), 
      Number(pokemonId), 
      user.id
    );
    
    return c.json({
      success: true,
      message: 'Pokémon ajouté à l\'équipe avec succès',
      pokemon: result
    });
  } catch (error: any) {
    console.error('❌ Erreur dans addPokemonToTeamHandler:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to add pokemon' 
    }, 500);
  }
};

export const removePokemonFromTeamHandler = async (c: Context) => {
  console.log('🗑️ === REMOVE POKEMON HANDLER APPELÉ ===');
  
  try {
    const user = c.get('user') as any;
    const teamId = parseInt(c.req.param('teamId'));
    const pokemonId = parseInt(c.req.param('pokemonId'));
    
    console.log('👤 Utilisateur dans REMOVE POKEMON:', user ? user.email : 'AUCUN');
    console.log('🔍 Team ID:', teamId);
    console.log('🔍 Pokemon ID:', pokemonId);
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401);
    }

    if (!teamId || !pokemonId || isNaN(teamId) || isNaN(pokemonId)) {
      return c.json({ 
        success: false, 
        error: 'ID d\'équipe et ID de Pokémon valides requis' 
      }, 400);
    }

    // ✅ Utiliser le service PokemonTeamService pour supprimer le Pokémon
    await PokemonTeamService.removePokemonFromTeam(teamId, pokemonId, user.id);
    
    console.log('✅ Pokémon supprimé avec succès de l\'équipe:', { teamId, pokemonId });
    
    return c.json({
      success: true,
      message: 'Pokémon retiré de l\'équipe avec succès'
    });
  } catch (error: any) {
    console.error('❌ Erreur dans removePokemonFromTeamHandler:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to remove pokemon from team' 
    }, 500);
  }
};

