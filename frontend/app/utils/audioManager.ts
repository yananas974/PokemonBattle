class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private volume: number = 0.3;

  async playTrack(src: string, options: { loop?: boolean; fadeIn?: boolean } = {}) {
    const { loop = true, fadeIn = true } = options;
    
    // Arrêter la musique actuelle
    this.stopCurrent();
    
    // Créer et configurer le nouvel audio
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = fadeIn ? 0 : this.volume;
    
    this.currentAudio = audio;
    
    try {
      await audio.play();
      
      // Effet fade-in
      if (fadeIn) {
        this.fadeIn(audio, this.volume, 2000);
      }
      
    } catch (error) {
    }
  }

  stopCurrent() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  setVolume(newVolume: number) {
    this.volume = newVolume;
    if (this.currentAudio) {
      this.currentAudio.volume = newVolume;
    }
  }

  getCurrentVolume() {
    return this.volume;
  }

  isPlaying() {
    return this.currentAudio && !this.currentAudio.paused;
  }

  private fadeIn(audio: HTMLAudioElement, targetVolume: number, duration: number) {
    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    const fade = () => {
      if (currentStep >= steps || audio !== this.currentAudio) return;
      
      audio.volume = Math.min(targetVolume, volumeStep * currentStep);
      currentStep++;
      
      setTimeout(fade, stepDuration);
    };

    fade();
  }
}

// Instance globale
export const audioManager = new AudioManager();

// Pistes audio
export const AUDIO_TRACKS = {
  dashboard: '/audio/02 Opening (part 2).mp3',
  battle: '/audio/battle23.mp3', // Mis à jour avec le nouveau fichier
} as const; 