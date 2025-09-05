import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, deleteDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface CacheEntry {
  key: string;
  data: any;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  tags?: string[];
}

const cacheCollection = collection(db, 'cache');

export class CacheService {
  private static instance: CacheService;
  private memoryCache = new Map<string, { data: any; expiresAt: number; tags?: string[] }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Get cached data by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && Date.now() < memoryEntry.expiresAt) {
        return memoryEntry.data as T;
      }

      // Check Firestore cache
      const cacheDoc = doc(cacheCollection, key);
      const docSnap = await getDoc(cacheDoc);

      if (docSnap.exists()) {
        const entry = docSnap.data() as CacheEntry;
        
        // Check if expired
        if (entry.expiresAt.toMillis() > Date.now()) {
          // Update memory cache
          this.memoryCache.set(key, {
            data: entry.data,
            expiresAt: entry.expiresAt.toMillis(),
            tags: entry.tags
          });
          return entry.data as T;
        } else {
          // Remove expired entry
          await this.delete(key);
        }
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  async set(key: string, data: any, ttlMs?: number, tags?: string[]): Promise<void> {
    try {
      const ttl = ttlMs || this.DEFAULT_TTL;
      const now = Date.now();
      const expiresAt = now + ttl;

      // Set in memory cache
      this.memoryCache.set(key, { data, expiresAt, tags });

      // Set in Firestore cache
      const cacheEntry: CacheEntry = {
        key,
        data,
        createdAt: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(expiresAt),
        tags
      };

      await setDoc(doc(cacheCollection, key), cacheEntry);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data by key
   */
  async delete(key: string): Promise<void> {
    try {
      // Remove from memory cache
      this.memoryCache.delete(key);

      // Remove from Firestore cache
      await deleteDoc(doc(cacheCollection, key));
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear cache by tags
   */
  async clearByTags(tags: string[]): Promise<void> {
    try {
      // Clear from memory cache
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
          this.memoryCache.delete(key);
        }
      }

      // Clear from Firestore cache
      for (const tag of tags) {
        const q = query(cacheCollection, where('tags', 'array-contains', tag));
        const snapshot = await getDocs(q);
        
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error('Cache clear by tags error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear();

      // Clear Firestore cache
      const snapshot = await getDocs(cacheCollection);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<void> {
    try {
      const now = Date.now();

      // Clean memory cache
      for (const [key, entry] of this.memoryCache.entries()) {
        if (now >= entry.expiresAt) {
          this.memoryCache.delete(key);
        }
      }

      // Clean Firestore cache
      const q = query(cacheCollection, where('expiresAt', '<=', Timestamp.fromMillis(now)));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  /**
   * Get or set pattern - if data exists return it, otherwise execute function and cache result
   */
  async getOrSet<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    ttlMs?: number, 
    tags?: string[]
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFunction();
    await this.set(key, data, ttlMs, tags);
    return data;
  }
}

// Export singleton instance
export const cache = CacheService.getInstance();

// Cache key generators
export const CacheKeys = {
  posts: {
    all: () => 'posts:all',
    byId: (id: string) => `posts:${id}`,
    byAuthor: (authorId: string) => `posts:author:${authorId}`,
    published: () => 'posts:published',
    drafts: () => 'posts:drafts',
    byCategory: (category: string) => `posts:category:${category}`,
    byTag: (tag: string) => `posts:tag:${tag}`,
    search: (query: string) => `posts:search:${encodeURIComponent(query.toLowerCase())}`
  },
  comments: {
    byPost: (postId: string) => `comments:post:${postId}`
  },
  users: {
    all: () => 'users:all',
    byId: (id: string) => `users:${id}`
  }
};

// Cache tags for invalidation
export const CacheTags = {
  POSTS: 'posts',
  COMMENTS: 'comments',
  USERS: 'users',
  MEDIA: 'media'
};
