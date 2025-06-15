import type { Context } from "hono";
import { TeamService } from "../services/teamService/gestionTeamService.js";



// ✅ Handlers temporaires sans logique complexe
export const getTeamsHandler = async (c: Context) => {
  console.log('🏆 === GET TEAMS HANDLER APPELÉ ===');
  
  try {
    const user = c.get('user') as any;
    console.log('👤 Utilisateur dans GET TEAMS:', user ? user.email : 'AUCUN');
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401);
    }

    // ✅ UTILISER LE VRAI SERVICE
    const teams = await TeamService.getTeamsWithPokemon(user.id);
    
    return c.json({
      success: true,
      teams
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
  return c.json({ message: 'Delete team - coming soon' });
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

    const result = await TeamService.addPokemonToTeam(
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
  return c.json({ message: 'Remove pokemon - coming soon' });
};

