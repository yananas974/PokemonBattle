import { useEffect, useState, useRef } from 'react';
import { Pokemon } from '@pokemon-battle/shared';
import { pokemonService } from '~/services/pokemonService';

// Pokémon de fallback avec des sprites qui fonctionnent
const getFallbackPokemon = (): Pokemon[] => [
  {
    id: 1,
    name_fr: "Bulbizarre",
    name_en: "Bulbasaur",
    type: "grass",
    base_hp: 45,
    base_attack: 49,
    base_defense: 49,
    base_speed: 45,
    height: 7,
    weight: 69,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
  },
  {
    id: 4,
    name_fr: "Salamèche",
    name_en: "Charmander",
    type: "fire",
    base_hp: 39,
    base_attack: 52,
    base_defense: 43,
    base_speed: 65,
    height: 6,
    weight: 85,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
  },
  {
    id: 7,
    name_fr: "Carapuce",
    name_en: "Squirtle",
    type: "water",
    base_hp: 44,
    base_attack: 48,
    base_defense: 65,
    base_speed: 43,
    height: 5,
    weight: 90,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
  },
  {
    id: 25,
    name_fr: "Pikachu",
    name_en: "Pikachu",
    type: "electric",
    base_hp: 35,
    base_attack: 55,
    base_defense: 40,
    base_speed: 90,
    height: 4,
    weight: 60,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
  },
  {
    id: 150,
    name_fr: "Mewtwo",
    name_en: "Mewtwo",
    type: "psychic",
    base_hp: 106,
    base_attack: 110,
    base_defense: 90,
    base_speed: 130,
    height: 20,
    weight: 1220,
    sprite_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png"
  }
];

interface PokemonParticle {
  id: string;
  pokemon: Pokemon;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

interface PokemonParticlesProps {
  maxParticles?: number;
  speed?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

const PokemonParticles: React.FC<PokemonParticlesProps> = ({
  maxParticles = 15,
  speed = 0.5,
  minSize = 40,
  maxSize = 80,
  className = ''
}) => {
  const [particles, setParticles] = useState<PokemonParticle[]>([]);
  const [pokemonPool, setPokemonPool] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Récupérer les Pokémon depuis l'API
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        console.log('🎮 PokemonParticles: Récupération des Pokémon...');
        
        // Récupérer le token depuis localStorage côté client
        const token = typeof window !== 'undefined' ? localStorage.getItem('backendToken') : null;
        
        const response = await pokemonService.getAllPokemon(token || undefined);
        
        if (response.success && response.pokemon.length > 0) {
          // Filtrer les Pokémon qui ont des sprites valides
          const validPokemon = response.pokemon.filter(p => 
            p.sprite_url && 
            p.sprite_url.trim() !== '' && 
            !p.sprite_url.includes('null')
          );
          
          console.log(`✅ ${validPokemon.length} Pokémon valides récupérés pour les particules`);
          setPokemonPool(validPokemon);
        } else {
          console.error('❌ Aucun Pokémon récupéré, utilisation du fallback');
          setPokemonPool(getFallbackPokemon());
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des Pokémon:', error);
        console.log('🔄 Utilisation des Pokémon de fallback');
        setPokemonPool(getFallbackPokemon());
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  // Créer une nouvelle particule
  const createParticle = (container: HTMLDivElement): PokemonParticle => {
    if (pokemonPool.length === 0) {
      throw new Error('Aucun Pokémon disponible');
    }

    const randomPokemon = pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
    const containerRect = container.getBoundingClientRect();
    
    return {
      id: `particle-${Date.now()}-${Math.random()}`,
      pokemon: randomPokemon,
      x: Math.random() * containerRect.width,
      y: Math.random() * containerRect.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: minSize + Math.random() * (maxSize - minSize),
      opacity: 0.1 + Math.random() * 0.3, // Opacité entre 0.1 et 0.4
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2
    };
  };

  // Initialiser les particules
  useEffect(() => {
    if (isLoading || pokemonPool.length === 0 || !containerRef.current) return;

    const container = containerRef.current;
    const newParticles: PokemonParticle[] = [];

    try {
      for (let i = 0; i < maxParticles; i++) {
        newParticles.push(createParticle(container));
      }
      setParticles(newParticles);
      console.log(`✅ ${newParticles.length} particules Pokémon créées`);
    } catch (error) {
      console.error('❌ Erreur lors de la création des particules:', error);
    }
  }, [isLoading, pokemonPool, maxParticles, minSize, maxSize, speed]);

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
      <div className={`fixed inset-0 pointer-events-none ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/20 text-sm">
            Chargement des Pokémon...
          </div>
        </div>
      </div>
    );
  }

  if (pokemonPool.length === 0) {
    return (
      <div className={`fixed inset-0 pointer-events-none ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/20 text-sm">
            Aucun Pokémon disponible
          </div>
        </div>
      </div>
    );
  }

  console.log(`🎮 PokemonParticles: Rendu avec ${particles.length} particules et ${pokemonPool.length} Pokémon disponibles`);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: -1 }}
    >
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
            filter: 'blur(0.5px)',
          }}
        >
          <img
            src={particle.pokemon.sprite_url}
            alt={particle.pokemon.name_fr}
            className="w-full h-full object-contain"
            style={{
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.1))'
            }}
            onError={(e) => {
              // Masquer l'image si elle ne charge pas
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          
          {/* Nom du Pokémon en overlay subtil */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-white/10 font-medium whitespace-nowrap">
            {particle.pokemon.name_fr}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PokemonParticles; 