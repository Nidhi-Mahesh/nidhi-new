
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp, getDoc, query, orderBy, runTransaction } from 'firebase/firestore';

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
  likeCount?: number;
  dislikeCount?: number;
  commentCount?: number;
  likes?: string[];
  dislikes?: string[];
}

const postsCollection = collection(db, 'posts');

export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const data: any = {
      ...post,
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

    const docRef = await addDoc(postsCollection, data);
    return docRef.id;
  } catch (error: any) {
    console.error('🚨 Error in createPost:', error);
    throw new Error(`Failed to create post: ${error.message || 'Unknown error'}`);
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
      } as Post;
    });
  } catch (error: any) {
    console.error('🚨 Error in getPosts:', error);
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
};

export const getPost = async (id: string): Promise<Post | null> => {
  try {
    const postDoc = doc(db, 'posts', id);
    const docSnap = await getDoc(postDoc);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Post;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error: any) {
    console.error('🚨 Error in getPost:', error);
    throw new Error(`Failed to fetch post: ${error.message}`);
  }
};


export const updatePost = async (id: string, post: Partial<Omit<Post, 'id' | 'createdAt'>>): Promise<void> => {
  try {
    const postDoc = doc(db, 'posts', id);
    await updateDoc(postDoc, {
      ...post,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('🚨 Error in updatePost:', error);
    throw new Error(`Failed to update post: ${error.message}`);
  }
};

export const deletePost = async (id: string): Promise<void> => {
  try {
    const postDoc = doc(db, 'posts', id);
    await deleteDoc(postDoc);
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
