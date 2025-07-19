import { useState, useEffect, useCallback, useRef } from 'react';
import { globalAudio, TRACKS } from '~/utils/globalAudioManager';

export function useGlobalAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(globalAudio.getVolume());
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // ✅ Référence pour l'interval pour éviter les memory leaks
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Vérifier le statut périodiquement
  useEffect(() => {
    const updateStatus = () => {
      setIsPlaying(globalAudio.isPlaying());
      setCurrentTrack(globalAudio.getCurrentTrack());
      // Vérifier si l'autoplay est bloqué
      setAutoplayBlocked(globalAudio.isAutoplayBlocked());
    };

    // Vérification initiale
    updateStatus();

    // ✅ Vérification périodique avec référence stable
    intervalRef.current = setInterval(updateStatus, 1000);

    return () => {
      // ✅ Cleanup complet
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // ✅ Cleanup audio si nécessaire
      globalAudio.cleanup();
    };
  }, []);

  const playDashboard = useCallback(() => {
    globalAudio.switchTrack('/audio/02 Opening (part 2).mp3', TRACKS.DASHBOARD);
  }, []);

  const playBattle = useCallback(() => {
    globalAudio.switchTrack('/audio/battle23.mp3', TRACKS.BATTLE);
  }, []);

  const pause = useCallback(() => {
    globalAudio.pause();
  }, []);

  const resume = useCallback(() => {
    globalAudio.resume();
  }, []);

  const stop = useCallback(() => {
    globalAudio.stop();
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    globalAudio.setVolume(newVolume);
  }, []);

  return {
    isPlaying,
    currentTrack,
    volume,
    autoplayBlocked,
    playDashboard,
    playBattle,
    pause,
    resume,
    stop,
    setVolume
  };
} 