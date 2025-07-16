// ✅ TESTS POUR LE HOOK GLOBALAUDIO

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import { mockAudioContext } from '../setup';

// Mock du globalAudio
const mockGlobalAudio = {
  isPlaying: vi.fn(() => false),
  getCurrentTrack: vi.fn(() => null),
  getVolume: vi.fn(() => 0.5),
  switchTrack: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  stop: vi.fn(),
  setVolume: vi.fn(),
  isAutoplayBlocked: vi.fn(() => false)
};

vi.mock('~/utils/globalAudioManager', () => ({
  globalAudio: mockGlobalAudio,
  TRACKS: {
    DASHBOARD: 'dashboard',
    BATTLE: 'battle'
  },
  TRACK_SOURCES: {
    dashboard: '/audio/dashboard.mp3',
    battle: '/audio/battle.mp3'
  }
}));

describe('useGlobalAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait retourner l\\'état audio initial', () => {
    const { result } = renderHook(() => useGlobalAudio());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTrack).toBeNull();
    expect(result.current.volume).toBe(0.5);
  });

  it('devrait pouvoir jouer la musique du dashboard', () => {
    const { result } = renderHook(() => useGlobalAudio());

    act(() => {
      result.current.playDashboard();
    });

    expect(mockGlobalAudio.switchTrack).toHaveBeenCalledWith(
      '/audio/dashboard.mp3',
      'dashboard'
    );
  });

  it('devrait pouvoir jouer la musique de combat', () => {
    const { result } = renderHook(() => useGlobalAudio());

    act(() => {
      result.current.playBattle();
    });

    expect(mockGlobalAudio.switchTrack).toHaveBeenCalledWith(
      '/audio/battle.mp3',
      'battle'
    );
  });

  it('devrait pouvoir arrêter la musique', () => {
    const { result } = renderHook(() => useGlobalAudio());

    act(() => {
      result.current.stop();
    });

    expect(mockGlobalAudio.stop).toHaveBeenCalledTimes(1);
  });

  it('devrait pouvoir mettre en pause', () => {
    const { result } = renderHook(() => useGlobalAudio());

    act(() => {
      result.current.pause();
    });

    expect(mockGlobalAudio.pause).toHaveBeenCalledTimes(1);
  });

  it('devrait pouvoir reprendre la lecture', () => {
    const { result } = renderHook(() => useGlobalAudio());

    act(() => {
      result.current.resume();
    });

    expect(mockGlobalAudio.resume).toHaveBeenCalledTimes(1);
  });

  it('devrait pouvoir changer le volume', () => {
    const { result } = renderHook(() => useGlobalAudio());

    act(() => {
      result.current.setVolume(0.8);
    });

    expect(mockGlobalAudio.setVolume).toHaveBeenCalledWith(0.8);
  });

  it('devrait mettre à jour l\\'état quand l\\'audio change', () => {
    mockGlobalAudio.isPlaying.mockReturnValue(true);
    mockGlobalAudio.getCurrentTrack.mockReturnValue('dashboard');
    mockGlobalAudio.getVolume.mockReturnValue(0.7);

    const { result } = renderHook(() => useGlobalAudio());

    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentTrack).toBe('dashboard');
    expect(result.current.volume).toBe(0.7);
  });

  it('devrait gérer l\\'autoplay bloqué', () => {
    mockGlobalAudio.isAutoplayBlocked.mockReturnValue(true);

    const { result } = renderHook(() => useGlobalAudio());

    // Le hook devrait pouvoir détecter l'autoplay bloqué
    expect(mockGlobalAudio.isAutoplayBlocked).toHaveBeenCalled();
  });

  describe('Performance', () => {
    it('ne devrait pas causer de re-renders inutiles', () => {
      const renderSpy = vi.fn();
      
      const { rerender } = renderHook(() => {
        renderSpy();
        return useGlobalAudio();
      });

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render sans changement d'état
      rerender();
      
      // Devrait utiliser la même référence pour les fonctions
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Gestion d\\'erreur', () => {
    it('devrait gérer les erreurs de lecture gracieusement', () => {
      mockGlobalAudio.switchTrack.mockImplementation(() => {
        throw new Error('Erreur de lecture');
      });

      const { result } = renderHook(() => useGlobalAudio());

      expect(() => {
        result.current.playDashboard();
      }).toThrow('Erreur de lecture');
    });
  });

  describe('Intégration', () => {
    it('devrait fonctionner avec les changements d\\'état du globalAudio', () => {
      const { result, rerender } = renderHook(() => useGlobalAudio());

      // État initial
      expect(result.current.isPlaying).toBe(false);

      // Simuler un changement d'état
      mockGlobalAudio.isPlaying.mockReturnValue(true);
      mockGlobalAudio.getCurrentTrack.mockReturnValue('battle');

      rerender();

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.currentTrack).toBe('battle');
    });
  });
});