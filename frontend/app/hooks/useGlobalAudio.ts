import { useState, useEffect, useCallback } from 'react';
import { globalAudio, TRACKS } from '~/utils/globalAudioManager';

export function useGlobalAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(globalAudio.getVolume());

  // Vérifier le statut périodiquement
  useEffect(() => {
    const updateStatus = () => {
      setIsPlaying(globalAudio.isPlaying());
      setCurrentTrack(globalAudio.getCurrentTrack());
    };

    // Vérification initiale
    updateStatus();

    // Vérification périodique
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const playDashboard = useCallback(() => {
    console.log('🎵 Chargement musique dashboard: 02 Opening (part 2).mp3');
    globalAudio.switchTrack('/audio/02 Opening (part 2).mp3', TRACKS.DASHBOARD);
  }, []);

  const playBattle = useCallback(() => {
    console.log('🎵 Chargement musique combat: battle.mp3');
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
    playDashboard,
    playBattle,
    pause,
    resume,
    stop,
    setVolume
  };
} 