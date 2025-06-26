class GlobalAudioManager {
  private static instance: GlobalAudioManager;
  private currentAudio: HTMLAudioElement | null = null;
  private currentTrack: string | null = null;
  private volume: number = 0.3;
  private isInitialized: boolean = false;

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
    
    console.log('🎵 Audio Manager initialisé');
    this.isInitialized = true;
  }

  async switchTrack(src: string, trackName: string) {
    if (!this.isInitialized) this.initialize();
    if (!this.currentAudio) return;

    // Si c'est déjà la même piste, ne rien faire
    if (this.currentTrack === trackName) {
      console.log(`🎵 Piste "${trackName}" déjà en cours (${src})`);
      return;
    }

    console.log(`🎵 Changement audio:`);
    console.log(`  - Ancien: ${this.currentTrack}`);
    console.log(`  - Nouveau: ${trackName} (${src})`);

    // Changer la source et relancer
    this.currentAudio.src = src;
    this.currentTrack = trackName;

    try {
      await this.currentAudio.play();
      console.log(`✅ Lecture démarrée: ${trackName} - ${src}`);
    } catch (error) {
      console.warn('❌ Erreur lecture audio:', error);
      console.warn(`   Fichier: ${src}`);
    }
  }

  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  resume() {
    if (this.currentAudio) {
      this.currentAudio.play().catch(console.warn);
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