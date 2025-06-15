import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { friendshipService } from '~/services/friendshipService';
import type { Team as BaseTeam } from '~/types/team';
import type { Pokemon } from '~/types/pokemon';
import { getUserFromSession } from '~/sessions';

// Étend Team pour inclure les pokémon
interface TeamWithPokemon extends BaseTeam {
  pokemon?: Pokemon[];
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const friendId = Number(params.friendId);
  if (!friendId) throw new Response('Ami introuvable', { status: 404 });

  const { user } = await getUserFromSession(request);
  if (!user || !user.backendToken) throw new Response('Non authentifié', { status: 401 });

  const res = await friendshipService.getFriendTeams(friendId, user.backendToken);
  return json({ teams: res.teams });
};

export default function FriendTeamsPage() {
  const { teams } = useLoaderData<{ teams: TeamWithPokemon[] }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <Link to="/dashboard" className="text-indigo-600 hover:underline mb-4 inline-block">← Retour au dashboard</Link>
        <h1 className="text-2xl font-bold mb-6">Équipes de l'ami</h1>
        {teams.length === 0 ? (
          <div className="text-gray-500">Cet utilisateur n'a pas encore d'équipe.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {teams.map((team) => (
              <div key={team.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h2 className="text-lg font-semibold mb-2">{team.teamName}</h2>
                <div className="text-xs text-gray-500 mb-2">Créée le {new Date(team.createdAt).toLocaleDateString('fr-FR')}</div>
                {team.pokemon && team.pokemon.length > 0 ? (
                  <div>
                    <div className="text-sm font-medium mb-1">Pokémon :</div>
                    <div className="flex flex-wrap gap-2">
                      {team.pokemon.map((poke) => (
                        <div key={poke.id} className="bg-white rounded shadow p-2 text-center w-20">
                          <img src={poke.sprite_url} alt={poke.nameFr} className="w-12 h-12 mx-auto mb-1" />
                          <div className="text-xs font-medium truncate">{poke.nameFr}</div>
                          <div className="text-xs text-gray-400">#{poke.id}</div>
                        </div>
                      ))}
                    </div>
                    <Link
                      to={`/battle?opponentTeamId=${team.id}`}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-4 inline-block"
                    >
                      Combattre cette équipe
                    </Link>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">Aucun Pokémon dans cette équipe</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 