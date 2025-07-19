import { ModernButton } from '~/components/ui/ModernButton';

interface BattleEndScreenProps {
  currentBattle: any;
}

export const BattleEndScreen = ({ currentBattle }: BattleEndScreenProps) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 text-center">
      <div className="text-8xl mb-4">
        {currentBattle.winner === 'player' ? '🏆' : '💀'}
      </div>
      <h2 className="text-4xl font-bold mb-4 text-gray-800">
        {currentBattle.winner === 'player' ? 'VICTOIRE !' : 'DÉFAITE'}
      </h2>
      <div className="flex justify-center space-x-4">
        <ModernButton href="/dashboard/battle" variant="primary" size="lg">
          🏠 Retour au Hub
        </ModernButton>
        <ModernButton href="/dashboard/teams" variant="secondary" size="lg">
          👥 Mes Équipes
        </ModernButton>
      </div>
    </div>
  );
};