import { Pokemon } from "@pokemon-battle/shared";
import { Link } from "@remix-run/react";
import { getTypeGradient } from "~/utils/pokemonTypes";


type PokemonCardProps = {
    pokemon: Pokemon;
}


const PokemonCard = ({ pokemon }: PokemonCardProps) => {
  const bgGradient = getTypeGradient(pokemon.type); 

return (
  <Link 
  to={`/dashboard/pokemon/${pokemon.id}`}
  className="group block transform transition-all duration-300 hover:scale-105 hover:z-10"
>
  <div className={`relative bg-gradient-to-br ${bgGradient} rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
    {/* Numéro Pokédex */}
    <div className="absolute top-2 right-2 bg-black bg-opacity-30 text-white text-xs font-bold px-2 py-1 rounded-full">
      #{pokemon.id.toString().padStart(3, '0')}
    </div>

    {/* Image Pokémon */}
    <div className="flex justify-center mb-3">
      <div className="relative">
        <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full blur-xl"></div>
        <img 
          src={pokemon.sprite_url || '/placeholder-pokemon.png'} 
          alt={pokemon.name_fr}
          className="relative w-20 h-20 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>
    </div>

    {/* Nom */}
    <h3 className="text-white font-bold text-center text-sm mb-2 drop-shadow-md">
      {pokemon.name_fr}
    </h3>

    {/* Type */}
    <div className="flex justify-center">
      <span className="bg-white bg-opacity-20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
        {pokemon.type}
      </span>
    </div>

    {/* Stats rapides */}
    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white">
      <div className="bg-white bg-opacity-10 rounded px-2 py-1 text-center">
        <div className="font-semibold">{pokemon.base_hp}</div>
        <div className="opacity-75">HP</div>
      </div>
      <div className="bg-white bg-opacity-10 rounded px-2 py-1 text-center">
        <div className="font-semibold">{pokemon.base_attack}</div>
        <div className="opacity-75">ATK</div>
      </div>
    </div>
  </div>
</Link> )
}

export default PokemonCard;