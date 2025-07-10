import React from 'react';
import { Link } from '@remix-run/react';
import { cn } from '~/utils/cn';

export interface PokemonCardProps {
  id: number;
  name_fr: string;
  type: string;
  sprite_url?: string;
  base_hp: number;
  base_attack: number;
  className?: string;
  variant?: 'modern' | 'vintage' | 'compact';
}

// Pokemon type colors with modern gradients
const getTypeGradient = (type: string) => {
  const gradients: { [key: string]: string } = {
    'Normal': 'from-gray-400 to-gray-600',
    'Fire': 'from-red-500 to-orange-600',
    'Water': 'from-blue-500 to-cyan-600',
    'Electric': 'from-yellow-400 to-yellow-600',
    'Grass': 'from-green-500 to-emerald-600',
    'Ice': 'from-cyan-300 to-blue-400',
    'Fighting': 'from-red-600 to-red-800',
    'Poison': 'from-purple-500 to-purple-700',
    'Ground': 'from-yellow-600 to-amber-700',
    'Flying': 'from-indigo-400 to-blue-500',
    'Psychic': 'from-pink-500 to-purple-600',
    'Bug': 'from-green-600 to-lime-600',
    'Rock': 'from-yellow-700 to-stone-600',
    'Ghost': 'from-purple-600 to-indigo-800',
    'Dragon': 'from-indigo-600 to-purple-700',
    'Dark': 'from-gray-700 to-gray-900',
    'Steel': 'from-gray-500 to-slate-600',
    'Fairy': 'from-pink-400 to-rose-500'
  };
  return gradients[type] || 'from-gray-400 to-gray-600';
};

// Type emoji mapping
const getTypeEmoji = (type: string) => {
  const emojis: { [key: string]: string } = {
    'Fire': '🔥',
    'Water': '💧',
    'Electric': '⚡',
    'Grass': '🌿',
    'Ice': '❄️',
    'Fighting': '👊',
    'Poison': '☠️',
    'Ground': '🌍',
    'Flying': '🦅',
    'Psychic': '🔮',
    'Bug': '🐛',
    'Rock': '🪨',
    'Ghost': '👻',
    'Dragon': '🐲',
    'Dark': '🌙',
    'Steel': '⚙️',
    'Fairy': '✨',
    'Normal': '⭐'
  };
  return emojis[type] || '⭐';
};

export const PokemonCard: React.FC<PokemonCardProps> = React.memo(({
  id,
  name_fr,
  type,
  sprite_url,
  base_hp,
  base_attack,
  className = '',
  variant = 'modern'
}) => {
  const typeGradient = getTypeGradient(type);
  const typeEmoji = getTypeEmoji(type);

  if (variant === 'vintage') {
    // Legacy vintage style for backward compatibility
    return (
      <Link
        to={`/dashboard/pokemon/${id}`}
        className={cn('block', className)}
      >
        <div className="pokemon-card-vintage hover:scale-105 transition-transform duration-200 text-center p-4">
          <div className="relative mb-3">
            <img 
              src={sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
              alt={name_fr}
              className="w-16 h-16 mx-auto object-contain"
              style={{ imageRendering: 'pixelated' }}
              loading="lazy"
            />
          </div>
          
          <h3 className="font-pokemon text-xs text-pokemon-blue-dark mb-1 uppercase truncate">
            {name_fr}
          </h3>
          
          <p className="font-digital text-xs text-pokemon-blue mb-2">
            #{id.toString().padStart(3, '0')}
          </p>
          
          <div className="flex justify-center mb-2">
            <span className="px-2 py-1 font-pokemon text-xs rounded border-2 bg-pokemon-blue text-white">
              {type.toUpperCase()}
            </span>
          </div>

          <div className="font-digital text-xs text-pokemon-blue space-y-1">
            <div className="flex justify-between">
              <span>HP:</span>
              <span className="text-pokemon-green">{base_hp}</span>
            </div>
            <div className="flex justify-between">
              <span>ATK:</span>
              <span className="text-pokemon-red">{base_attack}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    // Compact version for lists
    return (
      <Link
        to={`/dashboard/pokemon/${id}`}
        className={cn('block group', className)}
      >
        <div className={cn(
          'relative bg-gradient-to-r',
          typeGradient,
          'rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105'
        )}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full blur-sm"></div>
              <img 
                src={sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                alt={name_fr}
                className="relative w-12 h-12 object-contain drop-shadow-lg"
                loading="lazy"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{typeEmoji}</span>
                <h3 className="text-white font-bold text-sm truncate">{name_fr}</h3>
              </div>
              <p className="text-white opacity-75 text-xs">#{id.toString().padStart(3, '0')}</p>
            </div>
            
            <div className="text-right">
              <div className="text-white text-xs opacity-75">HP: {base_hp}</div>
              <div className="text-white text-xs opacity-75">ATK: {base_attack}</div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Modern card design (default)
  return (
    <Link
      to={`/dashboard/pokemon/${id}`}
      className={cn('group block transform transition-all duration-300 hover:scale-105 hover:z-10', className)}
    >
      <div className={cn(
        'relative bg-gradient-to-br',
        typeGradient,
        'rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden'
      )}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
        </div>

        {/* Pokemon ID Badge */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-30 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
          #{id.toString().padStart(3, '0')}
        </div>

        {/* Type emoji */}
        <div className="absolute top-3 left-3 text-2xl opacity-80">
          {typeEmoji}
        </div>

        {/* Pokemon Image */}
        <div className="flex justify-center mb-4 mt-2">
          <div className="relative">
            <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full blur-xl scale-110"></div>
            <img 
              src={sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
              alt={name_fr}
              className="relative w-24 h-24 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
              }}
            />
          </div>
        </div>

        {/* Pokemon Name */}
        <h3 className="text-white font-bold text-center text-lg mb-3 drop-shadow-md">
          {name_fr}
        </h3>

        {/* Type Badge */}
        <div className="flex justify-center mb-4">
          <span className="bg-white bg-opacity-20 text-white text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm border border-white border-opacity-30">
            {type}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm text-white">
          <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="font-bold text-lg">{base_hp}</div>
            <div className="opacity-75 text-xs">Points de Vie</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="font-bold text-lg">{base_attack}</div>
            <div className="opacity-75 text-xs">Attaque</div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"></div>
      </div>
    </Link>
  );
});

PokemonCard.displayName = 'PokemonCard';

