/**
 * Cache utility for Redis caching
 * Provides type-safe caching with automatic JSON serialization
 */

import redis from '../config/redis';
import logger from './logger';

// Default cache TTL in seconds
const DEFAULT_TTL = 300; // 5 minutes
const CATEGORY_TTL = 3600; // 1 hour (categories change rarely)
const SEARCH_TTL = 60; // 1 minute (search results change frequently)

/**
 * Check if Redis is available
 */
export const isRedisAvailable = (): boolean => {
  return redis !== null && redis.isOpen;
};

/**
 * Get a cached value
 * @param key - Cache key
 * @returns Parsed value or null if not found/expired
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!isRedisAvailable()) {
    return null;
  }

  try {
    const value = await redis!.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    logger.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set a cached value
 * @param key - Cache key
 * @param value - Value to cache (will be JSON stringified)
 * @param ttl - Time to live in seconds (default: 5 minutes)
 */
export const setCache = async <T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<boolean> => {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    await redis!.setEx(key, ttl, JSON.stringify(value));
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
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    await redis!.del(key);
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
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const keys = await redis!.keys(pattern);
    if (keys.length > 0) {
      await redis!.del(keys);
    }
    return true;
  } catch (error) {
    logger.error(`Cache delete pattern error for ${pattern}:`, error);
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
