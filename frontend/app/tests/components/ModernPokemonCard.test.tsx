// ✅ TESTS POUR LE COMPOSANT MODERNPOKEMONCARD

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModernPokemonCard } from '~/components/ModernPokemonCard';
import { mockPokemon, expectValidPokemonCard } from '../setup';

describe('ModernPokemonCard', () => {
  const defaultProps = {
    pokemon: mockPokemon
  };

  it('devrait rendre correctement un Pokémon', () => {
    render(<ModernPokemonCard {...defaultProps} />);
    
    expect(screen.getByText('Test Pokemon')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // HP
    expect(screen.getByText('50')).toBeInTheDocument(); // Attack
  });

  it('devrait appeler onClick quand cliqué', () => {
    const handleClick = vi.fn();
    render(<ModernPokemonCard {...defaultProps} onClick={handleClick} />);
    
    const card = screen.getByRole('button', { hidden: true });
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('devrait appliquer les classes de sélection', () => {
    const { rerender } = render(<ModernPokemonCard {...defaultProps} isSelected={false} />);
    
    let card = screen.getByRole('button', { hidden: true });
    expect(card).not.toHaveClass('ring-4');
    
    rerender(<ModernPokemonCard {...defaultProps} isSelected={true} />);
    card = screen.getByRole('button', { hidden: true });
    expect(card).toHaveClass('ring-4');
  });

  it('devrait afficher les stats quand showStats est true', () => {
    render(<ModernPokemonCard {...defaultProps} showStats={true} />);
    
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('ATK')).toBeInTheDocument();
    expect(screen.getByText('DEF')).toBeInTheDocument();
    expect(screen.getByText('SPD')).toBeInTheDocument();
  });

  it('devrait masquer les stats quand showStats est false', () => {
    render(<ModernPokemonCard {...defaultProps} showStats={false} />);
    
    expect(screen.queryByText('HP')).not.toBeInTheDocument();
    expect(screen.queryByText('ATK')).not.toBeInTheDocument();
  });

  it('devrait adapter la taille selon le variant', () => {
    const { rerender } = render(<ModernPokemonCard {...defaultProps} variant="compact" />);
    
    let card = screen.getByRole('button', { hidden: true });
    expect(card).toHaveClass('w-48', 'h-64');
    
    rerender(<ModernPokemonCard {...defaultProps} variant="battle" />);
    card = screen.getByRole('button', { hidden: true });
    expect(card).toHaveClass('w-80', 'h-96');
    
    rerender(<ModernPokemonCard {...defaultProps} variant="team" />);
    card = screen.getByRole('button', { hidden: true });
    expect(card).toHaveClass('w-64', 'h-80');
  });

  it('devrait afficher l\\'indicateur de sélection', () => {
    render(<ModernPokemonCard {...defaultProps} isSelected={true} />);
    
    const checkIcon = screen.getByRole('img', { hidden: true });
    expect(checkIcon).toBeInTheDocument();
  });

  it('devrait afficher l\\'image du Pokémon', () => {
    render(<ModernPokemonCard {...defaultProps} />);
    
    const image = screen.getByRole('img', { name: 'Test Pokemon' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://test.com/sprite.png');
  });

  it('devrait utiliser les couleurs appropriées pour le type', () => {
    const { rerender } = render(<ModernPokemonCard {...defaultProps} />);
    
    let card = screen.getByRole('button', { hidden: true });
    expect(card.innerHTML).toContain('from-gray-400'); // Normal type
    
    const firePokemon = { ...mockPokemon, type: 'Feu' };
    rerender(<ModernPokemonCard pokemon={firePokemon} />);
    card = screen.getByRole('button', { hidden: true });
    expect(card.innerHTML).toContain('from-red-500'); // Fire type
  });

  it('devrait gérer les stats manquantes gracieusement', () => {
    const pokemonWithoutStats = {
      ...mockPokemon,
      base_hp: undefined,
      base_attack: undefined
    };
    
    render(<ModernPokemonCard pokemon={pokemonWithoutStats} showStats={true} />);
    
    // Devrait afficher les valeurs par défaut
    expect(screen.getByText('100')).toBeInTheDocument(); // Fallback HP
    expect(screen.getByText('50')).toBeInTheDocument(); // Fallback Attack
  });

  describe('Performance', () => {
    it('ne devrait pas re-render si les props n\\'ont pas changé', () => {
      const renderSpy = vi.fn();
      const TestCard = vi.fn(() => {
        renderSpy();
        return <ModernPokemonCard {...defaultProps} />;
      });
      
      const { rerender } = render(<TestCard />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render avec les mêmes props
      rerender(<TestCard />);
      expect(renderSpy).toHaveBeenCalledTimes(1); // Pas de nouveau render grâce à memo
    });
  });

  describe('Accessibilité', () => {
    it('devrait être accessible au clavier', () => {
      const handleClick = vi.fn();
      render(<ModernPokemonCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button', { hidden: true });
      
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(card, { key: ' ', code: 'Space' });
      
      // L'événement click devrait être déclenché pour Enter et Space
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('devrait avoir les attributs ARIA appropriés', () => {
      render(<ModernPokemonCard {...defaultProps} />);
      
      const image = screen.getByRole('img', { name: 'Test Pokemon' });
      expect(image).toHaveAttribute('alt', 'Test Pokemon');
    });
  });
});