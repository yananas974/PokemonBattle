import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  const res = await fetch("http://pokemon-backend:3001/api/pokemon/fusion");
  const data = await res.json();

  const formattedPokemon = data.pokemon.map((p: any) => ({
    id: p.id,
    name: p.nameFr,
    sprite: p.sprite_url
  }));

  return { pokemon: formattedPokemon };
};

export default function Index() {
  const { pokemon } = useLoaderData<typeof loader>();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Pokémon Fusion</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {pokemon.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              textAlign: "center",
              width: "120px"
            }}
          >
            <img
              src={p.sprite}
              alt={p.name}
              style={{ width: "96px", height: "96px" }}
            />
            <p>{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
