import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAudio } from '~/hooks/useAudio';

type AudioTrack = 'dashboard' | 'battle' | 'victory' | 'defeat';

interface AudioContextType {
  currentTrack: AudioTrack | null;
  playTrack: (track: AudioTrack) => void;
  stopCurrentTrack: () => void;
  setVolume: (volume: number) => void;
  isPlaying: boolean;
  volume: number;
}

const AudioContext = createContext<AudioContextType | null>(null);

const AUDIO_TRACKS: Record<AudioTrack, string> = {
  dashboard: '/audio/02 Opening (part 2).mp3',
  battle: '/audio/02 Opening (part 2).mp3', // Même fichier pour l'instant
  victory: '/audio/02 Opening (part 2).mp3',
  defeat: '/audio/02 Opening (part 2).mp3'
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [volume, setVolumeState] = useState(0.3);
  const [audioSrc, setAudioSrc] = useState<string>('');

  const { play, stop, fadeOut, setVolume: setAudioVolume, isPlaying } = useAudio(
    audioSrc,
    {
      volume,
      loop: true,
      autoPlay: false,
      fadeIn: true,
      fadeDuration: 2000
    }
  );

  const playTrack = useCallback(async (track: AudioTrack) => {
    console.log(`🎵 Changement de piste: ${currentTrack} → ${track}`);
    
    // Si même piste, ne rien faire
    if (currentTrack === track && isPlaying) {
      return;
    }

    // Fade out de la piste actuelle si elle joue
    if (currentTrack && isPlaying) {
      await fadeOut(1000);
    }

    // Changer la source audio
    setAudioSrc(AUDIO_TRACKS[track]);
    setCurrentTrack(track);
    
    // Petite pause pour laisser le temps au nouvel audio de se charger
    setTimeout(() => {
      play();
    }, 100);
  }, [currentTrack, isPlaying, fadeOut, play]);

  const stopCurrentTrack = useCallback(async () => {
    if (isPlaying) {
      await fadeOut(1000);
    }
    setCurrentTrack(null);
  }, [isPlaying, fadeOut]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    setAudioVolume(newVolume);
  }, [setAudioVolume]);

  return (
    <AudioContext.Provider value={{
      currentTrack,
      playTrack,
      stopCurrentTrack,
      setVolume,
      isPlaying,
      volume
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
} 