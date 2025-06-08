import { apiCall, handleApiError } from '~/utils/api';
import type { CreateTeamData, TeamsResponse, CreateTeamResponse } from '~/types/team';

export const teamService = {
  // Créer une nouvelle équipe
  async createTeam(data: CreateTeamData): Promise<CreateTeamResponse> {
    const response = await apiCall('/api/teams/createTeam', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await handleApiError(response);
    return response.json();
  },

  // Créer une nouvelle équipe avec token
  async createTeamWithToken(data: CreateTeamData, token: string): Promise<CreateTeamResponse> {
    const response = await apiCall('/api/teams/createTeam', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleApiError(response);
    return response.json();
  },

  // Récupérer toutes les équipes de l'utilisateur connecté
  async getMyTeams(): Promise<TeamsResponse> {
    const response = await apiCall('/api/teams/myTeams');
    await handleApiError(response);
    return response.json();
  },

  // Récupérer toutes les équipes avec cookies personnalisés (pour SSR)
  async getMyTeamsWithCookies(cookieHeader: string | null): Promise<TeamsResponse> {
    const response = await apiCall('/api/teams/myTeams', {
      headers: cookieHeader ? { 'Cookie': cookieHeader } : {}
    });
    await handleApiError(response);
    return response.json();
  },

  // Récupérer toutes les équipes avec token d'authentification
  async getMyTeamsWithToken(token: string): Promise<TeamsResponse> {
    const response = await apiCall('/api/teams/myTeams', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleApiError(response);
    return response.json();
  },

  // Supprimer une équipe
  async deleteTeam(teamId: number): Promise<{ message: string }> {
    const response = await apiCall(`/api/teams/${teamId}`, {
      method: 'DELETE',
    });
    await handleApiError(response);
    return response.json();
  },

  // Supprimer une équipe avec token
  async deleteTeamWithToken(teamId: number, token: string): Promise<{ message: string }> {
    const response = await apiCall(`/api/teams/${teamId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await handleApiError(response);
    return response.json();
  },
}; 