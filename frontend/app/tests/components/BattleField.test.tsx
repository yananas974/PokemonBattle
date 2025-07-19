import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import BattleField from '~/components/battle/BattleField';

// Mock du composant PokemonHealthBar
vi.mock('~/components/battle/PokemonHealthBar', () => ({
  PokemonHealthBar: ({ name, currentHp, maxHp, position }: any) => (
    <div data-testid={`health-bar-${position}`}>
      {name} - {currentHp}/{maxHp} HP
    </div>
  )
}));

// Mock du cn utility
vi.mock('~/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}));

const mockPlayerPokemon = {
  id: 1,
  name_fr: 'Pikachu',
  type: 'Electric',
  currentHp: 80,
  maxHp: 100,
  sprite_url: '/sprites/pikachu.png'
};

const mockEnemyPokemon = {
  id: 2,
  name_fr: 'Dracaufeu',
  type: 'Fire',
  currentHp: 150,
  maxHp: 200,
  sprite_url: '/sprites/charizard.png'
};

const mockBattleAnimations = {
  playerAttack: false,
  enemyAttack: false,
  playerHit: false,
  enemyHit: false
};

const mockWeather = {
  condition: 'ClearDay',
  description: 'Temps ensoleillé'
};

describe('BattleField', () => {
  test('renders player and enemy pokemon correctly', () => {
    render(
      <BattleField
        playerPokemon={mockPlayerPokemon}
        enemyPokemon={mockEnemyPokemon}
        battleAnimations={mockBattleAnimations}
        weather={mockWeather}
      />
    );

    // Vérifier que les deux Pokémon sont affichés
    expect(screen.getByText('Pikachu - 80/100 HP')).toBeInTheDocument();
    expect(screen.getByText('Dracaufeu - 150/200 HP')).toBeInTheDocument();

    // Vérifier que les images sont présentes
    const playerSprite = screen.getByAltText('Pikachu');
    const enemySprite = screen.getByAltText('Dracaufeu');
    
    expect(playerSprite).toBeInTheDocument();
    expect(enemySprite).toBeInTheDocument();
  });

  test('applies correct weather background class', () => {
    const { container } = render(
      <BattleField
        playerPokemon={mockPlayerPokemon}
        enemyPokemon={mockEnemyPokemon}
        battleAnimations={mockBattleAnimations}
        weather={mockWeather}
      />
    );

    // Vérifier que le gradient météo approprié est appliqué
    const battleField = container.firstChild as HTMLElement;
    expect(battleField).toHaveClass('from-yellow-200', 'via-green-200', 'to-green-400');
  });

  test('shows battle animations when active', () => {
    const animationsActive = {
      playerAttack: true,
      enemyAttack: false,
      playerHit: false,
      enemyHit: false
    };

    render(
      <BattleField
        playerPokemon={mockPlayerPokemon}
        enemyPokemon={mockEnemyPokemon}
        battleAnimations={animationsActive}
        weather={mockWeather}
      />
    );

    // Vérifier que l'effet d'animation est affiché
    expect(screen.getByText('💥')).toBeInTheDocument();
  });

  test('handles missing pokemon gracefully', () => {
    const { container } = render(
      <BattleField
        playerPokemon={null}
        enemyPokemon={null}
        battleAnimations={mockBattleAnimations}
        weather={mockWeather}
      />
    );

    // Vérifier que le composant ne crash pas
    const battlefield = container.firstChild;
    expect(battlefield).toBeInTheDocument();
  });

  test('applies correct animation classes', () => {
    const animationsWithHit = {
      playerAttack: false,
      enemyAttack: false,
      playerHit: true,
      enemyHit: false
    };

    const { container } = render(
      <BattleField
        playerPokemon={mockPlayerPokemon}
        enemyPokemon={mockEnemyPokemon}
        battleAnimations={animationsWithHit}
        weather={mockWeather}
      />
    );

    // Vérifier que les classes d'animation sont appliquées
    const playerSprite = screen.getByAltText('Pikachu');
    expect(playerSprite).toHaveClass('animate-bounce');
  });

  test('uses fallback sprites when sprite_url is missing', () => {
    const pokemonWithoutSprite = {
      ...mockPlayerPokemon,
      sprite_url: null
    };

    render(
      <BattleField
        playerPokemon={pokemonWithoutSprite}
        enemyPokemon={mockEnemyPokemon}
        battleAnimations={mockBattleAnimations}
        weather={mockWeather}
      />
    );

    const playerSprite = screen.getByAltText('Pikachu');
    expect(playerSprite).toHaveAttribute('src', '/placeholder-pokemon.png');
  });

  test('renders different weather conditions correctly', () => {
    const thunderstormWeather = {
      condition: 'Thunderstorm',
      description: 'Orage violent'
    };

    const { container } = render(
      <BattleField
        playerPokemon={mockPlayerPokemon}
        enemyPokemon={mockEnemyPokemon}
        battleAnimations={mockBattleAnimations}
        weather={thunderstormWeather}
      />
    );

    const battleField = container.firstChild as HTMLElement;
    expect(battleField).toHaveClass('from-gray-700', 'via-purple-500', 'to-green-400');
  });
});