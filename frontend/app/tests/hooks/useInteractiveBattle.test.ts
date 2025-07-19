import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInteractiveBattle } from '~/hooks/useInteractiveBattle';
import type { InteractiveBattleData } from '@pokemon-battle/shared';

// Mock de la validation
vi.mock('~/utils/validation', () => ({
  battleActionSchema: {
    safeParse: vi.fn()
  },
  validateFormData: vi.fn(() => ({ success: true })),
  sanitizeString: (str: string) => str
}));

const mockBattleData: InteractiveBattleData = {
  battleId: 'test-battle-123',
  playerPokemon: {
    id: 1,
    name_fr: 'Pikachu',
    type: 'Electric',
    currentHp: 80,
    maxHp: 100,
    moves: [
      { name: 'Tonnerre', type: 'Electric', power: 90, pp: 15 },
      { name: 'Vive-Attaque', type: 'Normal', power: 40, pp: 35 }
    ]
  },
  enemyPokemon: {
    id: 2,
    name_fr: 'Dracaufeu', 
    type: 'Fire',
    currentHp: 150,
    maxHp: 200,
    moves: [
      { name: 'Lance-Flamme', type: 'Fire', power: 90, pp: 15 }
    ]
  },
  currentTurn: 'player',
  phase: 'PLAYER_TURN',
  turn: 1,
  weather: {
    condition: 'ClearDay',
    description: 'Temps ensoleillé'
  },
  battleLog: [],
  isFinished: false,
  winner: null
};

describe('useInteractiveBattle', () => {
  const mockOnBattleEnd = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('initializes with default state', () => {
    const { result } = renderHook(() => 
      useInteractiveBattle()
    );

    expect(result.current.currentBattle).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.showMoveSelector).toBe(false);
    expect(result.current.battleAnimations).toEqual({
      playerAttack: false,
      enemyAttack: false,
      playerHit: false,
      enemyHit: false
    });
  });

  test('initializes with provided initial battle', () => {
    const { result } = renderHook(() => 
      useInteractiveBattle({ 
        initialBattle: mockBattleData,
        onBattleEnd: mockOnBattleEnd 
      })
    );

    expect(result.current.currentBattle).toEqual(mockBattleData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('sets battle data correctly', () => {
    const { result } = renderHook(() => 
      useInteractiveBattle()
    );

    act(() => {
      result.current.setBattle(mockBattleData);
    });

    expect(result.current.currentBattle).toEqual(mockBattleData);
    expect(result.current.error).toBeNull();
  });

  test('toggles move selector', () => {
    const { result } = renderHook(() => 
      useInteractiveBattle()
    );

    expect(result.current.showMoveSelector).toBe(false);

    act(() => {
      result.current.setShowMoveSelector(true);
    });

    expect(result.current.showMoveSelector).toBe(true);

    act(() => {
      result.current.setShowMoveSelector(false);
    });

    expect(result.current.showMoveSelector).toBe(false);
  });

  test('sets loading state', () => {
    const { result } = renderHook(() => 
      useInteractiveBattle()
    );

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  test('sets error state', () => {
    const { result } = renderHook(() => 
      useInteractiveBattle({ onError: mockOnError })
    );

    const errorMessage = 'Test error';

    act(() => {
      result.current.setError(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(mockOnError).toHaveBeenCalledWith(errorMessage);
  });

  test('handles battle action success', () => {
    const { result } = renderHook(() => 
      useInteractiveBattle()
    );

    const updatedBattleData = {
      ...mockBattleData,
      turn: 2,
      currentTurn: 'enemy' as const
    };

    act(() => {
      result.current.handleBattleActionSuccess(updatedBattleData);
    });

    expect(result.current.currentBattle).toEqual(updatedBattleData);
    expect(result.current.showMoveSelector).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.lastAction).toEqual(updatedBattleData);
  });

  test('triggers onBattleEnd when battle is finished', () => {
    const { result } = renderHook(() => 
      useInteractiveBattle({ onBattleEnd: mockOnBattleEnd })
    );

    const finishedBattleData = {
      ...mockBattleData,
      isFinished: true,
      winner: 'player' as const
    };

    act(() => {
      result.current.handleBattleActionSuccess(finishedBattleData);
    });

    expect(mockOnBattleEnd).toHaveBeenCalledWith(finishedBattleData);
  });

  test('manages battle animations correctly', () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(() => 
      useInteractiveBattle({ animationDuration: 1000 })
    );

    // Set initial battle
    act(() => {
      result.current.setBattle(mockBattleData);
    });

    const updatedBattleData = {
      ...mockBattleData,
      currentTurn: 'enemy' as const,
      turn: 2
    };

    // Trigger action success which should set animations
    act(() => {
      result.current.handleBattleActionSuccess(updatedBattleData);
    });

    // Check that enemy attack animation is active
    expect(result.current.battleAnimations.enemyAttack).toBe(true);

    // Fast forward time to clear animations
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Animations should be reset
    expect(result.current.battleAnimations.playerAttack).toBe(false);
    expect(result.current.battleAnimations.enemyAttack).toBe(false);

    vi.useRealTimers();
  });

  test('executeAction validates input correctly', async () => {
    const { validateFormData } = await import('~/utils/validation');
    
    (validateFormData as any).mockReturnValue({
      success: false,
      errors: { moveIndex: 'Invalid move index' }
    });

    const { result } = renderHook(() => 
      useInteractiveBattle()
    );

    // Set battle first
    act(() => {
      result.current.setBattle(mockBattleData);
    });

    const mockSubmitFn = vi.fn();

    await act(async () => {
      await result.current.executeAction({ type: 'attack', moveId: 5 }, mockSubmitFn);
    });

    expect(result.current.error).toContain('Action invalide');
    expect(mockSubmitFn).not.toHaveBeenCalled();
  });

  test('executeAction creates correct FormData for attack', async () => {
    const { validateFormData } = await import('~/utils/validation');
    (validateFormData as any).mockReturnValue({ success: true });

    const { result } = renderHook(() => 
      useInteractiveBattle()
    );

    // Set battle first
    act(() => {
      result.current.setBattle(mockBattleData);
    });

    const mockSubmitFn = vi.fn();

    await act(async () => {
      await result.current.executeAction({ type: 'attack', moveId: 0 }, mockSubmitFn);
    });

    expect(mockSubmitFn).toHaveBeenCalled();
    const formData = mockSubmitFn.mock.calls[0][0];
    expect(formData.get('intent')).toBe('attack');
    expect(formData.get('moveIndex')).toBe('0');
    expect(formData.get('battleId')).toBe(mockBattleData.battleId);
  });

  test('handleForfeit shows confirmation and submits', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() => 
      useInteractiveBattle()
    );

    // Set battle first
    act(() => {
      result.current.setBattle(mockBattleData);
    });

    const mockSubmitFn = vi.fn();

    await act(async () => {
      await result.current.handleForfeit(mockSubmitFn);
    });

    expect(window.confirm).toHaveBeenCalledWith('Voulez-vous vraiment abandonner le combat ?');
    expect(mockSubmitFn).toHaveBeenCalled();
    
    const formData = mockSubmitFn.mock.calls[0][0];
    expect(formData.get('intent')).toBe('forfeit');
    expect(formData.get('battleId')).toBe(mockBattleData.battleId);

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  test('handleForfeit cancels when user refuses', async () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() => 
      useInteractiveBattle()
    );

    // Set battle first
    act(() => {
      result.current.setBattle(mockBattleData);
    });

    const mockSubmitFn = vi.fn();

    await act(async () => {
      await result.current.handleForfeit(mockSubmitFn);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockSubmitFn).not.toHaveBeenCalled();

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  test('utility functions return correct values', () => {
    const { result } = renderHook(() => 
      useInteractiveBattle()
    );

    // Set battle first
    act(() => {
      result.current.setBattle(mockBattleData);
    });

    expect(result.current.canPlayerAct()).toBe(true);
    expect(result.current.getBattleStatus()).toBe('player-turn');
    expect(result.current.getPlayerPokemon()).toEqual(mockBattleData.playerPokemon);
    expect(result.current.getEnemyPokemon()).toEqual(mockBattleData.enemyPokemon);
    expect(result.current.getBattleLog()).toEqual([]);
  });

  test('utility functions handle different battle states', () => {
    const { result } = renderHook(() => 
      useInteractiveBattle()
    );

    // No battle
    expect(result.current.getBattleStatus()).toBe('no-battle');
    expect(result.current.canPlayerAct()).toBe(false);

    // Enemy turn
    const enemyTurnBattle = { ...mockBattleData, currentTurn: 'enemy' as const };
    act(() => {
      result.current.setBattle(enemyTurnBattle);
    });

    expect(result.current.getBattleStatus()).toBe('enemy-turn');
    expect(result.current.canPlayerAct()).toBe(false);

    // Loading state
    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.getBattleStatus()).toBe('loading');
    expect(result.current.canPlayerAct()).toBe(false);

    // Finished battle
    const finishedBattle = { ...mockBattleData, isFinished: true };
    act(() => {
      result.current.setBattle(finishedBattle);
      result.current.setLoading(false);
    });

    expect(result.current.getBattleStatus()).toBe('finished');
    expect(result.current.canPlayerAct()).toBe(false);
  });

  test('cleans up timeouts on unmount', () => {
    vi.useFakeTimers();
    
    const { result, unmount } = renderHook(() => 
      useInteractiveBattle({ animationDuration: 1000 })
    );

    // Set battle and trigger animation
    act(() => {
      result.current.setBattle(mockBattleData);
      result.current.handleBattleActionSuccess({
        ...mockBattleData,
        currentTurn: 'enemy'
      });
    });

    // Unmount before timeout completes
    unmount();

    // This should not throw or cause issues
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    vi.useRealTimers();
  });
});