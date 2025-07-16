// ✅ SERVICE DE MONITORING DES PERFORMANCES

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: number;
  result_count?: number;
  cache_hit?: boolean;
}

interface PerformanceStats {
  totalQueries: number;
  averageResponseTime: number;
  slowQueries: number;
  cacheHitRate: number;
  errorRate: number;
}

export class PerformanceMonitor {
  private static metrics: QueryMetrics[] = [];
  private static readonly MAX_METRICS = 1000; // Garder les 1000 dernières métriques
  private static readonly SLOW_QUERY_THRESHOLD = 1000; // 1 seconde

  /**
   * Enregistrer une métrique de requête
   */
  static recordQuery(
    query: string, 
    duration: number, 
    resultCount?: number, 
    cacheHit: boolean = false
  ) {
    const metric: QueryMetrics = {
      query: this.sanitizeQuery(query),
      duration,
      timestamp: Date.now(),
      result_count: resultCount,
      cache_hit: cacheHit
    };

    this.metrics.push(metric);

    // Garder seulement les N dernières métriques
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Logger les requêtes lentes
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      console.warn(`🐌 Requête lente détectée (${duration}ms): ${metric.query}`);
    }

    // Logger si cache activé
    if (cacheHit) {
      console.log(`📋 Cache hit pour: ${metric.query} (${duration}ms)`);
    }
  }

  /**
   * Nettoyer les requêtes pour le logging (enlever les valeurs sensibles)
   */
  private static sanitizeQuery(query: string): string {
    return query
      .replace(/\$\d+/g, '?') // Remplacer les paramètres
      .replace(/'\w+'/g, "'***'") // Masquer les valeurs string
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim()
      .substring(0, 200); // Limiter la taille
  }

  /**
   * Obtenir les statistiques de performance
   */
  static getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        averageResponseTime: 0,
        slowQueries: 0,
        cacheHitRate: 0,
        errorRate: 0
      };
    }

    const totalQueries = this.metrics.length;
    const totalDuration = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    const averageResponseTime = totalDuration / totalQueries;
    const slowQueries = this.metrics.filter(m => m.duration > this.SLOW_QUERY_THRESHOLD).length;
    const cacheHits = this.metrics.filter(m => m.cache_hit).length;
    const cacheHitRate = cacheHits / totalQueries;

    return {
      totalQueries,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      slowQueries,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate: 0 // TODO: Implémenter le tracking d'erreurs
    };
  }

  /**
   * Obtenir les requêtes les plus lentes
   */
  static getSlowestQueries(limit: number = 10): QueryMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Obtenir les requêtes les plus fréquentes
   */
  static getMostFrequentQueries(limit: number = 10): Array<{query: string, count: number, avgDuration: number}> {
    const queryStats = new Map<string, {count: number, totalDuration: number}>();

    this.metrics.forEach(metric => {
      const existing = queryStats.get(metric.query);
      if (existing) {
        existing.count++;
        existing.totalDuration += metric.duration;
      } else {
        queryStats.set(metric.query, {
          count: 1,
          totalDuration: metric.duration
        });
      }
    });

    return Array.from(queryStats.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        avgDuration: Math.round(stats.totalDuration / stats.count * 100) / 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Générer un rapport de performance
   */
  static generateReport(): string {
    const stats = this.getStats();
    const slowestQueries = this.getSlowestQueries(5);
    const frequentQueries = this.getMostFrequentQueries(5);

    let report = `
📊 RAPPORT DE PERFORMANCE BASE DE DONNÉES
========================================

📈 Statistiques générales:
- Total requêtes: ${stats.totalQueries}
- Temps de réponse moyen: ${stats.averageResponseTime}ms
- Requêtes lentes (>${this.SLOW_QUERY_THRESHOLD}ms): ${stats.slowQueries}
- Taux de cache hit: ${(stats.cacheHitRate * 100).toFixed(1)}%

🐌 Requêtes les plus lentes:
`;

    slowestQueries.forEach((query, index) => {
      report += `${index + 1}. ${query.duration}ms - ${query.query}\n`;
    });

    report += `\n🔥 Requêtes les plus fréquentes:
`;

    frequentQueries.forEach((query, index) => {
      report += `${index + 1}. ${query.count}x (${query.avgDuration}ms avg) - ${query.query}\n`;
    });

    return report;
  }

  /**
   * Décorateur pour mesurer automatiquement les performances des fonctions
   */
  static measurePerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const methodName = `${target.constructor.name}.${propertyName}`;
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        
        let resultCount = 0;
        if (Array.isArray(result)) {
          resultCount = result.length;
        } else if (result && typeof result === 'object' && 'length' in result) {
          resultCount = result.length;
        }

        PerformanceMonitor.recordQuery(
          `Function: ${methodName}`,
          duration,
          resultCount
        );

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        PerformanceMonitor.recordQuery(
          `Function: ${methodName} (ERROR)`,
          duration
        );
        throw error;
      }
    };

    return descriptor;
  }

  /**
   * Wrapper pour mesurer les requêtes Drizzle
   */
  static async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    cacheHit: boolean = false
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      let resultCount = 0;
      if (Array.isArray(result)) {
        resultCount = result.length;
      }

      this.recordQuery(queryName, duration, resultCount, cacheHit);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordQuery(`${queryName} (ERROR)`, duration);
      throw error;
    }
  }

  /**
   * Nettoyer les anciennes métriques
   */
  static cleanup(olderThanHours: number = 24) {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);
    const initialLength = this.metrics.length;
    
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff);
    
    const removed = initialLength - this.metrics.length;
    if (removed > 0) {
      console.log(`🧹 Nettoyage des métriques: ${removed} entrées supprimées`);
    }
  }

  /**
   * Démarrer le monitoring automatique
   */
  static startMonitoring() {
    console.log('📊 Démarrage du monitoring de performance');
    
    // Nettoyage automatique toutes les heures
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);

    // Rapport de performance toutes les 30 minutes
    setInterval(() => {
      if (this.metrics.length > 0) {
        console.log(this.generateReport());
      }
    }, 30 * 60 * 1000);
  }
}