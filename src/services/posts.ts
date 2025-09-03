
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface Post {
  id?: string;
  title: string;
  content: string;
  author: string;
  status: 'Published' | 'Draft' | 'Review';
  createdAt: any;
  updatedAt?: any;
  metaDescription?: string;
  tags?: string[];
}

const postsCollection = collection(db, 'posts');

export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    console.log('🔥 createPost called with:', post);
    console.log('🔥 Database instance:', db);
    console.log('🔥 Posts collection:', postsCollection);

    // Validate required fields
    if (!post.title || !post.author) {
      throw new Error('Title and author are required');
    }

    const data: any = {
      title: post.title.trim(),
      content: post.content || '',
      author: post.author.trim(),
      status: post.status,
      metaDescription: post.metaDescription || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (post.tags && post.tags.length > 0) {
      data.tags = post.tags;
    } else {
      data.tags = [];
    }

    console.log('🔥 Data to be written:', data);

    const docRef = await addDoc(postsCollection, data);
    console.log('🔥 Document written successfully with ID:', docRef.id);
    
    return docRef.id;
  } catch (error: any) {
    console.error('🚨 Error in createPost:', error);
    console.error('🚨 Error code:', error.code);
    console.error('🚨 Error message:', error.message);
    console.error('🚨 Full error:', error);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Check your Firestore security rules.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firestore service is temporarily unavailable.');
    } else if (error.code === 'failed-precondition') {
      throw new Error('Firestore operation failed. Check your configuration.');
    } else if (error.code === 'invalid-argument') {
      throw new Error('Invalid data provided to Firestore.');
    } else {
      throw new Error(`Failed to create post: ${error.message || 'Unknown error'}`);
    }
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    console.log('🔥 getPosts called');
    const snapshot = await getDocs(postsCollection);
    console.log('🔥 Retrieved', snapshot.docs.length, 'posts');
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        title: data.title || 'Untitled',
        author: data.author || 'Unknown',
        status: data.status || 'Draft',
        content: data.content || '',
        metaDescription: data.metaDescription || '',
        tags: data.tags || []
      } as Post;
    });
  } catch (error: any) {
    console.error('🚨 Error in getPosts:', error);
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
};

export const updatePost = async (id: string, post: Partial<Post>): Promise<void> => {
  try {
    console.log('🔥 updatePost called for ID:', id, 'with data:', post);
    const postDoc = doc(db, 'posts', id);
    await updateDoc(postDoc, {
      ...post,
      updatedAt: serverTimestamp(),
    });
    console.log('🔥 Post updated successfully');
  } catch (error: any) {
    console.error('🚨 Error in updatePost:', error);
    throw new Error(`Failed to update post: ${error.message}`);
  }
};

export const deletePost = async (id: string): Promise<void> => {
  try {
    console.log('🔥 deletePost called for ID:', id);
    const postDoc = doc(db, 'posts', id);
    await deleteDoc(postDoc);
    console.log('🔥 Post deleted successfully');
  } catch (error: any) {
    console.error('🚨 Error in deletePost:', error);
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};
