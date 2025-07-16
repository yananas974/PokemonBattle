import { useEffect, useRef, useState } from 'react';

interface UseAudioReturn {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  fadeIn: (duration?: number) => Promise<void>;
  fadeOut: (duration?: number) => Promise<void>;
  isPlaying: boolean;
  isLoaded: boolean;
}

export function useAudio(src: string, options: { 
  volume?: number; 
  loop?: boolean; 
  autoPlay?: boolean;
  fadeIn?: boolean;
  fadeOut?: boolean;
} = {}): UseAudioReturn {
  const { volume = 0.3, loop = true, autoPlay = false } = options;
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audioRef.current = audio;

    const handleCanPlay = () => setIsLoaded(true);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(console.warn);
    }

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [src, loop, volume, autoPlay]);

  const play = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.warn('Erreur lecture audio:', error);
    }
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const setVolume = (newVolume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
  };

  const fadeIn = async (duration: number = 1000) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.volume = 0;
    await play();
    
    const steps = 20;
    const stepSize = volume / steps;
    const stepInterval = duration / steps;
    
    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        if (audio) {
          audio.volume = Math.min(volume, (i + 1) * stepSize);
        }
      }, i * stepInterval);
    }
  };

  const fadeOut = async (duration: number = 1000) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const startVolume = audio.volume;
    
    const steps = 20;
    const stepSize = startVolume / steps;
    const stepInterval = duration / steps;
    
    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        if (audio) {
          audio.volume = Math.max(0, startVolume - (i + 1) * stepSize);
        }
      }, i * stepInterval);
    }
    
    setTimeout(() => {
      pause();
    }, duration);
  };

  return { play, pause, stop, setVolume, fadeIn, fadeOut, isPlaying, isLoaded };
} 