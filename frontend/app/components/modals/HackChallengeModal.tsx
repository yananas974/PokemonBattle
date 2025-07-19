import React, { useState, useEffect, useCallback } from 'react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import type { InteractiveBattleData } from '@pokemon-battle/shared';
interface HackChallengeModalProps {
  currentBattle: InteractiveBattleData;
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (answer: string) => Promise<{ success: boolean; message?: string }>;
}

export const HackChallengeModal: React.FC<HackChallengeModalProps> = ({
  currentBattle,
  isVisible,
  onClose,
  onSubmit
}) => {
  const [hackAnswer, setHackAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  const handleSubmit = useCallback(async (answer = hackAnswer) => {
    // Vérifier que answer est une string
    const answerStr = typeof answer === 'string' ? answer : String(answer);
    if (!answerStr.trim() && answerStr !== 'TIMEOUT') return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const result = await onSubmit(answerStr.trim());
      
      // Note: Le résultat réel vient du backend via les fetchers
      // Cette fonction ne fait que soumettre la réponse
      // Le modal restera ouvert jusqu'à ce que currentBattle.isHackActive devienne false
      
    } catch (error) {
      // Vider l'input et afficher un message d'erreur
      setHackAnswer('');
      setErrorMessage('❌ Erreur de connexion. Réessayez...');
      
      // Faire trembler le modal
      const modal = document.querySelector('.hack-modal');
      if (modal) {
        modal.classList.add('animate-pulse');
        setTimeout(() => modal.classList.remove('animate-pulse'), 1000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [hackAnswer, onSubmit]);

  const handleAbandon = async () => {
    await handleSubmit('ABANDON');
  };

  // Timer en temps réel
  useEffect(() => {
    if (!isVisible || !currentBattle.hackChallenge) return;
    
    // Initialiser le timer
    const startTime = Date.now();
    const timeLimit = currentBattle.hackChallenge.time_limit * 1000; // convertir en ms
    setTimeLeft(currentBattle.hackChallenge.time_limit);
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((timeLimit - elapsed) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
        // Appeler handleSubmit avec une string directement
        handleSubmit('TIMEOUT');
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isVisible, currentBattle.hackChallenge?.id]); // ✅ Utiliser l'ID du challenge plutôt que handleSubmit

  useEffect(() => {
    if (!isVisible) {
      setHackAnswer('');
      setIsLoading(false);
      setErrorMessage('');
      setTimeLeft(0);
    }
  }, [isVisible]);

  // Afficher les messages d'erreur du backend
  useEffect(() => {
    if (isVisible && currentBattle.hackChallenge && currentBattle.battleLog) {
      // Chercher le dernier message de hack dans le log
      const lastHackMessage = currentBattle.battleLog
        .filter(log => log.phase === 'hack_failure' || log.phase === 'hack_error')
        .pop();
      
      if (lastHackMessage && lastHackMessage.description) {
        setErrorMessage(lastHackMessage.description);
        setHackAnswer('');
        
        // Faire trembler le modal
        const modal = document.querySelector('.hack-modal');
        if (modal) {
          modal.classList.add('animate-pulse');
          setTimeout(() => modal.classList.remove('animate-pulse'), 1000);
        }
      }
    }
  }, [isVisible, currentBattle.battleLog, currentBattle.hackChallenge]);

  // Ne pas afficher si pas visible ou pas de hack challenge
  if (!isVisible || !currentBattle.hackChallenge) { 
    return null;
  }
  

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <ModernCard className="hack-modal border-2 border-red-500/50 bg-red-500/5 max-w-2xl w-full">
        
        
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
              onClick={() => {
                onClose();
              }}
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
                {currentBattle.hackChallenge.difficulty}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Temps Restant</div>
              <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
                ⏰ {timeLeft}s
              </div>
              {/* Barre de progression */}
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${currentBattle.hackChallenge ? (timeLeft / currentBattle.hackChallenge.time_limit) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-2">Code Chiffré :</div>
              <div className="bg-black/50 border border-green-500/30 rounded-lg p-4 text-center">
                <code className="text-green-400 font-mono text-xl">
                  {currentBattle.hackChallenge.encrypted_code}
                </code>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Indice :</div>
              <p className="text-gray-300 bg-white/5 rounded-lg p-3">
                  {currentBattle.hackChallenge.explanation}
              </p>
            </div>
            
            <div className="space-y-3">
              {/* Message d'erreur */}
              {errorMessage && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
                  <p className="text-red-300 font-medium animate-pulse">
                    {errorMessage}
                  </p>
                </div>
              )}
              
              <input
                type="text"
                placeholder="ENTREZ VOTRE RÉPONSE..."
                className={`w-full p-4 bg-white/5 border rounded-lg text-white placeholder-gray-400 uppercase text-center font-mono focus:outline-none focus:border-blue-500/50 ${
                  errorMessage ? 'border-red-500/50 shake' : 'border-white/20'
                }`}
                value={hackAnswer}
                onChange={(e) => {
                  setHackAnswer(e.target.value.toUpperCase());
                  if (errorMessage) setErrorMessage(''); // Effacer l'erreur quand on recommence à taper
                }}
                onKeyDown={(e) => {
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

export default HackChallengeModal; 