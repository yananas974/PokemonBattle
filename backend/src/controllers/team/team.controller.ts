import { Hono } from "hono";
import { CreateTeam, getTeams, getTeamById, updateTeam, deleteTeam } from '../../services/createTeamService/createTeam.service';

const teamController = new Hono();

// Créer une équipe
teamController.post('/create', async (c) => {
  try {
    const { teamName, userId } = await c.req.json();
    
    if (!teamName) {
      return c.json({ error: 'Team name is required' }, 400);
    }
    
    const team = await CreateTeam(teamName, userId);
    
    return c.json({
      message: 'Team created successfully',
      team: {
        id: team.id,
        teamName: team.team_name,
        createdAt: team.created_at
      }
    });
    
  } catch (error) {
    console.error('Error in team creation:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return c.json({ 
          error: 'Team name already exists',
          details: error.message 
        }, 400);
      }
      
      return c.json({ 
        error: 'Failed to create team',
        details: error.message 
      }, 500);
    }
    
    return c.json({ 
      error: 'Unknown error occurred',
      details: String(error)
    }, 500);
  }
});

// Récupérer toutes les équipes
teamController.get('/', async (c) => {
  try {
    const teams = await getTeams();
    
    return c.json({
      message: 'Teams retrieved successfully',
      teams: teams.map(team => ({
        id: team.id,
        teamName: team.team_name,
        createdAt: team.created_at,
        updatedAt: team.updated_at
      }))
    });
    
  } catch (error) {
    console.error('Error in getTeams:', error);
    return c.json({ error: 'Failed to retrieve teams' }, 500);
  }
});

// Récupérer une équipe par ID
teamController.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({ error: 'Invalid team ID' }, 400);
    }
    
    const team = await getTeamById(id);
    
    if (!team) {
      return c.json({ error: 'Team not found' }, 404);
    }
    
    return c.json({
      message: 'Team retrieved successfully',
      team: {
        id: team.id,
        teamName: team.team_name,
        createdAt: team.created_at,
        updatedAt: team.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error in getTeamById:', error);
    return c.json({ error: 'Failed to retrieve team' }, 500);
  }
});

// Mettre à jour une équipe
teamController.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { teamName } = await c.req.json();
    
    if (isNaN(id)) {
      return c.json({ error: 'Invalid team ID' }, 400);
    }
    
    if (!teamName) {
      return c.json({ error: 'Team name is required' }, 400);
    }
    
    const team = await updateTeam(id, teamName);
    
    return c.json({
      message: 'Team updated successfully',
      team: {
        id: team.id,
        teamName: team.team_name,
        createdAt: team.created_at,
        updatedAt: team.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error in updateTeam:', error);
    
    if (error instanceof Error && error.message.includes('No team found')) {
      return c.json({ error: 'Team not found' }, 404);
    }
    
    return c.json({ error: 'Failed to update team' }, 500);
  }
});

// Supprimer une équipe
teamController.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({ error: 'Invalid team ID' }, 400);
    }
    
    const team = await deleteTeam(id);
    
    return c.json({
      message: 'Team deleted successfully',
      team: {
        id: team.id,
        teamName: team.team_name,
        createdAt: team.created_at,
        updatedAt: team.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error in deleteTeam:', error);
    
    if (error instanceof Error && error.message.includes('No team found')) {
      return c.json({ error: 'Team not found' }, 404);
    }
    
    return c.json({ error: 'Failed to delete team' }, 500);
  }
});

export default teamController; 