import { useEffect, useState, useRef } from 'react';

// Interface pour les données Pokémon de l'API PokeAPI
interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
}

interface PokemonData {
  id: number;
  name: string;
  sprite: string;
}

// Fonction pour générer un ID aléatoire entre 1 et 151 (première génération)
const getRandomPokemonId = (): number => {
  return Math.floor(Math.random() * 151) + 1;
};

// Fonction pour récupérer un Pokémon depuis l'API PokeAPI
const fetchPokemonFromAPI = async (id: number): Promise<PokemonData | null> => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data: PokeApiPokemon = await response.json();
    
    return {
      id: data.id,
      name: data.name,
      sprite: data.sprites.front_default
    };
  } catch (error) {
    return null;
  }
};

// Fonction pour récupérer plusieurs Pokémon aléatoirement
const fetchRandomPokemon = async (count: number): Promise<PokemonData[]> => {
  const promises: Promise<PokemonData | null>[] = [];
  const usedIds = new Set<number>();
  
  // Générer des IDs uniques
  while (usedIds.size < count) {
    const randomId = getRandomPokemonId();
    if (!usedIds.has(randomId)) {
      usedIds.add(randomId);
      promises.push(fetchPokemonFromAPI(randomId));
    }
  }
  
  
  const results = await Promise.all(promises);
  return results.filter((pokemon): pokemon is PokemonData => pokemon !== null);
};

interface SimpleParticle {
  id: string;
  pokemon: PokemonData;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

interface SimplePokemonParticlesProps {
  maxParticles?: number;
  speed?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

const SimplePokemonParticles: React.FC<SimplePokemonParticlesProps> = ({
  maxParticles = 10,
  speed = 0.5,
  minSize = 40,
  maxSize = 80,
  className = ''
}) => {
  const [particles, setParticles] = useState<SimpleParticle[]>([]);
  const [pokemonData, setPokemonData] = useState<PokemonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Créer une nouvelle particule
  const createParticle = (containerWidth: number, containerHeight: number): SimpleParticle => {
    if (pokemonData.length === 0) {
      throw new Error('Aucun Pokémon disponible');
    }
    
    const randomPokemon = pokemonData[Math.floor(Math.random() * pokemonData.length)];
    
    return {
      id: `particle-${Date.now()}-${Math.random()}`,
      pokemon: randomPokemon,
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: minSize + Math.random() * (maxSize - minSize),
      opacity: 0.4 + Math.random() * 0.4, // Opacité entre 0.4 et 0.8 (plus visible)
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2
    };
  };

  // Récupérer les Pokémon depuis l'API
  useEffect(() => {
    const loadPokemon = async () => {
      try {
        const pokemon = await fetchRandomPokemon(maxParticles + 5); // +5 pour avoir des extras
        setPokemonData(pokemon);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    loadPokemon();
  }, [maxParticles]);

  // Initialiser les particules
  useEffect(() => {
    if (!containerRef.current || isLoading || pokemonData.length === 0) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newParticles: SimpleParticle[] = [];

    try {
      for (let i = 0; i < maxParticles; i++) {
        newParticles.push(createParticle(containerRect.width, containerRect.height));
      }
      
      setParticles(newParticles);
    } catch (error) {
    }
  }, [isLoading, pokemonData, maxParticles, minSize, maxSize, speed]);

  // Animation des particules
  useEffect(() => {
    if (particles.length === 0 || !containerRef.current) return;

    const animate = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      setParticles(prevParticles => 
        prevParticles.map(particle => {
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;
          let newRotation = particle.rotation + particle.rotationSpeed;

          // Rebond sur les bords
          if (newX <= 0 || newX >= containerRect.width - particle.size) {
            particle.vx *= -1;
            newX = Math.max(0, Math.min(containerRect.width - particle.size, newX));
          }
          if (newY <= 0 || newY >= containerRect.height - particle.size) {
            particle.vy *= -1;
            newY = Math.max(0, Math.min(containerRect.height - particle.size, newY));
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            rotation: newRotation
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);


  if (isLoading) {
    return (
      <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
        <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded text-sm">
          🎮 Chargement Pokémon...
        </div>
      </div>
    );
  }

  if (pokemonData.length === 0) {
    return (
      <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
        <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded text-sm">
          ❌ Aucun Pokémon chargé
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
    >
      {/* Indicateur de debug */}
      <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded text-sm">
        🎮 Particules: {particles.length} | Pokémon: {pokemonData.length}
      </div>
      
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute transition-opacity duration-1000"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg)`,
          }}
        >
          <img
            src={particle.pokemon.sprite}
            alt={`${particle.pokemon.name} sprite`}
            className="w-full h-full object-contain"  
            style={{
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            onLoad={() => {
            }}
          />
          
          {/* Nom du Pokémon en overlay subtil */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-white/20 font-medium whitespace-nowrap">
            {particle.pokemon.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SimplePokemonParticles; 