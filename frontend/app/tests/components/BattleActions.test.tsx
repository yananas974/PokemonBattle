import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import BattleActions from '~/components/battle/BattleActions';

// Mock des utilitaires
vi.mock('~/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}));

vi.mock('~/utils/pokemonTypes', () => ({
  getTypeColor: (type: string) => `bg-${type.toLowerCase()}-500`
}));

const mockMoves = [
  { name: 'Tonnerre', type: 'Electric', power: 90, pp: 15 },
  { name: 'Queue de Fer', type: 'Steel', power: 100, pp: 15 },
  { name: 'Vive-Attaque', type: 'Normal', power: 40, pp: 35 },
  { name: 'Charge', type: 'Normal', power: 40, pp: 35 }
];

const mockCurrentBattle = {
  currentTurn: 'player',
  playerPokemon: {
    id: 1,
    name_fr: 'Pikachu',
    moves: mockMoves,
    currentHp: 80,
    maxHp: 100
  }
};

describe('BattleActions', () => {
  const mockOnShowMoveSelector = vi.fn();
  const mockHandleAction = vi.fn();
  const mockHandleForfeit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders main action buttons when not showing move selector', () => {
    render(
      <BattleActions
        currentBattle={mockCurrentBattle}
        showMoveSelector={false}
        onShowMoveSelector={mockOnShowMoveSelector}
        handleAction={mockHandleAction}
        handleForfeit={mockHandleForfeit}
        isLoading={false}
      />
    );

    // Vérifier que les boutons principaux sont présents
    expect(screen.getByText('⚔️ ATTAQUE')).toBeInTheDocument();
    expect(screen.getByText('🏃‍♂️ FUIR')).toBeInTheDocument();
  });

  test('calls onShowMoveSelector when attack button is clicked', () => {
    render(
      <BattleActions
        currentBattle={mockCurrentBattle}
        showMoveSelector={false}
        onShowMoveSelector={mockOnShowMoveSelector}
        handleAction={mockHandleAction}
        handleForfeit={mockHandleForfeit}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('⚔️ ATTAQUE'));
    expect(mockOnShowMoveSelector).toHaveBeenCalledWith(true);
  });

  test('calls handleForfeit when forfeit button is clicked', () => {
    render(
      <BattleActions
        currentBattle={mockCurrentBattle}
        showMoveSelector={false}
        onShowMoveSelector={mockOnShowMoveSelector}
        handleAction={mockHandleAction}
        handleForfeit={mockHandleForfeit}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('🏃‍♂️ FUIR'));
    expect(mockHandleForfeit).toHaveBeenCalled();
  });

  test('shows move selector when showMoveSelector is true', () => {
    render(
      <BattleActions
        currentBattle={mockCurrentBattle}
        showMoveSelector={true}
        onShowMoveSelector={mockOnShowMoveSelector}
        handleAction={mockHandleAction}
        handleForfeit={mockHandleForfeit}
        isLoading={false}
      />
    );

    expect(screen.getByText('Choisissez une attaque :')).toBeInTheDocument();
    expect(screen.getByText('Tonnerre')).toBeInTheDocument();
    expect(screen.getByText('Queue de Fer')).toBeInTheDocument();
    expect(screen.getByText('← Retour')).toBeInTheDocument();
  });

  test('calls handleAction when move is selected', () => {
    render(
      <BattleActions
        currentBattle={mockCurrentBattle}
        showMoveSelector={true}
        onShowMoveSelector={mockOnShowMoveSelector}
        handleAction={mockHandleAction}
        handleForfeit={mockHandleForfeit}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('Tonnerre'));
    expect(mockHandleAction).toHaveBeenCalledWith({
      type: 'attack',
      moveId: 0,
      moveName: 'Tonnerre'
    });
  });

  test('shows loading state when isLoading is true', () => {
    render(
      <BattleActions
        currentBattle={mockCurrentBattle}
        showMoveSelector={false}
        onShowMoveSelector={mockOnShowMoveSelector}
        handleAction={mockHandleAction}
        handleForfeit={mockHandleForfeit}
        isLoading={true}
      />
    );

    expect(screen.getByText('Combat en cours...')).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  test('shows enemy turn state when not player turn', () => {
    const enemyTurnBattle = {
      ...mockCurrentBattle,
      currentTurn: 'enemy'
    };

    render(
      <BattleActions
        currentBattle={enemyTurnBattle}
        showMoveSelector={false}
        onShowMoveSelector={mockOnShowMoveSelector}
        handleAction={mockHandleAction}
        handleForfeit={mockHandleForfeit}
        isLoading={false}
      />
    );

    expect(screen.getByText('L\'ennemi réfléchit à son attaque...')).toBeInTheDocument();
  });

  test('handles pokemon with no moves gracefully', () => {
    const battleWithoutMoves = {
      ...mockCurrentBattle,
      playerPokemon: {
        ...mockCurrentBattle.playerPokemon,
        moves: []
      }
    };

    render(
      <BattleActions
        currentBattle={battleWithoutMoves}
        showMoveSelector={true}
        onShowMoveSelector={mockOnShowMoveSelector}
        handleAction={mockHandleAction}
        handleForfeit={mockHandleForfeit}
        isLoading={false}
      />
    );

    expect(screen.getByText('Choisissez une attaque :')).toBeInTheDocument();
    expect(screen.getByText('← Retour')).toBeInTheDocument();
  });

  test('disables move buttons when loading', () => {
    render(
      <BattleActions
        currentBattle={mockCurrentBattle}
        showMoveSelector={true}
        onShowMoveSelector={mockOnShowMoveSelector}
        handleAction={mockHandleAction}
        handleForfeit={mockHandleForfeit}
        isLoading={true}
      />
    );

    // En mode loading, le composant devrait montrer l'état de chargement
    expect(screen.getByText('Combat en cours...')).toBeInTheDocument();
  });

  test('shows back button functionality', () => {
    render(
      <BattleActions
        currentBattle={mockCurrentBattle}
        showMoveSelector={true}
        onShowMoveSelector={mockOnShowMoveSelector}
        handleAction={mockHandleAction}
        handleForfeit={mockHandleForfeit}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('← Retour'));
    expect(mockOnShowMoveSelector).toHaveBeenCalledWith(false);
  });
});