import { Hono } from "hono";
import { createTeam, getTeamByUserId, getTeamById, updateTeam, deleteTeam, getAllTeams } from '../../services/createTeamService/teamService.js';
import { getUserById } from "../../services/authService/userService.js";
import jwt from "jsonwebtoken";
import { getCookie } from 'hono/cookie';
import { Team } from "../../models/interfaces/team.interface.js";

const teamController = new Hono();

// Middleware d'authentification
const authMiddleware = async (c: any, next: any) => {
  const token = getCookie(c, 'authToken');
  if (!token) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    const user = await getUserById(Number(payload.sub));
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    (c as any).user = user;
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};

// Créer une équipe
teamController.post('/createTeam', async (c) => {
  let token = getCookie(c, 'authToken');
  const authHeader = c.req.header('authorization');
  
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
  }
  
  if (!token) return c.json({ error: 'User not authenticated' }, 401);
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    const user = await getUserById(Number(payload.sub));
    if (!user) return c.json({ error: 'User not found' }, 404);

    const { teamName } = await c.req.json();

    if (!teamName) {
      return c.json({ error: 'Team name is required' }, 400);
    }

    const team = await createTeam(teamName, user.id);
    return c.json({
      message: 'Team created successfully',
      team: {
        id: team.id,
        teamName: team.team_name,
        userId: team.user_id,
        createdAt: team.created_at,
        updatedAt: team.updated_at
      }
    });
  } catch (error) {
    console.error('Error in createTeam:', error);
    return c.json({ error: 'Failed to create team' }, 500);
  }
});

// Récupérer toutes les équipes de l'utilisateur connecté
teamController.get('/myTeams', async (c) => {
  console.log('=== DEBUG TEAMS ENDPOINT ===');
  console.log('Headers reçus:', Object.fromEntries(c.req.raw.headers));
  
  // Essayer d'abord les cookies, puis le header Authorization
  let token = getCookie(c, 'authToken');
  const authHeader = c.req.header('authorization');
  
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
    console.log('Token trouvé dans Authorization header');
  }
  
  console.log('Token récupéré:', token ? 'TOKEN PRÉSENT' : 'AUCUN TOKEN');
  
  if (!token) return c.json({ error: 'User not authenticated' }, 401);
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    const user = await getUserById(Number(payload.sub));
    if (!user) return c.json({ error: 'User not found' }, 404);

    const teams = await getTeamByUserId(user.id);
    
    return c.json({
      message: 'Teams retrieved successfully',
      teams: teams.map((team: any) => ({
        id: team.id,
        teamName: team.team_name,
        userId: team.user_id,
        createdAt: team.created_at,
        updatedAt: team.updated_at
      }))
    });
  } catch (error) {
    console.error('Error in getTeams:', error);
    return c.json({ error: 'Failed to retrieve teams' }, 500);
  }
});

// Supprimer une équipe
teamController.delete('/:id', async (c) => {
  let token = getCookie(c, 'authToken');
  const authHeader = c.req.header('authorization');
  
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
  }
  
  if (!token) return c.json({ error: 'User not authenticated' }, 401);
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    const user = await getUserById(Number(payload.sub));
    if (!user) return c.json({ error: 'User not found' }, 404);

    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid team ID' }, 400);
    }

    const existingTeam: any = await getTeamById(id);
    if (!existingTeam) {
      return c.json({ error: 'Team not found' }, 404);
    }

    if (existingTeam.user_id !== user.id) {
      return c.json({ error: 'Unauthorized access to this team' }, 403);
    }
    
    const deletedTeam = await deleteTeam(id);
    
    return c.json({
      message: 'Team deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteTeam:', error);
    return c.json({ error: 'Failed to delete team' }, 500);
  }
});

export default teamController; 