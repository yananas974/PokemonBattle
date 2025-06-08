import { Context } from 'hono';
import { createPokemonSelection, deletePokemonSelection } from '../services/pokemonTeamService.ts/pokemonSelectionService.js';
import { eq } from 'drizzle-orm';
import { Team } from '../db/schema.js';
import { Get } from '../db/crud/get.js';

export async function addPokemonToTeam(c: Context) {
  try {
    const { teamId, pokemonId } = await c.req.json();
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Utilisateur non authentifié' }, 401);
    }

    if (!teamId || !pokemonId) {
      return c.json({ error: 'teamId et pokemonId sont requis' }, 400);
    }

    // Vérifier que l'équipe appartient à l'utilisateur
    const team = await Get(Team, eq(Team.id, teamId)) as typeof Team.$inferSelect | null;
    
    if (!team || team.user_id !== user.id) {
      return c.json({ error: 'Équipe non trouvée ou non autorisée' }, 404);
    }

    // Ajouter le Pokémon à l'équipe
    const result = await createPokemonSelection(teamId, pokemonId);

    return c.json({ 
      success: true, 
      message: 'Pokémon ajouté à l\'équipe avec succès',
      pokemon: result
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du Pokémon:', error);
    return c.json({ 
      error: 'Erreur lors de l\'ajout du Pokémon',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
}

export async function removePokemonFromTeam(c: Context) {
  try {
    const teamId = parseInt(c.req.param('teamId'));
    const pokemonId = parseInt(c.req.param('pokemonId'));
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Utilisateur non authentifié' }, 401);
    }

    if (!teamId || !pokemonId) {
      return c.json({ error: 'teamId et pokemonId sont requis' }, 400);
    }

    // Vérifier que l'équipe appartient à l'utilisateur
    const team = await Get(Team, eq(Team.id, teamId)) as typeof Team.$inferSelect | null;
    
    if (!team || team.user_id !== user.id) {
      return c.json({ error: 'Équipe non trouvée ou non autorisée' }, 404);
    }

    // Supprimer le Pokémon de l'équipe
    await deletePokemonSelection(teamId, pokemonId);

    return c.json({ 
      success: true, 
      message: 'Pokémon retiré de l\'équipe avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du Pokémon:', error);
    return c.json({ 
      error: 'Erreur lors de la suppression du Pokémon',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
} 