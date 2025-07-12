import React, { useState, useEffect } from 'react';
import { ModernCard } from './ui/ModernCard';
import { ModernButton } from './ui/ModernButton';
import type { BattleState } from '~/types/battle';

interface HackChallengeModalProps {
  currentBattle: BattleState;
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (answer: string) => Promise<void>;
}

export const HackChallengeModal: React.FC<HackChallengeModalProps> = ({
  currentBattle,
  isVisible,
  onClose,
  onSubmit
}) => {
  const [hackAnswer, setHackAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (!isVisible) {
      setHackAnswer('');
      setIsLoading(false);
    }
  }, [isVisible]);

  const handleSubmit = async (answer = hackAnswer) => {
    if (!answer.trim()) return;
    
    setIsLoading(true);
    try {
      await onSubmit(answer.trim());
      // Ne pas fermer automatiquement - laissons la logique parent décider
    } catch (error) {
      console.error('Erreur lors de la soumission du hack:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbandon = async () => {
    await handleSubmit('ABANDON');
  };

  // Ne pas afficher si pas visible ou pas de hack challenge
  if (!isVisible || !currentBattle.hackChallenge) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <ModernCard className="border-2 border-red-500/50 bg-red-500/5 max-w-2xl w-full">
        <div className="space-y-6">
          {/* Header avec bouton de fermeture */}
          <div className="flex justify-between items-start">
            <div className="text-center flex-1">
              <div className="text-6xl mb-4 animate-pulse">🚨</div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">
                ALERTE SÉCURITÉ - DÉFI DE HACK !
              </h3>
              <p className="text-red-300 font-medium">
                🔒 Votre système a été compromis ! Résolvez ce défi immédiatement :
              </p>
            </div>
            
            {/* Bouton X pour fermer */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl font-bold ml-4 flex-shrink-0"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Difficulté</div>
              <div className="text-2xl font-bold text-red-400 uppercase">
                {currentBattle.hackChallenge?.difficulty}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Temps Restant</div>
              <div className="text-2xl font-bold text-red-400">
                ⏰ {currentBattle.hackChallenge?.time_limit}s
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-2">Code Chiffré :</div>
              <div className="bg-black/50 border border-green-500/30 rounded-lg p-4 text-center">
                <code className="text-green-400 font-mono text-xl">
                  {currentBattle.hackChallenge?.encrypted_code}
                </code>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Indice :</div>
              <p className="text-gray-300 bg-white/5 rounded-lg p-3">
                {currentBattle.hackChallenge?.explanation}
              </p>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="ENTREZ VOTRE RÉPONSE..."
                className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 uppercase text-center font-mono focus:outline-none focus:border-blue-500/50"
                value={hackAnswer}
                onChange={(e) => setHackAnswer(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && hackAnswer.trim()) {
                    handleSubmit();
                  }
                }}
                disabled={isLoading}
              />
              
              <div className="flex space-x-3">
                <ModernButton
                  variant="primary"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={!hackAnswer.trim() || isLoading}
                >
                  🔓 Décrypter
                </ModernButton>
                
                <ModernButton
                  variant="secondary"
                  onClick={handleAbandon}
                  disabled={isLoading}
                >
                  💀 Abandonner
                </ModernButton>
              </div>
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  );
}; 