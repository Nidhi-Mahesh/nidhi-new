import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp, getDoc, query, orderBy, runTransaction, where } from 'firebase/firestore';
import { cache, CacheKeys, CacheTags } from './cache';

export interface Post {
  id?: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  status: 'Published' | 'Draft' | 'Review';
  createdAt: any;
  updatedAt?: any;
  metaDescription?: string;
  tags?: string[];
  categories?: string[]; // Added categories field
  likeCount?: number;
  dislikeCount?: number;
  commentCount?: number;
  likes?: string[];
  dislikes?: string[];
  slug?: string; // Added slug field
}

const postsCollection = collection(db, 'posts');

// Helper to generate a URL-friendly slug
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
};

export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'slug'>): Promise<string> => {
  try {
    const slug = generateSlug(post.title);
    const data: any = {
      ...post,
      slug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likeCount: 0,
      dislikeCount: 0,
      commentCount: 0,
      likes: [],
      dislikes: [],
    };
    if (!data.tags) {
        data.tags = [];
    }
    if (!data.categories) { // Ensure categories array exists
        data.categories = [];
    }

    const docRef = await addDoc(postsCollection, data);
    
    // Invalidate posts cache
    await cache.clearByTags([CacheTags.POSTS]);
    // Also invalidate category caches if categories are present
    if (post.categories && post.categories.length > 0) {
        await cache.clearByTags(post.categories.map(cat => `${CacheTags.POSTS}:${cat}`));
    }
    
    return docRef.id;
  } catch (error: any) {
    console.error('🚨 Error in createPost:', error);
    throw new Error(`Failed to create post: ${error.message || 'Unknown error'}`);
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    return await cache.getOrSet(
      CacheKeys.posts.all(),
      async () => {
        const q = query(postsCollection, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
          } as Post;
        });
      },
      10 * 60 * 1000, // 10 minutes cache
      [CacheTags.POSTS]
    );
  } catch (error: any) {
    console.error('🚨 Error in getPosts:', error);
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
};

export const getPost = async (id: string): Promise<Post | null> => {
  try {
    return await cache.getOrSet(
      CacheKeys.posts.byId(id),
      async () => {
        const postDoc = doc(db, 'posts', id);
        const docSnap = await getDoc(postDoc);

        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Post;
        } else {
          console.log("No such document!");
          return null;
        }
      },
      15 * 60 * 1000, // 15 minutes cache
      [CacheTags.POSTS]
    );
  } catch (error: any) {
    console.error('🚨 Error in getPost:', error);
    throw new Error(`Failed to fetch post: ${error.message}`);
  }
};


export const updatePost = async (id: string, post: Partial<Omit<Post, 'id' | 'createdAt' | 'slug'>>): Promise<void> => {
  try {
    const postDoc = doc(db, 'posts', id);
    const updateData: any = {
      ...post,
      updatedAt: serverTimestamp(),
    };

    if (post.title) {
      updateData.slug = generateSlug(post.title);
    }

    await updateDoc(postDoc, updateData);
    
    // Invalidate cache for this specific post and all posts
    await cache.delete(CacheKeys.posts.byId(id));
    await cache.clearByTags([CacheTags.POSTS]);
    // Invalidate category caches if categories are present
    if (post.categories && post.categories.length > 0) {
        await cache.clearByTags(post.categories.map(cat => `${CacheTags.POSTS}:${cat}`));
    }
  } catch (error: any) {
    console.error('🚨 Error in updatePost:', error);
    throw new Error(`Failed to update post: ${error.message}`);
  }
};

export const deletePost = async (id: string): Promise<void> => {
  try {
    const postDoc = doc(db, 'posts', id);
    await deleteDoc(postDoc);
    
    // Invalidate cache for this specific post and all posts
    await cache.delete(CacheKeys.posts.byId(id));
    await cache.clearByTags([CacheTags.POSTS]);
    // Invalidate category caches if categories are present (we don't have direct access to post.categories here, so we'll rely on the general POSTS tag invalidation)
    // If more granular invalidation is needed, we'd need to fetch the post first to get its categories.
  } catch (error: any) {
    console.error('🚨 Error in deletePost:', error);
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

export const incrementCommentCount = async (postId: string) => {
    const postRef = doc(db, 'posts', postId);
    try {
        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) {
                throw "Document does not exist!";
            }
            const newCommentCount = (postDoc.data().commentCount || 0) + 1;
            transaction.update(postRef, { commentCount: newCommentCount });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw new Error("Failed to update comment count.");
    }
}

export const getPostsByCategory = async (category: string): Promise<Post[]> => {
  try {
    return await cache.getOrSet(
      CacheKeys.posts.byCategory(category), // Use defined cache key
      async () => {
        const q = query(postsCollection, where('categories', 'array-contains', category), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
          } as Post;
        });
      },
      10 * 60 * 1000, // 10 minutes cache
      [CacheTags.POSTS, category] // Tag with category for more granular invalidation
    );
  } catch (error: any) {
    console.error('🚨 Error in getPostsByCategory:', error);
    throw new Error(`Failed to fetch posts by category: ${error.message}`);
  }
};

export const searchPosts = async (searchQuery: string): Promise<Post[]> => {
  try {
    if (!searchQuery.trim()) {
      return [];
    }

    const cacheKey = CacheKeys.posts.search(searchQuery);
    
    return await cache.getOrSet(
      cacheKey,
      async () => {
        // Get all published posts first
        const allPosts = await getPosts();
        const publishedPosts = allPosts.filter(post => post.status === 'Published');
        
        const query = searchQuery.toLowerCase().trim();
        const searchTerms = query.split(' ').filter(term => term.length > 0);

        // Filter posts based on search terms
        const filteredPosts = publishedPosts.filter(post => {
          const searchableText = [
            post.title,
            post.content,
            post.metaDescription || '',
            post.author || '',
            ...(post.tags || []),
            ...(post.categories || [])
          ].join(' ').toLowerCase();

          // Check if all search terms are found in the searchable text
          return searchTerms.every(term => searchableText.includes(term));
        });

        // Sort by relevance
        return filteredPosts.sort((a, b) => {
          // Posts with query in title get higher priority
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          const queryInATitle = searchTerms.some(term => aTitle.includes(term));
          const queryInBTitle = searchTerms.some(term => bTitle.includes(term));

          if (queryInATitle && !queryInBTitle) return -1;
          if (!queryInATitle && queryInBTitle) return 1;

          // Then sort by creation date (newest first)
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return bDate - aDate;
        });
      },
      5 * 60 * 1000, // 5 minutes cache for search results
      [CacheTags.POSTS, `search:${searchQuery}`]
    );
  } catch (error: any) {
    console.error('🚨 Error in searchPosts:', error);
    throw new Error(`Failed to search posts: ${error.message}`);
  }
};

export const getPostsByTag = async (tag: string): Promise<Post[]> => {
  try {
    return await cache.getOrSet(
      CacheKeys.posts.byTag(tag),
      async () => {
        const q = query(postsCollection, where('tags', 'array-contains', tag), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
          } as Post;
        });
      },
      10 * 60 * 1000, // 10 minutes cache
      [CacheTags.POSTS, `tag:${tag}`]
    );
  } catch (error: any) {
    console.error('🚨 Error in getPostsByTag:', error);
    throw new Error(`Failed to fetch posts by tag: ${error.message}`);
  }
};
