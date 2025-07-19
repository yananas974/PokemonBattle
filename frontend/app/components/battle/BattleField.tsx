import { cn } from '~/utils/cn';
import { PokemonHealthBar } from './PokemonHealthBar';

interface BattleFieldProps {
  playerPokemon: any;
  enemyPokemon: any;
  battleAnimations: any;
  weather?: any;
}

const BattleField = ({ 
  playerPokemon, 
  enemyPokemon, 
  battleAnimations,
  weather
}: BattleFieldProps) => {
  const getWeatherBackground = (weatherCondition: string) => {
    switch (weatherCondition) {
      case 'ClearDay':
        return 'from-yellow-200 via-green-200 to-green-400';
      case 'ClearNight':
        return 'from-indigo-800 via-purple-600 to-green-800';
      case 'Rain':
        return 'from-gray-400 via-blue-300 to-green-400';
      case 'Snow':
        return 'from-white via-blue-100 to-green-300';
      case 'Thunderstorm':
        return 'from-gray-700 via-purple-500 to-green-400';
      case 'Clouds':
        return 'from-gray-300 via-gray-200 to-green-400';
      default:
        return 'from-blue-300 via-green-200 to-green-400';
    }
  };

  const weatherBg = getWeatherBackground(weather?.condition || 'ClearDay');

  return (
    <div className={`relative w-full h-96 bg-gradient-to-b ${weatherBg} rounded-lg overflow-hidden`}>
      {/* Arrière-plan de terrain */}
      <div className={`absolute inset-0 bg-gradient-to-b ${weatherBg}`} />
      
      {/* Ligne de terrain */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-600 to-green-400" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-green-800" />
      
      {/* Pokémon ennemi (arrière-plan, plus petit) */}
      {enemyPokemon && (
        <div className="absolute top-8 right-16">
          <div className="flex flex-col items-center space-y-2">
            <PokemonHealthBar 
              currentHp={enemyPokemon.currentHp || 0}
              maxHp={enemyPokemon.maxHp || 1}
              name={enemyPokemon.name_fr || 'Pokémon Ennemi'}
              position="enemy"
            />
            <div className="relative">
              <img 
                src={enemyPokemon.sprite_url || '/placeholder-pokemon.png'} 
                alt={enemyPokemon.name_fr || 'Pokémon ennemi'}
                className={cn(
                  "w-24 h-24 object-contain drop-shadow-lg transition-all duration-300",
                  battleAnimations.enemyAttack && "animate-pulse scale-110",
                  battleAnimations.enemyHit && "animate-bounce"
                )}
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/20 rounded-full blur-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Pokémon joueur (premier plan, plus grand) */}
      {playerPokemon && (
        <div className="absolute bottom-8 left-16">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <img 
                src={
                  playerPokemon.sprite_url
                    ? playerPokemon.sprite_url.replace('/pokemon/', '/pokemon/back/')
                    : '/placeholder-pokemon.png'
                } 
                alt={playerPokemon.name_fr || 'Votre Pokémon'}
                className={cn(
                  "w-32 h-32 object-contain drop-shadow-xl transition-all duration-300",
                  battleAnimations.playerAttack && "animate-pulse scale-110",
                  battleAnimations.playerHit && "animate-bounce"
                )}
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black/30 rounded-full blur-sm" />
            </div>
            <PokemonHealthBar 
              currentHp={playerPokemon.currentHp || 0}
              maxHp={playerPokemon.maxHp || 1}
              name={playerPokemon.name_fr || 'Votre Pokémon'}
               
              position="player"
            />
          </div>
        </div>
      )}

      {/* Effets de combat */}
      {(battleAnimations.playerAttack || battleAnimations.enemyAttack) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-ping">💥</div>
        </div>
      )}
    </div>
  );
};

export default BattleField;