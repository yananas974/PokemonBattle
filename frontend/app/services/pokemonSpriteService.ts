export const getPokemonSprite = async (pokemonId: number) => {
    const response = await fetch(`/api/pokemon/${pokemonId}/sprite`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.sprite_url ?? null;
}