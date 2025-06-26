import { Team } from "../interfaces/team.interface.js";

export type BattleTeam = Pick<Team, 'id' | 'teamName' | 'pokemon' | 'userId'>
