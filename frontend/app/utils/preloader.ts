// ✅ SYSTÈME DE PRELOADING INTELLIGENT

interface PreloadConfig {
  priority: 'high' | 'medium' | 'low';
  delay?: number; // Délai avant le preload (ms)
  condition?: () => boolean; // Condition pour preloader
}

class SmartPreloader {
  private static instance: SmartPreloader;
  private preloadedModules = new Set<string>();
  private preloadQueue: Array<{
    key: string;
    loader: () => Promise<any>;
    config: PreloadConfig;
  }> = [];

  static getInstance(): SmartPreloader {
    if (!SmartPreloader.instance) {
      SmartPreloader.instance = new SmartPreloader();
    }
    return SmartPreloader.instance;
  }

  // ✅ Ajouter un module au preload
  addToQueue(
    key: string,
    loader: () => Promise<any>,
    config: PreloadConfig = { priority: 'medium' }
  ) {
    if (this.preloadedModules.has(key)) {
      return; // Déjà preloadé
    }

    this.preloadQueue.push({ key, loader, config });
    this.processQueue();
  }

  // ✅ Traiter la queue de preload
  private async processQueue() {
    if (typeof window === 'undefined') return;

    // Trier par priorité
    this.preloadQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.config.priority] - priorityOrder[a.config.priority];
    });

    while (this.preloadQueue.length > 0) {
      const item = this.preloadQueue.shift()!;
      
      // Vérifier la condition
      if (item.config.condition && !item.config.condition()) {
        continue;
      }

      try {
        // Attendre le délai si spécifié
        if (item.config.delay) {
          await new Promise(resolve => setTimeout(resolve, item.config.delay));
        }

        // Preloader quand le navigateur est idle
        await this.whenIdle(() => item.loader());
        this.preloadedModules.add(item.key);
        
      } catch (error) {
        // Ignorer les erreurs de preload
      }
    }
  }

  // ✅ Attendre que le navigateur soit idle
  private whenIdle(callback: () => Promise<any>): Promise<void> {
    return new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(
          async () => {
            await callback();
            resolve();
          },
          { timeout: 5000 }
        );
      } else {
        // Fallback pour navigateurs sans requestIdleCallback
        setTimeout(async () => {
          await callback();
          resolve();
        }, 0);
      }
    });
  }

  // ✅ Preloader basé sur la navigation
  preloadForRoute(routeName: string) {
    const routePreloads: Record<string, Array<{
      key: string;
      loader: () => Promise<any>;
      config: PreloadConfig;
    }>> = {
      'dashboard': [
        {
          key: 'battle-components',
          loader: () => Promise.all([
            import('~/components/battle/BattleField'),
            import('~/components/battle/BattleActions')
          ]),
          config: { priority: 'medium', delay: 2000 }
        }
      ],
      'pokemon': [
        {
          key: 'pokemon-components',
          loader: () => Promise.all([
            import('~/components/pokemon/VirtualizedGrid'),
            import('~/components/pokemon/ModernPokemonCard')
          ]),
          config: { priority: 'high', delay: 1000 }
        }
      ],
      'battle': [
        {
          key: 'battle-full',
          loader: () => Promise.all([
            import('~/components/battle/BattleField'),
            import('~/components/battle/BattleActions'),
            import('~/components/battle/BattleJournal'),
            import('~/components/battle/BattleWeatherDisplay'),
            import('~/components/modals/HackChallengeModal')
          ]),
          config: { priority: 'high' }
        }
      ]
    };

    const preloads = routePreloads[routeName];
    if (preloads) {
      preloads.forEach(({ key, loader, config }) => {
        this.addToQueue(key, loader, config);
      });
    }
  }

  // ✅ Preloader basé sur les interactions utilisateur
  preloadOnHover(componentKey: string, loader: () => Promise<any>) {
    this.addToQueue(componentKey, loader, {
      priority: 'high',
      delay: 100 // Petit délai pour éviter les hover accidentels
    });
  }

  // ✅ Preloader conditionnel
  preloadWhen(
    key: string,
    loader: () => Promise<any>,
    condition: () => boolean,
    config: Partial<PreloadConfig> = {}
  ) {
    this.addToQueue(key, loader, {
      priority: 'medium',
      condition,
      ...config
    });
  }
}

export const preloader = SmartPreloader.getInstance();

// ✅ Hook pour preloader facilement
export function useSmartPreload() {
  return {
    preloadForRoute: (route: string) => preloader.preloadForRoute(route),
    preloadOnHover: (key: string, loader: () => Promise<any>) => 
      preloader.preloadOnHover(key, loader),
    preloadWhen: (
      key: string, 
      loader: () => Promise<any>, 
      condition: () => boolean,
      config?: Partial<PreloadConfig>
    ) => preloader.preloadWhen(key, loader, condition, config)
  };
}

// ✅ Utilitaires de détection de capacité réseau
export function getNetworkInfo() {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      saveData: connection.saveData || false
    };
  }
  return { effectiveType: '4g', downlink: 10, saveData: false };
}

// ✅ Preloader adaptatif selon la connexion
export function shouldPreload(): boolean {
  const { effectiveType, saveData } = getNetworkInfo();
  
  if (saveData) return false; // Respecter le mode économie de données
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return false;
  
  return true;
}