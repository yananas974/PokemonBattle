import { Link } from "@remix-run/react";
import { Pokemon } from "@pokemon-battle/shared";
import { getUniquePokemonTypes } from "~/utils/pokemonTypes";
import GradientButton from "./ui/GradientButton";
import SearchInput from "./ui/SearchInput";
import TypeSelect from "./ui/TypeSelect";

type PokemonFilterProps = {
  allPokemons: Pokemon[] | null;
  currentFilter: {
    pokemons: Pokemon[] | null; 
    search: string | null;
    type: string | null;
  };
};

const PokemonFilter = ({ allPokemons, currentFilter }: PokemonFilterProps) => {
  const types = getUniquePokemonTypes(allPokemons || []);
  const search = currentFilter.search || "";
  const type = currentFilter.type || "";
  const filtered = currentFilter.pokemons || [];

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">🔍 Rechercher des Pokémon</h2>

      <form method="GET" className="space-y-4">
        <SearchInput defaultValue={search} />

        <div className="flex flex-wrap gap-2">
          <TypeSelect types={types} defaultValue={type} />
          <GradientButton type="submit">Filtrer</GradientButton>

          {(search || type) && filtered.length > 0 && (
            <Link
              to="/dashboard/pokemon"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-xl transition-all duration-200"
            >
              Réinitialiser
            </Link>
          )}
        </div>
      </form>
    </div>
  );
};

export default PokemonFilter;