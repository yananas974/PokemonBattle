import React from 'react';

interface Pokemon {
  pokemon_id: number;
  name_fr: string;
  type: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite_url: string;
}

interface ModernPokemonCardProps {
  pokemon: Pokemon;
  isSelected?: boolean;
  onClick?: () => void;
  variant?: 'battle' | 'team' | 'compact';
  showStats?: boolean;
}

const typeColors: Record<string, { primary: string; secondary: string; accent: string }> = {
  'Feu': { primary: 'from-red-500 to-orange-600', secondary: 'bg-red-100', accent: 'border-red-300' },
  'Eau': { primary: 'from-blue-500 to-cyan-600', secondary: 'bg-blue-100', accent: 'border-blue-300' },
  'Plante': { primary: 'from-green-500 to-emerald-600', secondary: 'bg-green-100', accent: 'border-green-300' },
  'Électrik': { primary: 'from-yellow-400 to-amber-500', secondary: 'bg-yellow-100', accent: 'border-yellow-300' },
  'Psy': { primary: 'from-purple-500 to-pink-600', secondary: 'bg-purple-100', accent: 'border-purple-300' },
  'Glace': { primary: 'from-cyan-400 to-blue-300', secondary: 'bg-cyan-100', accent: 'border-cyan-300' },
  'Combat': { primary: 'from-red-600 to-orange-700', secondary: 'bg-red-100', accent: 'border-red-400' },
  'Poison': { primary: 'from-purple-600 to-violet-700', secondary: 'bg-purple-100', accent: 'border-purple-400' },
  'Sol': { primary: 'from-yellow-600 to-orange-500', secondary: 'bg-yellow-100', accent: 'border-yellow-400' },
  'Vol': { primary: 'from-indigo-400 to-sky-500', secondary: 'bg-indigo-100', accent: 'border-indigo-300' },
  'Insecte': { primary: 'from-green-600 to-lime-600', secondary: 'bg-green-100', accent: 'border-green-400' },
  'Roche': { primary: 'from-stone-500 to-gray-600', secondary: 'bg-stone-100', accent: 'border-stone-300' },
  'Spectre': { primary: 'from-purple-700 to-indigo-800', secondary: 'bg-purple-100', accent: 'border-purple-500' },
  'Dragon': { primary: 'from-indigo-600 to-purple-700', secondary: 'bg-indigo-100', accent: 'border-indigo-400' },
  'Ténèbres': { primary: 'from-gray-700 to-slate-800', secondary: 'bg-gray-100', accent: 'border-gray-400' },
  'Acier': { primary: 'from-slate-500 to-gray-600', secondary: 'bg-slate-100', accent: 'border-slate-300' },
  'Fée': { primary: 'from-pink-400 to-rose-500', secondary: 'bg-pink-100', accent: 'border-pink-300' },
  'Normal': { primary: 'from-gray-400 to-stone-500', secondary: 'bg-gray-100', accent: 'border-gray-300' }
};

export const ModernPokemonCard: React.FC<ModernPokemonCardProps> = ({
  pokemon,
  isSelected = false,
  onClick,
  variant = 'team',
  showStats = true
}) => {
  const typeStyle = typeColors[pokemon.type] || typeColors['Normal'];
  
  const cardClasses = `
    relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
    ${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-75 shadow-2xl scale-105' : 'hover:scale-102 hover:shadow-xl'}
    ${variant === 'battle' ? 'w-80 h-96' : variant === 'compact' ? 'w-48 h-64' : 'w-64 h-80'}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Background avec gradient du type */}
      <div className={`absolute inset-0 bg-gradient-to-br ${typeStyle.primary} opacity-90`} />
      
      {/* Pattern décoratif */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white" />
        <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white opacity-50" />
      </div>

      {/* Contenu de la carte */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header avec nom et niveau */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-white font-bold text-xl tracking-wide drop-shadow-lg">
              {pokemon.name_fr}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeStyle.secondary} ${typeStyle.accent} border`}>
                {pokemon.type}
              </span>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white font-bold text-sm">Nv.{pokemon.level}</span>
          </div>
        </div>

        {/* Image Pokemon */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-full opacity-20 blur-xl"></div>
            <img 
              src={pokemon.sprite_url} 
              alt={pokemon.name_fr}
              className="relative z-10 w-24 h-24 object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}
            />
          </div>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white opacity-80">HP</span>
                <span className="text-white font-bold">{pokemon.hp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white opacity-80">ATK</span>
                <span className="text-white font-bold">{pokemon.attack}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white opacity-80">DEF</span>
                <span className="text-white font-bold">{pokemon.defense}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white opacity-80">SPD</span>
                <span className="text-white font-bold">{pokemon.speed}</span>
              </div>
            </div>
          </div>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2">
            <div className="bg-yellow-400 text-yellow-900 rounded-full p-2 animate-pulse">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300 transform rotate-45 translate-x-full hover:translate-x-[-100%]" />
    </div>
  );
}; 