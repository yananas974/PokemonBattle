import { useState, useEffect, useRef, useCallback } from 'react';
import { Pokemon } from '@pokemon-battle/shared';
import { pokemonService } from '~/services/pokemonService';

export interface PokemonParticle {
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

interface UsePokemonParticlesProps {
  maxParticles?: number;
  speed?: number;
  minSize?: number;
  maxSize?: number;
}

export const usePokemonParticles = ({
  maxParticles = 15,
  speed = 0.5,
  minSize = 40,
  maxSize = 80,
}: UsePokemonParticlesProps) => {
  const [particles, setParticles] = useState<PokemonParticle[]>([]);
  const [pokemonPool, setPokemonPool] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const animationRef = useRef<number>();

  // Récupérer les Pokémon depuis l'API
  const fetchPokemon = useCallback(async () => {
    try {
      console.log('🎮 usePokemonParticles: Récupération des Pokémon...');
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('backendToken') : null;
      const response = await pokemonService.getAllPokemon(token || undefined);
      
      if (response.success && response.pokemon.length > 0) {
        const validPokemon = response.pokemon.filter(p => 
          p.sprite_url && 
          p.sprite_url.trim() !== '' && 
          !p.sprite_url.includes('null')
        );
        
        console.log(`✅ ${validPokemon.length} Pokémon valides récupérés`);
        setPokemonPool(validPokemon);
        setError(null);
      } else {
        console.error('❌ Aucun Pokémon récupéré');
        setError('Aucun Pokémon disponible');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des Pokémon:', error);
      setError('Erreur lors du chargement des Pokémon');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Créer une nouvelle particule
  const createParticle = useCallback((containerWidth: number, containerHeight: number): PokemonParticle => {
    if (pokemonPool.length === 0) {
      throw new Error('Aucun Pokémon disponible');
    }

    const randomPokemon = pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
    
    return {
      id: `particle-${Date.now()}-${Math.random()}`,
      pokemon: randomPokemon,
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: minSize + Math.random() * (maxSize - minSize),
      opacity: 0.1 + Math.random() * 0.3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2
    };
  }, [pokemonPool, speed, minSize, maxSize]);

  // Initialiser les particules
  const initializeParticles = useCallback((containerWidth: number, containerHeight: number) => {
    if (pokemonPool.length === 0) return;

    const newParticles: PokemonParticle[] = [];
    
    try {
      for (let i = 0; i < maxParticles; i++) {
        newParticles.push(createParticle(containerWidth, containerHeight));
      }
      setParticles(newParticles);
      console.log(`✅ ${newParticles.length} particules initialisées`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des particules:', error);
    }
  }, [pokemonPool, maxParticles, createParticle]);

  // Animer les particules
  const animateParticles = useCallback((containerWidth: number, containerHeight: number) => {
    setParticles(prevParticles => 
      prevParticles.map(particle => {
        let newX = particle.x + particle.vx;
        let newY = particle.y + particle.vy;
        let newRotation = particle.rotation + particle.rotationSpeed;

        // Rebond sur les bords
        if (newX <= 0 || newX >= containerWidth - particle.size) {
          particle.vx *= -1;
          newX = Math.max(0, Math.min(containerWidth - particle.size, newX));
        }
        if (newY <= 0 || newY >= containerHeight - particle.size) {
          particle.vy *= -1;
          newY = Math.max(0, Math.min(containerHeight - particle.size, newY));
        }

        return {
          ...particle,
          x: newX,
          y: newY,
          rotation: newRotation
        };
      })
    );
  }, []);

  // Démarrer l'animation
  const startAnimation = useCallback((containerWidth: number, containerHeight: number) => {
    const animate = () => {
      animateParticles(containerWidth, containerHeight);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [animateParticles]);

  // Arrêter l'animation
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  // Récupérer les Pokémon au montage
  useEffect(() => {
    fetchPokemon();
  }, [fetchPokemon]);

  // Nettoyage
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return {
    particles,
    pokemonPool,
    isLoading,
    error,
    initializeParticles,
    startAnimation,
    stopAnimation,
    fetchPokemon
  };
}; 