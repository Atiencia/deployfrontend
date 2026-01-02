import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live en milisegundos
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // 5 minutos por defecto
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }
}

const cache = new SimpleCache();

// Exportar función para limpiar todo el cache (útil al hacer login/logout)
export function clearAllCache(): void {
  cache.clear();
}

export interface UseCachedDataOptions {
  ttl?: number; // Time To Live en milisegundos
  forceRefresh?: boolean;
}

export function useCachedData<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  options: UseCachedDataOptions = {}
) {
  const { ttl = 5 * 60 * 1000, forceRefresh = false } = options;
  
  const [data, setData] = useState<T | null>(() => {
    return forceRefresh ? null : cache.get<T>(key);
  });
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (force: boolean = false) => {
    // Si tenemos datos en cache y no es forzado, no hacer nada
    if (!force && data && cache.get<T>(key)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      cache.set(key, result, ttl);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error(`Error fetching data for key ${key}:`, err);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFunction, ttl, data]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  
  const clearCache = useCallback(() => {
    cache.remove(key);
  }, [key]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
  };
}

export { cache };
export default useCachedData;