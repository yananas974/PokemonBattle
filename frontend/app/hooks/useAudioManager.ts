import { useState, useEffect } from 'react';
import { audioManager, AUDIO_TRACKS } from '~/utils/audioManager';

export function useAudioManager() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(audioManager.getCurrentVolume());

  useEffect(() => {
    // Vérifier le statut toutes les secondes
    const interval = setInterval(() => {
      setIsPlaying(audioManager.isPlaying());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const playDashboard = () => {
    audioManager.playTrack(AUDIO_TRACKS.dashboard);
  };

  const playBattle = () => {
    audioManager.playTrack(AUDIO_TRACKS.battle);
  };

  const stop = () => {
    audioManager.stopCurrent();
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    audioManager.setVolume(newVolume);
  };

  return {
    playDashboard,
    playBattle,
    stop,
    setVolume,
    isPlaying,
    volume
  };
} 