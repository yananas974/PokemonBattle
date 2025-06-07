import { db } from "../../config/drizzle.config";
import { Team } from "../../db/schema";
import { eq } from "drizzle-orm";

export const CreateTeam = async (teamName: string, userId?: number) => {
  try {
    const result = await db.insert(Team).values({
      team_name: teamName,
      // Si vous voulez lier les équipes aux utilisateurs, ajoutez :
      // user_id: userId
    }).returning();
    
    if (!result[0]) {
      throw new Error('No team returned after insert');
    }
    
    console.log('Team created:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error in CreateTeam:', error);
    throw error;
  }
};

export const getTeams = async () => {
  try {
    const result = await db.select().from(Team);
    return result;
  } catch (error) {
    console.error('Error in getTeams:', error);
    throw error;
  }
};

export const getTeamById = async (id: number) => {
  try {
    const result = await db.select().from(Team).where(eq(Team.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Error in getTeamById:', error);
    throw error;
  }
};

export const updateTeam = async (id: number, teamName: string) => {
  try {
    const result = await db.update(Team)
      .set({ 
        team_name: teamName,
        updated_at: new Date()
      })
      .where(eq(Team.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error(`No team found with id ${id}`);
    }
    
    console.log('Team updated:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error in updateTeam:', error);
    throw error;
  }
};

export const deleteTeam = async (id: number) => {
  try {
    const result = await db.delete(Team)
      .where(eq(Team.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error(`No team found with id ${id}`);
    }
    
    console.log('Team deleted:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error in deleteTeam:', error);
    throw error;
  }
};