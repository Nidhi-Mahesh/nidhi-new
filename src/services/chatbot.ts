
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from './posts';

/**
 * Fetches and formats published posts specifically for the chatbot's knowledge base.
 * @returns A simplified list of posts with only title and content.
 */
export const getPostsForChatbot = async (): Promise<{ title: string; content: string }[]> => {
  try {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, where('status', '==', 'Published'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return [];
    }

    // Return only the necessary fields for the prompt to save tokens and improve performance.
    return snapshot.docs.map(doc => {
      const data = doc.data() as Post;
      return { 
        title: data.title,
        content: data.content,
      };
    });
  } catch (error: any) {
    console.error('🚨 Error in getPostsForChatbot:', error);
    // Return empty array on error so the chatbot can still respond gracefully.
    return [];
  }
};
