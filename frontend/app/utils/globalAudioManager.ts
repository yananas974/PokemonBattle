class GlobalAudioManager {
  private static instance: GlobalAudioManager;
  private currentAudio: HTMLAudioElement | null = null;
  private currentTrack: string | null = null;
  private volume: number = 0.3;
  private isInitialized: boolean = false;
  private autoplayBlocked: boolean = false;
  private pendingTrack: string | null = null;
  private unlockHandlers: (() => void)[] = [];
  private audioEventHandlers: Map<string, () => void> = new Map();

  private constructor() {
    // Singleton
  }

  static getInstance(): GlobalAudioManager {
    if (!GlobalAudioManager.instance) {
      GlobalAudioManager.instance = new GlobalAudioManager();
    }
    return GlobalAudioManager.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    // Créer l'audio une seule fois
    this.currentAudio = new Audio();
    this.currentAudio.loop = true;
    this.currentAudio.volume = this.volume;
    
    // ✅ Gérer les événements audio pour éviter les memory leaks
    this.setupAudioEventHandlers();
    
    // Écouter les événements d'interaction utilisateur pour débloquer l'autoplay
    this.setupAutoplayUnlock();
    
    this.isInitialized = true;
  }

  // ✅ Configuration des event handlers avec cleanup
  private setupAudioEventHandlers() {
    if (!this.currentAudio) return;

    // Event handlers avec cleanup automatique
    const onEnded = () => {
      // Redémarrer la piste si elle se termine (backup pour loop)
      if (this.currentAudio && this.currentTrack) {
        this.currentAudio.currentTime = 0;
        this.currentAudio.play().catch(() => {
          this.autoplayBlocked = true;
        });
      }
    };

    const onError = () => {
      this.currentTrack = null;
      this.autoplayBlocked = true;
    };

    // Stocker les handlers pour pouvoir les supprimer
    this.audioEventHandlers.set('ended', onEnded);
    this.audioEventHandlers.set('error', onError);

    this.currentAudio.addEventListener('ended', onEnded);
    this.currentAudio.addEventListener('error', onError);
  }

  private setupAutoplayUnlock() {
    const unlockAudio = () => {
      if (this.currentAudio && this.autoplayBlocked && this.pendingTrack) {
        this.autoplayBlocked = false;
        this.pendingTrack = null;
        
        // ✅ Retirer TOUS les listeners de unlock
        this.removeUnlockListeners();
      }
    };

    // ✅ Stocker les handlers pour pouvoir les supprimer
    this.unlockHandlers = [unlockAudio];

    document.addEventListener('click', unlockAudio, { passive: true });
    document.addEventListener('keydown', unlockAudio, { passive: true });
    document.addEventListener('touchstart', unlockAudio, { passive: true });
  }

  // ✅ Méthode pour supprimer les listeners de unlock
  private removeUnlockListeners() {
    this.unlockHandlers.forEach(handler => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
      document.removeEventListener('touchstart', handler);
    });
    this.unlockHandlers = [];
  }

  async switchTrack(src: string, trackName: string) {
    if (!this.isInitialized) this.initialize();
    if (!this.currentAudio) return;

    // Si c'est déjà la même piste, ne rien faire
    if (this.currentTrack === trackName && !this.autoplayBlocked) {
      return;
    }


    // Changer la source et relancer
    this.currentAudio.src = src;
    this.currentTrack = trackName;

    try {
      await this.currentAudio.play();
      this.autoplayBlocked = false;
    } catch (error) {
      const err = error as Error;
      if (err.name === 'NotAllowedError') {
        this.autoplayBlocked = true;
        this.pendingTrack = trackName;
      } else {
      }
    }
  }

  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  resume() {
    if (this.currentAudio) {
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    this.currentTrack = null;
  }

  setVolume(newVolume: number) {
    this.volume = newVolume;
    if (this.currentAudio) {
      this.currentAudio.volume = newVolume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  isPlaying(): boolean {
    return this.currentAudio ? !this.currentAudio.paused : false;
  }

  getCurrentTrack(): string | null {
    return this.currentTrack;
  }

  isAutoplayBlocked(): boolean {
    return this.autoplayBlocked;
  }

  getPendingTrack(): string | null {
    return this.pendingTrack;
  }

  // ✅ Méthode de destruction complète pour éviter les memory leaks
  destroy() {
    // Arrêter l'audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      
      // Supprimer tous les event handlers audio
      this.audioEventHandlers.forEach((handler, event) => {
        this.currentAudio?.removeEventListener(event, handler);
      });
      this.audioEventHandlers.clear();
      
      this.currentAudio = null;
    }

    // Supprimer les listeners de unlock
    this.removeUnlockListeners();

    // Reset de l'état
    this.currentTrack = null;
    this.pendingTrack = null;
    this.isInitialized = false;
    this.autoplayBlocked = false;
  }

  // ✅ Méthode de cleanup pour les changements de page
  cleanup() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    this.removeUnlockListeners();
  }
}

// Instance globale unique
export const globalAudio = GlobalAudioManager.getInstance();

// Pistes disponibles
export const TRACKS = {
  DASHBOARD: 'dashboard',
  BATTLE: 'battle'
} as const;

export const TRACK_SOURCES = {
  [TRACKS.DASHBOARD]: '/audio/02 Opening (part 2).mp3',
  [TRACKS.BATTLE]: '/audio/battle23.mp3'
} as const;

// Fonctions utilitaires
export const playDashboardMusic = () => {
  globalAudio.switchTrack(TRACK_SOURCES[TRACKS.DASHBOARD], TRACKS.DASHBOARD);
};

export const playBattleMusic = () => {
  globalAudio.switchTrack(TRACK_SOURCES[TRACKS.BATTLE], TRACKS.BATTLE);
};

export const stopMusic = () => {
  globalAudio.stop();
};

export const pauseMusic = () => {
  globalAudio.pause();
};

export const resumeMusic = () => {
  globalAudio.resume();
}; 