// ✅ SYSTÈME AUDIO UNIFIÉ - REMPLACÉ PAR GLOBALAUDIOMANAGER
// Ce fichier est conservé pour compatibilité mais redirige vers le système unifié

import React, { createContext, useContext } from 'react';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';

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

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const globalAudio = useGlobalAudio();
  
  // ✅ MAPPING VERS LE SYSTÈME GLOBAL
  const contextValue: AudioContextType = {
    currentTrack: globalAudio.currentTrack as AudioTrack | null,
    playTrack: (track: AudioTrack) => {
      switch (track) {
        case 'dashboard':
        case 'victory':
        case 'defeat':
          globalAudio.playDashboard();
          break;
        case 'battle':
          globalAudio.playBattle();
          break;
      }
    },
    stopCurrentTrack: globalAudio.stop,
    setVolume: globalAudio.setVolume,
    isPlaying: globalAudio.isPlaying,
    volume: globalAudio.volume
  };
  
  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext doit être utilisé dans un AudioProvider');
  }
  return context;
}

// ✅ EXPORT POUR COMPATIBILITÉ AVEC L'ANCIEN SYSTÈME
export type { AudioTrack };