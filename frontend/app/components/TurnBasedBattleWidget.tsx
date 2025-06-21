import { useState } from 'react';

export default function TurnBasedBattleWidget({ userTeams, friendTeams }: any) {
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [battleState, setBattleState] = useState<any>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  const startBattle = async () => {
    if (!selectedTeam1 || !selectedTeam2) return;

    const team1 = [...userTeams, ...friendTeams].find(t => t.id === selectedTeam1);
    const team2 = [...userTeams, ...friendTeams].find(t => t.id === selectedTeam2);

    setLoading(true);
    try {
      const response = await fetch('/api/battle/turn-based', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team1, team2, mode: 'full' })
      });

      const data = await response.json();
      setBattleState(data.battleState);
      setCurrentTurnIndex(0);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextTurn = () => {
    if (battleState && currentTurnIndex < battleState.battleLog.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTurnIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevTurn = () => {
    if (currentTurnIndex > 0) {
      setCurrentTurnIndex(prev => prev - 1);
    }
  };

  const playAllTurns = () => {
    if (!battleState) return;
    
    let index = 0;
    const interval = setInterval(() => {
      if (index >= battleState.battleLog.length - 1) {
        clearInterval(interval);
        return;
      }
      setCurrentTurnIndex(index + 1);
      index++;
    }, 1000);
  };

  const currentAction = battleState?.battleLog[currentTurnIndex];
  const isLastTurn = currentTurnIndex === battleState?.battleLog.length - 1;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">🎮 Combat Tour par Tour</h2>
      
      {!battleState ? (
        // ✅ Sélection des équipes
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Équipe 1</label>
              <select 
                value={selectedTeam1} 
                onChange={(e) => setSelectedTeam1(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Choisir...</option>
                {userTeams.map((team: any) => (
                  <option key={team.id} value={team.id}>
                    🔵 {team.teamName} ({team.pokemon.length})
                  </option>
                ))}
                {friendTeams.map((team: any) => (
                  <option key={team.id} value={team.id}>
                    👥 {team.teamName} ({team.pokemon.length})
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
                <option value="">Choisir...</option>
                {userTeams.map((team: any) => (
                  <option key={team.id} value={team.id}>
                    🔵 {team.teamName} ({team.pokemon.length})
                  </option>
                ))}
                {friendTeams.map((team: any) => (
                  <option key={team.id} value={team.id}>
                    👥 {team.teamName} ({team.pokemon.length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={startBattle}
            disabled={loading || !selectedTeam1 || !selectedTeam2}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? '🎮 Préparation...' : '🎮 DÉMARRER COMBAT TOUR PAR TOUR'}
          </button>
        </div>
      ) : (
        // ✅ Interface de combat
        <div className="space-y-6">
          {/* Statut du combat */}
          <div className="text-center">
            <h3 className="text-xl font-bold">
              Tour {currentTurnIndex + 1} / {battleState.battleLog.length}
            </h3>
            {battleState.winner && isLastTurn && (
              <div className="text-2xl font-bold text-green-600 mt-2">
                🏆 {battleState.winner === 'team1' ? 'Équipe 1' : 'Équipe 2'} GAGNE !
              </div>
            )}
          </div>

          {/* Action actuelle */}
          {currentAction && (
            <div className={`bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-lg border-2 border-orange-300 ${isAnimating ? 'animate-pulse' : ''}`}>
              <div className="text-lg font-bold text-center mb-2">
                {currentAction.description}
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  💥 <strong>{currentAction.damage}</strong> dégâts
                  {currentAction.isCritical && <span className="text-red-600 font-bold"> (CRITIQUE!)</span>}
                </div>
                <div>
                  ❤️ {currentAction.remainingHP} HP restants
                  {currentAction.isKO && <span className="text-red-600 font-bold"> (K.O.!)</span>}
                </div>
              </div>
            </div>
          )}

          {/* Équipes */}
          <div className="grid grid-cols-2 gap-6">
            {/* Équipe 1 */}
            <div className="border-2 border-blue-300 rounded-lg p-4">
              <h4 className="font-bold text-blue-700 mb-2">🔵 Équipe 1</h4>
              <div className="space-y-2">
                {battleState.team1Pokemon.map((pokemon: any, index: number) => (
                  <div key={index} className={`flex items-center space-x-2 p-2 rounded ${pokemon.is_ko ? 'bg-gray-200 opacity-50' : 'bg-blue-50'}`}>
                    <img src={pokemon.sprite_url} alt={pokemon.name_fr} className="w-8 h-8" />
                    <div className="flex-1">
                      <div className="font-medium">{pokemon.name_fr}</div>
                      <div className="text-xs text-gray-600">{pokemon.weatherStatus}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {pokemon.current_hp}/{Math.round(pokemon.base_hp * pokemon.weatherMultiplier)}
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${pokemon.current_hp > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.max(0, (pokemon.current_hp / (pokemon.base_hp * pokemon.weatherMultiplier)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Équipe 2 */}
            <div className="border-2 border-red-300 rounded-lg p-4">
              <h4 className="font-bold text-red-700 mb-2">🔴 Équipe 2</h4>
              <div className="space-y-2">
                {battleState.team2Pokemon.map((pokemon: any, index: number) => (
                  <div key={index} className={`flex items-center space-x-2 p-2 rounded ${pokemon.is_ko ? 'bg-gray-200 opacity-50' : 'bg-red-50'}`}>
                    <img src={pokemon.sprite_url} alt={pokemon.name_fr} className="w-8 h-8" />
                    <div className="flex-1">
                      <div className="font-medium">{pokemon.name_fr}</div>
                      <div className="text-xs text-gray-600">{pokemon.weatherStatus}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {pokemon.current_hp}/{Math.round(pokemon.base_hp * pokemon.weatherMultiplier)}
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${pokemon.current_hp > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.max(0, (pokemon.current_hp / (pokemon.base_hp * pokemon.weatherMultiplier)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={prevTurn}
              disabled={currentTurnIndex === 0}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
            >
              ⬅️ Précédent
            </button>
            
            <button
              onClick={playAllTurns}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              ▶️ Auto
            </button>
            
            <button
              onClick={nextTurn}
              disabled={isLastTurn}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
            >
              Suivant ➡️
            </button>
          </div>

          <button
            onClick={() => setBattleState(null)}
            className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
          >
            🔄 Nouveau Combat
          </button>
        </div>
      )}
    </div>
  );
} 