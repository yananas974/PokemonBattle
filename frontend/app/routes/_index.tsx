import { json, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";

interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  moves: Array<{
    move: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}

export async function loader() {
  try {
    // Récupérer les 151 premiers Pokémon
    const listResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    const pokemonList = await listResponse.json();
    
    const pokemonPromises = pokemonList.results.map((pokemon: any) =>
      fetch(pokemon.url).then(res => res.json())
    );
    
    const pokemonDetails = await Promise.all(pokemonPromises);
    
    return json({ 
      pokemon: pokemonDetails,
      totalCount: pokemonList.count 
    });
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    return json({ pokemon: [], totalCount: 0 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const pokemonData = {
    id: parseInt(formData.get("id") as string),
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    level: 1,
    hp: parseInt(formData.get("hp") as string),
    attack: parseInt(formData.get("attack") as string),
    defense: parseInt(formData.get("defense") as string),
    speed: parseInt(formData.get("speed") as string),
    height: parseInt(formData.get("height") as string),
    weight: parseInt(formData.get("weight") as string),
    sprite_url: formData.get("sprite_url") as string
  };

  try {
    const response = await fetch(`${process.env.API_URL || 'http://localhost:3001'}/api/pokemon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pokemonData),
    });

    if (response.ok) {
      return json({ success: true, message: `${pokemonData.name} enregistré avec succès!` });
    } else {
      const error = await response.json();
      return json({ success: false, message: error.message || 'Erreur lors de l\'enregistrement' });
    }
  } catch (error) {
    return json({ success: false, message: 'Erreur de connexion au serveur' });
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4", padding: "20px" }}>
      <h1>Pokemon Battle</h1>
      <h2>Choisissez vos Pokémon - {data.pokemon?.length} disponibles</h2>
      
      {actionData?.message && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "20px", 
          borderRadius: "5px",
          backgroundColor: actionData.success ? "#d4edda" : "#f8d7da",
          color: actionData.success ? "#155724" : "#721c24",
          border: `1px solid ${actionData.success ? "#c3e6cb" : "#f5c6cb"}`
        }}>
          {actionData.message}
        </div>
      )}
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "15px" }}>
        {data.pokemon?.map((pokemon: Pokemon) => {
          const hp = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 100;
          const attack = pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 50;
          const defense = pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 50;
          const speed = pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat || 50;
          
          return (
            <div key={pokemon.id} style={{ 
              border: "1px solid #ccc", 
              borderRadius: "8px", 
              padding: "15px",
              backgroundColor: "#f9f9f9",
              transition: "transform 0.2s"
            }}>
              <div style={{ textAlign: "center" }}>
                <img 
                  src={pokemon.sprites.front_default} 
                  alt={pokemon.name}
                  style={{ width: "120px", height: "120px" }}
                />
                <h3 style={{ textTransform: "capitalize", margin: "10px 0", color: "#333" }}>
                  #{pokemon.id.toString().padStart(3, '0')} {pokemon.name}
                </h3>
              </div>
              
              <div style={{ fontSize: "14px", marginBottom: "10px" }}>
                <p><strong>Types:</strong> {pokemon.types.map(t => t.type.name).join(', ')}</p>
                <p><strong>Taille:</strong> {pokemon.height / 10} m | <strong>Poids:</strong> {pokemon.weight / 10} kg</p>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", fontSize: "12px", marginBottom: "15px" }}>
                <div style={{ backgroundColor: "#e0e0e0", padding: "3px 6px", borderRadius: "4px" }}>
                  <strong>HP:</strong> {hp}
                </div>
                <div style={{ backgroundColor: "#e0e0e0", padding: "3px 6px", borderRadius: "4px" }}>
                  <strong>Attaque:</strong> {attack}
                </div>
                <div style={{ backgroundColor: "#e0e0e0", padding: "3px 6px", borderRadius: "4px" }}>
                  <strong>Défense:</strong> {defense}
                </div>
                <div style={{ backgroundColor: "#e0e0e0", padding: "3px 6px", borderRadius: "4px" }}>
                  <strong>Vitesse:</strong> {speed}
                </div>
              </div>
              
              <Form method="post" style={{ textAlign: "center" }}>
                <input type="hidden" name="id" value={pokemon.id} />
                <input type="hidden" name="name" value={pokemon.name} />
                <input type="hidden" name="type" value={pokemon.types.map(t => t.type.name).join('/')} />
                <input type="hidden" name="hp" value={hp} />
                <input type="hidden" name="attack" value={attack} />
                <input type="hidden" name="defense" value={defense} />
                <input type="hidden" name="speed" value={speed} />
                <input type="hidden" name="height" value={pokemon.height} />
                <input type="hidden" name="weight" value={pokemon.weight} />
                <input type="hidden" name="sprite_url" value={pokemon.sprites.front_default} />
                
                <button 
                  type="submit" 
                  disabled={navigation.state === "submitting"}
                  style={{ 
                    backgroundColor: "#4CAF50", 
                    color: "white", 
                    padding: "10px 20px", 
                    border: "none", 
                    borderRadius: "5px", 
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    opacity: navigation.state === "submitting" ? 0.6 : 1
                  }}
                >
                  {navigation.state === "submitting" ? "Ajout en cours..." : "Ajouter à mon équipe"}
                </button>
              </Form>
            </div>
          );
        })}
      </div>
    </div>
  );
} 