import React, { useState } from 'react';
import { ModernCard } from './ui/ModernCard';
import { ModernButton } from './ui/ModernButton';
import type { BattleResult, TurnBasedResult } from '~/services/battleSimulationService';

interface BattleResultModalProps {
  isVisible: boolean;
  onClose: () => void;
  onNewBattle: () => void;
  onReturnToMenu: () => void;
  battleResult: BattleResult | TurnBasedResult | null;
  playerTeamName: string;
  enemyTeamName: string;
  battleMode: 'team' | 'turnbased';
}

export const BattleResultModal: React.FC<BattleResultModalProps> = ({
  isVisible,
  onClose,
  onNewBattle,
  onReturnToMenu,
  battleResult,
  playerTeamName,
  enemyTeamName,
  battleMode
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed-log' | 'stats'>('summary');

  // Debug logs
  console.log('🔍 BattleResultModal props:', {
    isVisible,
    hasResult: !!battleResult,
    playerTeamName,
    enemyTeamName,
    battleMode
  });

  if (!isVisible || !battleResult) {
    console.log('❌ Modal non affiché - isVisible:', isVisible, 'battleResult:', !!battleResult);
    return null;
  }

  console.log('✅ Modal devrait être affiché maintenant');

  const formatBattleLog = (result: BattleResult | TurnBasedResult) => {
    if ('battleLog' in result) {
      return result.battleLog;
    } else if ('combatLog' in result) {
      return result.combatLog;
    }
    return [];
  };

  const getWinner = () => {
    if ('winner' in battleResult) {
      return battleResult.winner;
    } else if ('battleState' in battleResult) {
      return battleResult.battleState.winner;
    }
    return 'Inconnu';
  };

  const getTotalTurns = () => {
    if ('totalTurns' in battleResult) {
      return battleResult.totalTurns;
    } else if ('battleState' in battleResult) {
      return battleResult.battleState.turn;
    }
    return 0;
  };

  const isPlayerWinner = () => {
    const winner = getWinner();
    return winner === 'team1' || winner === playerTeamName;
  };

  const getTimeBonus = () => {
    if ('timeBonus' in battleResult) {
      return battleResult.timeBonus;
    }
    return null;
  };

  // Analyse statistique du combat
  const getBattleStats = () => {
    const battleLog = formatBattleLog(battleResult);
    const stats = {
      totalDamage: 0,
      criticalHits: 0,
      stabMoves: 0,
      superEffectiveMoves: 0,
      notVeryEffectiveMoves: 0,
      normalEffectiveMoves: 0,
      moveTypes: {} as Record<string, number>,
      averageDamage: 0,
      maxDamage: 0,
      minDamage: Infinity
    };

    battleLog.forEach((action) => {
      stats.totalDamage += action.damage;
      
      if (action.isCritical) stats.criticalHits++;
      if (action.stab) stats.stabMoves++;
      
      if (action.typeEffectiveness > 1) stats.superEffectiveMoves++;
      else if (action.typeEffectiveness < 1) stats.notVeryEffectiveMoves++;
      else stats.normalEffectiveMoves++;
      
      // Compter les types d'attaques
      stats.moveTypes[action.moveType] = (stats.moveTypes[action.moveType] || 0) + 1;
      
      // Min/Max dégâts
      if (action.damage > stats.maxDamage) stats.maxDamage = action.damage;
      if (action.damage < stats.minDamage) stats.minDamage = action.damage;
    });

    stats.averageDamage = battleLog.length > 0 ? Math.round(stats.totalDamage / battleLog.length) : 0;
    if (stats.minDamage === Infinity) stats.minDamage = 0;

    return stats;
  };

  const battleStats = getBattleStats();

  // Obtenir l'efficacité des types en emoji
  const getEffectivenessEmoji = (effectiveness: number) => {
    if (effectiveness > 1) return '🔥'; // Super efficace
    if (effectiveness < 1) return '❄️'; // Peu efficace
    return '⚡'; // Efficacité normale
  };

  const getEffectivenessText = (effectiveness: number) => {
    if (effectiveness > 1) return 'Super efficace';
    if (effectiveness < 1) return 'Peu efficace';
    return 'Efficacité normale';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <ModernCard 
        variant="glass" 
        className="max-w-6xl w-full max-h-[95vh] overflow-hidden bg-gradient-to-br from-purple-900/90 to-indigo-900/90 border-2 border-purple-400/50"
      >
        <div className="p-6 space-y-4 h-full flex flex-col">
          {/* Header avec bouton de fermeture */}
          <div className="flex justify-between items-start flex-shrink-0">
            <div className="text-center flex-1">
              <div className="text-6xl mb-2 animate-bounce">
                {isPlayerWinner() ? '🏆' : '😔'}
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {isPlayerWinner() ? 'VICTOIRE !' : 'DÉFAITE !'}
              </h2>
              <p className="text-white/80 text-sm">
                Combat {battleMode === 'team' ? 'd\'équipe' : 'tour par tour'} terminé
              </p>
            </div>
            
            {/* Bouton X pour fermer */}
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-2xl font-bold ml-4 flex-shrink-0 hover:scale-110 transition-all duration-200"
            >
              ✕
            </button>
          </div>

          {/* Onglets de navigation */}
          <div className="flex justify-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'summary' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              📊 Résumé
            </button>
            <button
              onClick={() => setActiveTab('detailed-log')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'detailed-log' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              📜 Journal Détaillé
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'stats' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              📈 Statistiques
            </button>
          </div>

          {/* Contenu des onglets */}
          <div className="flex-1 overflow-y-auto">
            {/* Onglet Résumé */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                {/* Résumé du combat */}
                <ModernCard variant="glass" className="bg-white/10">
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-3 text-center">
                      📊 RÉSUMÉ DU COMBAT
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Équipe du joueur */}
                      <div className="text-center">
                        <div className={`text-2xl mb-2 ${isPlayerWinner() ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {isPlayerWinner() ? '👑' : '💀'}
                        </div>
                        <div className="text-white font-bold text-lg">
                          {playerTeamName}
                        </div>
                        <div className="text-white/70 text-sm">
                          Votre équipe
                        </div>
                      </div>

                      {/* VS et statistiques */}
                      <div className="text-center">
                        <div className="text-4xl mb-2">⚔️</div>
                        <div className="text-white font-bold text-lg">
                          {getTotalTurns()} tours
                        </div>
                        <div className="text-white/70 text-sm">
                          Durée du combat
                        </div>
                        {getTimeBonus() && (
                          <div className="text-yellow-400 text-xs mt-1">
                            +{getTimeBonus()} bonus temps
                          </div>
                        )}
                      </div>

                      {/* Équipe adverse */}
                      <div className="text-center">
                        <div className={`text-2xl mb-2 ${!isPlayerWinner() ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {!isPlayerWinner() ? '👑' : '💀'}
                        </div>
                        <div className="text-white font-bold text-lg">
                          {enemyTeamName}
                        </div>
                        <div className="text-white/70 text-sm">
                          Équipe adverse
                        </div>
                      </div>
                    </div>

                    {/* Vainqueur en grand */}
                    <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                      <div className="text-center">
                        <div className="text-yellow-200 font-bold text-xl">
                          🏆 VAINQUEUR: {getWinner()}
                        </div>
                      </div>
                    </div>
                  </div>
                </ModernCard>

                {/* Aperçu des statistiques rapides */}
                <ModernCard variant="glass" className="bg-green-500/20">
                  <div className="p-4">
                    <h4 className="text-white font-bold text-lg mb-3 flex items-center">
                      <span className="mr-2">⚡</span>
                      APERÇU RAPIDE
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      <div>
                        <div className="text-2xl">💥</div>
                        <div className="text-white font-bold">{battleStats.totalDamage}</div>
                        <div className="text-white/70 text-xs">Dégâts totaux</div>
                      </div>
                      <div>
                        <div className="text-2xl">⚡</div>
                        <div className="text-white font-bold">{battleStats.criticalHits}</div>
                        <div className="text-white/70 text-xs">Coups critiques</div>
                      </div>
                      <div>
                        <div className="text-2xl">🔥</div>
                        <div className="text-white font-bold">{battleStats.superEffectiveMoves}</div>
                        <div className="text-white/70 text-xs">Super efficaces</div>
                      </div>
                      <div>
                        <div className="text-2xl">🌟</div>
                        <div className="text-white font-bold">{battleStats.stabMoves}</div>
                        <div className="text-white/70 text-xs">Bonus STAB</div>
                      </div>
                    </div>
                  </div>
                </ModernCard>

                {/* Effets météo */}
                {battleResult && 'weatherEffects' in battleResult && battleResult.weatherEffects && (
                  <ModernCard variant="glass" className="bg-blue-500/20">
                    <div className="p-4">
                      <h4 className="text-white font-bold text-lg mb-3 flex items-center">
                        <span className="mr-2">🌤️</span>
                        EFFETS MÉTÉO
                      </h4>
                      <div className="space-y-2">
                        {battleResult.weatherEffects.map((effect, index) => (
                          <div key={index} className="bg-white/10 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <div className="text-blue-200 font-medium">{effect.name}</div>
                              <div className="text-blue-300 text-sm">x{effect.multiplier}</div>
                            </div>
                            <div className="text-blue-200/80 text-sm">{effect.description}</div>
                            <div className="text-blue-300 text-xs mt-1">
                              Affecte: {effect.affectedTypes.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ModernCard>
                )}
              </div>
            )}

            {/* Onglet Journal Détaillé */}
            {activeTab === 'detailed-log' && (
              <ModernCard variant="glass" className="bg-white/5">
                <div className="p-4">
                  <h4 className="text-white font-bold text-lg mb-3 flex items-center">
                    <span className="mr-2">📜</span>
                    JOURNAL DE COMBAT DÉTAILLÉ
                  </h4>
                  
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {formatBattleLog(battleResult).map((action, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4 border-l-4 border-white/20">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                              Tour {action.turn}
                            </span>
                            <span className="text-white font-medium">
                              {action.attacker}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              action.isCritical ? 'text-red-400' : 'text-white'
                            }`}>
                              {action.damage} dégâts
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-white/80">
                              <strong>Attaque:</strong> {action.move}
                            </div>
                            <div className="text-white/80">
                              <strong>Type:</strong> {action.moveType}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span>{getEffectivenessEmoji(action.typeEffectiveness)}</span>
                              <span className="text-white/80">
                                {getEffectivenessText(action.typeEffectiveness)} (x{action.typeEffectiveness})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {action.stab && (
                                <>
                                  <span>🌟</span>
                                  <span className="text-white/80">Bonus STAB</span>
                                </>
                              )}
                            </div>
                            {action.isCritical && (
                              <div className="flex items-center space-x-2">
                                <span>💥</span>
                                <span className="text-red-400 font-bold">COUP CRITIQUE!</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2 text-white/60 text-sm italic">
                          {action.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>
            )}

            {/* Onglet Statistiques */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <ModernCard variant="glass" className="bg-yellow-500/20">
                  <div className="p-4">
                    <h4 className="text-white font-bold text-lg mb-3 flex items-center">
                      <span className="mr-2">📈</span>
                      STATISTIQUES DÉTAILLÉES
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="text-center bg-white/10 rounded-lg p-3">
                        <div className="text-2xl mb-1">💥</div>
                        <div className="text-white font-bold text-xl">{battleStats.totalDamage}</div>
                        <div className="text-white/70 text-sm">Dégâts totaux</div>
                      </div>
                      
                      <div className="text-center bg-white/10 rounded-lg p-3">
                        <div className="text-2xl mb-1">📊</div>
                        <div className="text-white font-bold text-xl">{battleStats.averageDamage}</div>
                        <div className="text-white/70 text-sm">Dégâts moyens</div>
                      </div>
                      
                      <div className="text-center bg-white/10 rounded-lg p-3">
                        <div className="text-2xl mb-1">🔥</div>
                        <div className="text-white font-bold text-xl">{battleStats.maxDamage}</div>
                        <div className="text-white/70 text-sm">Dégâts max</div>
                      </div>
                      
                      <div className="text-center bg-white/10 rounded-lg p-3">
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="text-white font-bold text-xl">{battleStats.criticalHits}</div>
                        <div className="text-white/70 text-sm">Coups critiques</div>
                      </div>
                      
                      <div className="text-center bg-white/10 rounded-lg p-3">
                        <div className="text-2xl mb-1">🌟</div>
                        <div className="text-white font-bold text-xl">{battleStats.stabMoves}</div>
                        <div className="text-white/70 text-sm">Bonus STAB</div>
                      </div>
                      
                      <div className="text-center bg-white/10 rounded-lg p-3">
                        <div className="text-2xl mb-1">🎯</div>
                        <div className="text-white font-bold text-xl">
                          {((battleStats.criticalHits / formatBattleLog(battleResult).length) * 100).toFixed(1)}%
                        </div>
                        <div className="text-white/70 text-sm">Taux critique</div>
                      </div>
                    </div>
                  </div>
                </ModernCard>

                <ModernCard variant="glass" className="bg-purple-500/20">
                  <div className="p-4">
                    <h4 className="text-white font-bold text-lg mb-3">🎯 EFFICACITÉ DES TYPES</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-red-500/20 rounded-lg p-3">
                        <div className="text-2xl mb-1">🔥</div>
                        <div className="text-white font-bold">{battleStats.superEffectiveMoves}</div>
                        <div className="text-white/70 text-xs">Super efficace</div>
                      </div>
                      <div className="bg-gray-500/20 rounded-lg p-3">
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="text-white font-bold">{battleStats.normalEffectiveMoves}</div>
                        <div className="text-white/70 text-xs">Efficacité normale</div>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-3">
                        <div className="text-2xl mb-1">❄️</div>
                        <div className="text-white font-bold">{battleStats.notVeryEffectiveMoves}</div>
                        <div className="text-white/70 text-xs">Peu efficace</div>
                      </div>
                    </div>
                  </div>
                </ModernCard>

                <ModernCard variant="glass" className="bg-indigo-500/20">
                  <div className="p-4">
                    <h4 className="text-white font-bold text-lg mb-3">⚔️ TYPES D'ATTAQUES UTILISÉES</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(battleStats.moveTypes).map(([type, count]) => (
                        <div key={type} className="bg-white/10 rounded-lg p-2 text-center">
                          <div className="text-white font-medium text-sm">{type}</div>
                          <div className="text-white/70 text-xs">{count} utilisé{count > 1 ? 's' : ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ModernCard>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-shrink-0">
            <ModernButton
              onClick={onNewBattle}
              variant="pokemon"
              size="lg"
              className="flex items-center justify-center space-x-2"
            >
              <span className="text-xl">🔄</span>
              <span>NOUVEAU COMBAT</span>
            </ModernButton>
            
            <ModernButton
              onClick={onReturnToMenu}
              variant="secondary"
              size="lg"
              className="flex items-center justify-center space-x-2"
            >
              <span className="text-xl">🏠</span>
              <span>RETOUR AU MENU</span>
            </ModernButton>
            
            <ModernButton
              onClick={onClose}
              variant="primary"
              size="lg"
              className="flex items-center justify-center space-x-2"
            >
              <span className="text-xl">✨</span>
              <span>CONTINUER</span>
            </ModernButton>
          </div>
        </div>
      </ModernCard>
    </div>
  );
}; 