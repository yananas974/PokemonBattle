interface BattleJournalProps {
  battleLog: any[];
}

export const BattleJournal = ({ battleLog }: BattleJournalProps) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📜 Journal de Combat</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {battleLog.slice(-8).map((entry: any, index: number) => {
          // Si c'est une string simple
          if (typeof entry === 'string') {
            return (
              <div key={index} className="bg-gray-100 rounded p-2 text-sm text-gray-700">
                {entry}
              </div>
            );
          }
          
          // Si c'est un objet TurnAction avec détails
          if (entry && typeof entry === 'object' && entry.move) {
            return (
              <div key={index} className="bg-white border rounded-lg p-3 text-sm">
                {/* En-tête de l'attaque */}
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-gray-800">
                    {entry.attacker?.name_fr || 'Pokémon'} utilise {entry.move.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Tour {entry.turn}
                  </div>
                </div>
                
                {/* Détails des dégâts */}
                {entry.damage > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-2 mb-2">
                    <div className="text-xs text-red-800 space-y-1">
                      <div className="flex justify-between">
                        <span>🗡️ Dégâts de base:</span>
                        <span className="font-mono">{entry.move.power || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>⚡ Efficacité type:</span>
                        <span className="font-mono">×{entry.typeEffectiveness || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🎯 Critique:</span>
                        <span className="font-mono">{entry.isCritical ? '×2' : '×1'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🌤️ Bonus météo:</span>
                        <span className="font-mono">×{entry.weatherBonus || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🔥 STAB:</span>
                        <span className="font-mono">{entry.stab ? '×1.5' : '×1'}</span>
                      </div>
                      
                      {/* Calcul intermédiaire */}
                      {(() => {
                        const basePower = entry.move.power || 0;
                        const typeEff = entry.typeEffectiveness || 1;
                        const critical = entry.isCritical ? 2 : 1;
                        const weather = entry.weatherBonus || 1;
                        const stab = entry.stab ? 1.5 : 1;
                        const theoretical = basePower * typeEff * critical * weather * stab;
                        
                        return (
                          <>
                            <hr className="border-red-300" />
                            <div className="flex justify-between text-blue-700">
                              <span>🧮 Calcul théorique:</span>
                              <span className="font-mono">{basePower} × {typeEff} × {critical} × {weather} × {stab} = {Math.round(theoretical)}</span>
                            </div>
                            {/* Afficher les stats d'attaque et défense si disponibles */}
                            {entry.attacker && (
                              <div className="flex justify-between text-green-700">
                                <span>💪 Attaque {entry.attacker.name_fr}:</span>
                                <span className="font-mono">{entry.attacker.effective_attack || entry.attacker.base_attack || 'N/A'}</span>
                              </div>
                            )}
                            {entry.defender && (
                              <div className="flex justify-between text-purple-700">
                                <span>🛡️ Défense {entry.defender.name_fr}:</span>
                                <span className="font-mono">{entry.defender.effective_defense || entry.defender.base_defense || 'N/A'}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      
                      <hr className="border-red-200" />
                      <div className="flex justify-between font-bold">
                        <span>💥 Total infligé:</span>
                        <span className="font-mono text-red-600">{entry.damage} HP</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Description et HP restants */}
                <div className="text-gray-600 text-xs">
                  {entry.description}
                </div>
                {entry.remainingHP !== undefined && (
                  <div className="text-right text-xs text-gray-500 mt-1">
                    HP restants: {entry.remainingHP}
                  </div>
                )}
              </div>
            );
          }
          
          // Fallback pour autres types d'entrées
          return (
            <div key={index} className="bg-gray-100 rounded p-2 text-sm text-gray-700">
              {entry.description || entry.message || JSON.stringify(entry)}
            </div>
          );
        })}
        {battleLog.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">⚔️</div>
            <p>Le combat commence...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleJournal;