/**
 * Advanced Cache Utility with Redis + In-Memory Fallback
 * نظام تخزين مؤقت متقدم يدعم Redis مع fallback للذاكرة
 */

import redis from '../config/redis';
import logger from './logger';

// Default cache TTL in seconds
const DEFAULT_TTL = 300; // 5 minutes
const CATEGORY_TTL = 3600; // 1 hour (categories change rarely)
const SEARCH_TTL = 60; // 1 minute (search results change frequently)

/**
 * In-Memory Cache Configuration
 */
const MEMORY_CACHE_CONFIG = {
  maxItems: 1000,
  cleanupInterval: 60000, // دقيقة
};

/**
 * In-Memory Cache (Fallback when Redis unavailable)
 */
interface MemoryCacheItem<T> {
  value: T;
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryCacheItem<unknown>>();

/**
 * تنظيف العناصر المنتهية
 */
function cleanupExpiredItems(): void {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, item] of memoryCache) {
    if (item.expiresAt < now) {
      memoryCache.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    logger.debug(`Memory cache cleanup: removed ${cleaned} expired items`);
  }
}

// تنظيف دوري
setInterval(cleanupExpiredItems, MEMORY_CACHE_CONFIG.cleanupInterval);

/**
 * Check if Redis is available
 */
export const isRedisAvailable = (): boolean => {
  return redis !== null && redis.isOpen;
};

/**
 * Get a cached value (with memory fallback)
 * @param key - Cache key
 * @returns Parsed value or null if not found/expired
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    // Try Redis first
    if (isRedisAvailable()) {
      const value = await redis!.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    }

    // Fallback to memory cache
    const memItem = memoryCache.get(key) as MemoryCacheItem<T> | undefined;
    if (!memItem) return null;
    if (memItem.expiresAt < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return memItem.value;
  } catch (error) {
    logger.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set a cached value (with memory fallback)
 * @param key - Cache key
 * @param value - Value to cache (will be JSON stringified)
 * @param ttl - Time to live in seconds (default: 5 minutes)
 */
export const setCache = async <T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<boolean> => {
  try {
    // Try Redis first
    if (isRedisAvailable()) {
      await redis!.setEx(key, ttl, JSON.stringify(value));
      return true;
    }

    // Fallback to memory cache
    if (memoryCache.size >= MEMORY_CACHE_CONFIG.maxItems) {
      cleanupExpiredItems();
      // Still full? Remove oldest
      if (memoryCache.size >= MEMORY_CACHE_CONFIG.maxItems) {
        const firstKey = memoryCache.keys().next().value;
        if (firstKey) memoryCache.delete(firstKey);
      }
    }

    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
    return true;
  } catch (error) {
    logger.error(`Cache set error for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete a cached value
 * @param key - Cache key
 */
export const deleteCache = async (key: string): Promise<boolean> => {
  try {
    if (isRedisAvailable()) {
      await redis!.del(key);
    }
    memoryCache.delete(key);
    return true;
  } catch (error) {
    logger.error(`Cache delete error for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete all cached values matching a pattern
 * @param pattern - Pattern to match (e.g., "categories:*")
 */
export const deleteCachePattern = async (pattern: string): Promise<boolean> => {
  try {
    // Redis
    if (isRedisAvailable()) {
      const keys = await redis!.keys(pattern);
      if (keys.length > 0) {
        await redis!.del(keys);
      }
    }

    // Memory cache fallback
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
    return true;
  } catch (error) {
    logger.error(`Cache delete pattern error for ${pattern}:`, error);
    return false;
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (): Promise<{
  type: 'redis' | 'memory';
  itemCount: number;
  isAvailable: boolean;
}> => {
  if (isRedisAvailable()) {
    try {
      const dbSize = await redis!.dbSize();
      return { type: 'redis', itemCount: dbSize, isAvailable: true };
    } catch {
      return { type: 'redis', itemCount: 0, isAvailable: false };
    }
  }
  return { type: 'memory', itemCount: memoryCache.size, isAvailable: true };
};

/**
 * Flush all cache
 */
export const flushCache = async (): Promise<boolean> => {
  try {
    if (isRedisAvailable()) {
      await redis!.flushDb();
    }
    memoryCache.clear();
    logger.info('Cache flushed');
    return true;
  } catch (error) {
    logger.error('Cache flush error:', error);
    return false;
  }
};

// ============================================
// Category Cache Keys
// ============================================

export const CACHE_KEYS = {
  // Categories
  ALL_CATEGORIES: 'categories:all',
  CATEGORY_TREE: 'categories:tree',
  CATEGORY_BY_ID: (id: string) => `categories:id:${id}`,
  CATEGORY_BY_SLUG: (slug: string) => `categories:slug:${slug}`,

  // Search
  SEARCH_RESULTS: (query: string, page: number) => `search:${query}:${page}`,
  SEARCH_SUGGESTIONS: (query: string) => `search:suggestions:${query}`,

  // Items
  FEATURED_ITEMS: 'items:featured',
  TRENDING_ITEMS: 'items:trending',
  ITEM_BY_ID: (id: string) => `items:id:${id}`,

  // Listings
  LISTINGS_BY_CATEGORY: (categoryId: string, page: number) => `listings:category:${categoryId}:${page}`,

  // Prices
  GOLD_PRICES: 'prices:gold',
  SILVER_PRICES: 'prices:silver',
} as const;

export const CACHE_TTL = {
  CATEGORIES: CATEGORY_TTL,
  SEARCH: SEARCH_TTL,
  FEATURED: 300, // 5 minutes
  TRENDING: 180, // 3 minutes
  PRICES: 60, // 1 minute
  DEFAULT: DEFAULT_TTL,
} as const;

/**
 * Cache wrapper - get from cache or fetch from source
 * @param key - Cache key
 * @param fetcher - Function to fetch data if not cached
 * @param ttl - Time to live in seconds
 */
export const cacheOrFetch = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> => {
  // Try to get from cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch from source
  const data = await fetcher();

  // Cache the result (don't await, fire and forget)
  setCache(key, data, ttl).catch(() => {
    // Ignore cache set errors
  });

  return data;
};
