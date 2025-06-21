import { useState } from 'react';
import { Form } from '@remix-run/react';

interface Team {
  id: string;
  teamName: string;
  pokemon: Array<{
    pokemon_id: number;
    name_fr: string;
    type: string;
    base_hp: number;
    base_attack: number;
    base_defense: number;
    sprite_url: string;
  }>;
}

interface TeamBattleWidgetProps {
  userTeams: Team[];
  friendTeams: Team[];
}

export default function TeamBattleWidget({ userTeams, friendTeams }: TeamBattleWidgetProps) {
  const [selectedTeam1, setSelectedTeam1] = useState<string>('');
  const [selectedTeam2, setSelectedTeam2] = useState<string>('');
  const [battleResult, setBattleResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const simulateBattle = async () => {
    if (!selectedTeam1 || !selectedTeam2) {
      alert('Sélectionnez deux équipes !');
      return;
    }

    const team1 = [...userTeams, ...friendTeams].find(t => t.id === selectedTeam1);
    const team2 = [...userTeams, ...friendTeams].find(t => t.id === selectedTeam2);

    if (!team1 || !team2) return;

    setLoading(true);
    try {
      const response = await fetch('/api/battle/team-battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team1, team2, lat: 48.8566, lon: 2.3522 })
      });

      const data = await response.json();
      setBattleResult(data.result);
    } catch (error) {
      console.error('Erreur combat:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">⚔️ Combat d'Équipes</h2>
      
      {/* Sélection des équipes */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Équipe 1</label>
          <select 
            value={selectedTeam1} 
            onChange={(e) => setSelectedTeam1(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choisir une équipe...</option>
            {userTeams.map(team => (
              <option key={team.id} value={team.id}>
                🔵 {team.teamName} ({team.pokemon.length} Pokémon)
              </option>
            ))}
            {friendTeams.map(team => (
              <option key={team.id} value={team.id}>
                👥 {team.teamName} ({team.pokemon.length} Pokémon)
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Équipe 2</label>
          <select 
            value={selectedTeam2} 
            onChange={(e) => setSelectedTeam2(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choisir une équipe...</option>
            {userTeams.map(team => (
              <option key={team.id} value={team.id}>
                🔵 {team.teamName} ({team.pokemon.length} Pokémon)
              </option>
            ))}
            {friendTeams.map(team => (
              <option key={team.id} value={team.id}>
                👥 {team.teamName} ({team.pokemon.length} Pokémon)
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={simulateBattle}
        disabled={loading || !selectedTeam1 || !selectedTeam2}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? '⚔️ Combat en cours...' : '⚔️ LANCER LE COMBAT !'}
      </button>

      {/* Résultats */}
      {battleResult && (
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold">
              🏆 {battleResult.winner === 'team1' ? 'Équipe 1' : battleResult.winner === 'team2' ? 'Équipe 2' : 'Match nul'} !
            </h3>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold mb-2">📜 Journal de Combat:</h4>
            <div className="text-sm space-y-1 max-h-60 overflow-y-auto">
              {battleResult.battleLog.map((log: string, index: number) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 