// ✅ SYSTÈME DE CACHE SIMPLE POUR OPTIMISER LES PERFORMANCES

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes par défaut
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const timeToLive = ttl || this.defaultTTL;
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + timeToLive
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Nettoyage automatique des entrées expirées
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// ✅ INSTANCES DE CACHE GLOBALES
export const pokemonCache = new SimpleCache<any>(10 * 60 * 1000); // 10 minutes
export const teamCache = new SimpleCache<any>(5 * 60 * 1000); // 5 minutes
export const battleCache = new SimpleCache<any>(2 * 60 * 1000); // 2 minutes

// ✅ NETTOYAGE AUTOMATIQUE TOUTES LES 5 MINUTES
setInterval(() => {
  pokemonCache.cleanup();
  teamCache.cleanup();
  battleCache.cleanup();
}, 5 * 60 * 1000);

// ✅ HELPER POUR CRÉER DES CLÉS DE CACHE CONSISTANTES
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return `${prefix}:${sortedParams}`;
}

// ✅ HOOK POUR UTILISER LE CACHE AVEC REACT
import { useEffect, useState } from 'react';

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  cache: SimpleCache<T>,
  dependencies: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier le cache d'abord
      const cachedData = cache.get(key);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      // Sinon, fetcher les données
      const result = await fetcher();
      cache.set(key, result);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}