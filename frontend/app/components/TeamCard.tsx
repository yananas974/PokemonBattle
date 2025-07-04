import React from 'react';
import { Form } from '@remix-run/react';
import { VintageCard } from './VintageCard';
import { VintageButton } from './VintageButton';

interface Pokemon {
  pokemon_id: number;
  name_fr?: string;
  name_en?: string;
  sprite_url?: string;
}

interface TeamCardProps {
  id: number;
  teamName: string;
  pokemon?: Pokemon[];
  className?: string;
}

export const TeamCard: React.FC<TeamCardProps> = React.memo(({
  id,
  teamName,
  pokemon = [],
  className = ''
}) => {
  const pokemonCount = pokemon.length;
  
  return (
    <VintageCard 
      className={`hover:scale-105 transition-transform duration-200 ${className}`}
      padding="md"
    >
      {/* Header de l'équipe */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-pokemon text-lg text-pokemon-blue-dark uppercase truncate">
          {teamName}
        </h3>
        <div className="bg-pokemon-blue text-pokemon-cream px-2 py-1 rounded border-2 border-pokemon-blue-dark">
          <span className="font-pokemon text-xs">SLOTS:</span>
          <span className="font-pokemon text-xs ml-1">
            {pokemonCount}/6
          </span>
        </div>
      </div>

      {/* Pokémon de l'équipe - Style Game Boy */}
      <div className="mb-5">
        {pokemon.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {pokemon.slice(0, 6).map((poke, index) => (
              <div
                key={index}
                className="bg-pokemon-cream border-2 border-pokemon-blue-dark rounded p-2 text-center hover:bg-pokemon-blue-light transition-colors"
              >
                <img
                  src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.pokemon_id}.png`}
                  alt={poke.name_fr || poke.name_en}
                  className="w-8 h-8 object-contain mx-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="text-xs font-pokemon text-pokemon-blue-dark truncate mt-1">
                  {poke.name_fr || poke.name_en}
                </div>
              </div>
            ))}
            {/* Slots vides */}
            {Array.from({ length: 6 - pokemonCount }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-pokemon-gray border-2 border-pokemon-blue-dark rounded p-2 text-center opacity-50"
              >
                <span className="text-pokemon-blue-dark text-lg">+</span>
                <div className="text-xs font-pokemon text-pokemon-blue-dark mt-1">VIDE</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="bg-pokemon-blue border-2 border-pokemon-blue-dark rounded p-4">
              <span className="text-2xl block mb-2 animate-pokemon-blink text-pokemon-yellow">🔍</span>
              <p className="font-pokemon text-xs text-pokemon-cream uppercase">
                EQUIPE VIDE
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions vintage */}
      <div className="space-y-2">
        <VintageButton
          href={`/dashboard/teams/${id}/select-pokemon`}
          variant="blue"
          className="w-full text-center"
        >
          🔧 MODIFIER EQUIPE
        </VintageButton>
        
        <Form method="post" className="w-full">
          <input type="hidden" name="teamId" value={id} />
          <input type="hidden" name="_action" value="delete" />
          <VintageButton
            type="submit"
            variant="red"
            className="w-full"
            onClick={() => {
              if (!confirm('CONFIRMER SUPPRESSION DE L\'EQUIPE ?')) {
                event?.preventDefault();
              }
            }}
          >
            🗑️ SUPPRIMER
          </VintageButton>
        </Form>
      </div>
    </VintageCard>
  );
});

TeamCard.displayName = 'TeamCard';

