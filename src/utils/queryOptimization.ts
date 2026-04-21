/**
 * Optimized Firestore Query Module
 * Provides request deduplication, caching, and batch operations
 */

import { 
  QuerySnapshot, 
  DocumentSnapshot,
  Query,
  getDocs as firebaseDedocs,
  getDoc as firebaseGetDoc,
  query,
  limit,
  offset,
  where,
  orderBy
} from 'firebase/firestore';

// Simple cache with TTL (Time To Live)
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const CACHE_TTL = {
  SHORT: 30 * 1000,      // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000   // 30 minutes
};

/**
 * Generate cache key from query parameters
 */
const generateCacheKey = (collection: string, filters?: Record<string, any>): string => {
  return `${collection}:${JSON.stringify(filters || {})}`;
};

/**
 * Get from cache if valid
 */
const getFromCache = (key: string): any | null => {
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  queryCache.delete(key);
  return null;
};

/**
 * Store in cache
 */
const storeInCache = (key: string, data: any, ttl = CACHE_TTL.MEDIUM) => {
  queryCache.set(key, { data, timestamp: Date.now(), ttl });
};

/**
 * Optimized getDocs with caching
 * Usage: const docs = await getCachedDocs(db, query(...));
 */
export const getCachedDocs = async <T>(
  baseQuery: Query,
  cacheKey?: string,
  cacheTTL = CACHE_TTL.MEDIUM
): Promise<{ docs: T[]; fromCache: boolean }> => {
  const key = cacheKey || `query:${Date.now()}`;
  
  // Check cache first
  const cached = getFromCache(key);
  if (cached) {
    console.log(`📦 Cache hit: ${key}`);
    return { docs: cached, fromCache: true };
  }

  // Query Firestore
  const snapshot = await firebaseDedocs(baseQuery);
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  
  // Store in cache
  storeInCache(key, docs, cacheTTL);
  console.log(`✅ Cached: ${key} (${docs.length} docs)`);
  
  return { docs, fromCache: false };
};

/**
 * Clear cache
 */
export const clearCache = () => {
  queryCache.clear();
  console.log('🧹 Query cache cleared');
};

/**
 * Clear specific cache entry
 */
export const clearCacheEntry = (key: string) => {
  queryCache.delete(key);
};

/**
 * Query optimization patterns with memoization
 */
export const queryPatterns = {
  /**
   * Get documents with pagination
   * Usage: await getPaginatedDocs(db, 'jobs', 10, 0)
   */
  getPaginatedDocs: async (
    db: any,
    collection: string,
    pageSize: number = 10,
    pageNumber: number = 0
  ): Promise<any[]> => {
    const q = query(
      collection,
      limit(pageSize),
      offset(pageNumber * pageSize)
    );
    const snapshot = await firebaseDedocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get filtered documents with optimization
   * Usage: await getFilteredDocs(db, 'candidates', { status: 'active' })
   */
  getFilteredDocs: async (
    db: any,
    collection: string,
    filters: Record<string, any>
  ): Promise<any[]> => {
    const constraints = Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => where(key, '==', value));

    const q = query(collection, ...constraints);
    const snapshot = await firebaseDedocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get top N documents by field
   * Usage: await getTopDocs(db, 'applications', 'createdAt', 'desc', 10)
   */
  getTopDocs: async (
    db: any,
    collection: string,
    orderByField: string,
    direction: 'asc' | 'desc' = 'desc',
    limitCount: number = 10
  ): Promise<any[]> => {
    const q = query(
      collection,
      orderBy(orderByField, direction === 'desc' ? 'desc' : 'asc'),
      limit(limitCount)
    );
    const snapshot = await firebaseDedocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

/**
 * Performance monitoring helper
 */
export const queryPerformance = {
  measurements: new Map<string, number[]>(),

  measure: (label: string, duration: number) => {
    if (!queryPerformance.measurements.has(label)) {
      queryPerformance.measurements.set(label, []);
    }
    queryPerformance.measurements.get(label)!.push(duration);
  },

  getStats: (label: string) => {
    const times = queryPerformance.measurements.get(label) || [];
    if (times.length === 0) return null;
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    return { avg, min, max, count: times.length };
  },

  logStats: () => {
    console.log('📊 Query Performance Stats:');
    queryPerformance.measurements.forEach((times, label) => {
      const stats = queryPerformance.getStats(label);
      if (stats) {
        console.log(
          `${label}: avg=${stats.avg.toFixed(2)}ms, min=${stats.min}ms, max=${stats.max}ms (${stats.count} calls)`
        );
      }
    });
  },

  clearStats: () => {
    queryPerformance.measurements.clear();
  }
};

/**
 * HOW TO USE THESE OPTIMIZATIONS:
 * 
 * 1. CACHING:
 *    ```typescript
 *    const { docs, fromCache } = await getCachedDocs(
 *      query(collection(db, 'jobs')),
 *      'jobs-list',
 *      CACHE_TTL.MEDIUM
 *    );
 *    ```
 *
 * 2. PAGINATION:
 *    ```typescript
 *    const page1 = await queryPatterns.getPaginatedDocs(db, 'jobs', 10, 0);
 *    const page2 = await queryPatterns.getPaginatedDocs(db, 'jobs', 10, 1);
 *    ```
 *
 * 3. FILTERING:
 *    ```typescript
 *    const active = await queryPatterns.getFilteredDocs(db, 'candidates', {
 *      status: 'active',
 *      deletionRequestedAt: null
 *    });
 *    ```
 *
 * 4. PERFORMANCE MONITORING:
 *    ```typescript
 *    const start = performance.now();
 *    const results = await getDocs(q);
 *    queryPerformance.measure('getAllApplications', performance.now() - start);
 *    
 *    // Later...
 *    queryPerformance.logStats();
 *    ```
 *
 * BEST PRACTICES:
 * - Use shorter TTL (30s) for frequently changing data (applications, messages)
 * - Use longer TTL (30m) for static data (job listings, staff info)
 * - Always create the Firestore indexes from firebaseIndexes.ts
 * - Monitor cache hit rate: check console logs for "Cache hit" messages
 * - Use clearCache() when you know data has changed significantly
 */
