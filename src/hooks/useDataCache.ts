import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheOptions {
  /** Cache key prefix */
  key: string;
  /** Time-to-live in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Whether to persist to AsyncStorage (default: false) */
  persist?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache store
const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Hook for caching data with TTL support.
 * Supports both in-memory and AsyncStorage persistence.
 */
export function useDataCache<T>(
  fetcher: () => Promise<T>,
  options: CacheOptions
) {
  const { key, ttl = 5 * 60 * 1000, persist = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const isCacheValid = useCallback((entry: CacheEntry<unknown> | undefined): boolean => {
    if (!entry) return false;
    return Date.now() - entry.timestamp < ttl;
  }, [ttl]);

  const loadFromCache = useCallback(async (): Promise<T | null> => {
    // Check memory cache first
    const memEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
    if (isCacheValid(memEntry)) {
      return memEntry!.data;
    }

    // Check AsyncStorage if persistent
    if (persist) {
      try {
        const stored = await AsyncStorage.getItem(`cache_${key}`);
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored);
          if (isCacheValid(entry)) {
            memoryCache.set(key, entry);
            return entry.data;
          }
        }
      } catch {
        // Ignore cache read errors
      }
    }

    return null;
  }, [key, persist, isCacheValid]);

  const saveToCache = useCallback(async (value: T) => {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
    };

    memoryCache.set(key, entry as CacheEntry<unknown>);

    if (persist) {
      try {
        await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch {
        // Ignore cache write errors
      }
    }
  }, [key, persist]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
        await saveToCache(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, saveToCache]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const cached = await loadFromCache();
      if (cached !== null && !cancelled) {
        setData(cached);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        await refresh();
      }
    };

    load();

    return () => { cancelled = true; };
  }, [key]); // Only re-run when key changes

  const invalidate = useCallback(() => {
    memoryCache.delete(key);
    if (persist) {
      AsyncStorage.removeItem(`cache_${key}`).catch(() => {});
    }
  }, [key, persist]);

  return { data, loading, error, refresh, invalidate };
}

/**
 * Clear all cached data
 */
export async function clearAllCache(): Promise<void> {
  memoryCache.clear();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith('cache_'));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // Ignore errors
  }
}

export default useDataCache;
