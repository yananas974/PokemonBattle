import React from 'react';
import { Link } from '@remix-run/react';
import { VintageCard } from './VintageCard';

interface PokemonCardProps {
  id: number;
  name_fr: string;
  type: string;
  sprite_url?: string;
  base_hp: number;
  base_attack: number;
  className?: string;
}

// Fonction pour obtenir les couleurs des types vintage
const getTypeColorVintage = (type: string) => {
  const colors: { [key: string]: string } = {
    normal: 'bg-pokemon-gray text-pokemon-blue-dark border-pokemon-gray',
    fire: 'bg-pokemon-red text-white border-red-600',
    water: 'bg-pokemon-blue text-white border-pokemon-blue-dark',
    electric: 'bg-pokemon-yellow text-pokemon-blue-dark border-yellow-600',
    grass: 'bg-pokemon-green text-white border-green-600',
    ice: 'bg-cyan-400 text-white border-cyan-600',
    fighting: 'bg-red-600 text-white border-red-700',
    poison: 'bg-purple-500 text-white border-purple-600',
    ground: 'bg-yellow-600 text-white border-yellow-700',
    flying: 'bg-indigo-400 text-white border-indigo-500',
    psychic: 'bg-pink-500 text-white border-pink-600',
    bug: 'bg-green-600 text-white border-green-700',
    rock: 'bg-gray-600 text-white border-gray-700',
    ghost: 'bg-purple-600 text-white border-purple-700',
    dragon: 'bg-indigo-600 text-white border-indigo-700',
    dark: 'bg-gray-700 text-white border-gray-800',
    steel: 'bg-gray-500 text-white border-gray-600',
    fairy: 'bg-pink-400 text-white border-pink-500',
  };
  return colors[type] || 'bg-pokemon-gray text-pokemon-blue-dark border-pokemon-gray';
};

export const PokemonCard: React.FC<PokemonCardProps> = React.memo(({
  id,
  name_fr,
  type,
  sprite_url,
  base_hp,
  base_attack,
  className = ''
}) => {
  return (
    <Link
      to={`/dashboard/pokemon/${id}`}
      className={`block ${className}`}
      onClick={() => {
        console.log('🔍 Clic Pokemon:', {
          id,
          name: name_fr,
          url: `/dashboard/pokemon/${id}`
        });
      }}
    >
      <VintageCard 
        className="hover:scale-105 transition-transform duration-200 text-center"
        padding="sm"
      >
        {/* Image Pokémon */}
        <div className="relative mb-3">
          <img 
            src={sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
            alt={name_fr}
            className="w-16 h-16 mx-auto object-contain"
            style={{ imageRendering: 'pixelated' }}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
            }}
          />
        </div>
        
        {/* Nom */}
        <h3 className="font-pokemon text-xs text-pokemon-blue-dark mb-1 uppercase truncate">
          {name_fr}
        </h3>
        
        {/* ID */}
        <p className="font-digital text-xs text-pokemon-blue mb-2">
          #{id.toString().padStart(3, '0')}
        </p>
        
        {/* Type */}
        <div className="flex justify-center mb-2">
          <span className={`px-2 py-1 font-pokemon text-xs rounded border-2 ${getTypeColorVintage(type)}`}>
            {type.toUpperCase()}
          </span>
        </div>

        {/* Stats preview vintage */}
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
      </VintageCard>
    </Link>
  );
});

PokemonCard.displayName = 'PokemonCard';

