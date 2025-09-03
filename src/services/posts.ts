
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
  const docRef = await addDoc(postsCollection, {
    title: post.title,
    content: post.content || '',
    author: post.author,
    status: post.status,
    metaDescription: post.metaDescription || '',
    tags: post.tags || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};


export const getPosts = async (): Promise<Post[]> => {
  const snapshot = await getDocs(postsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
};

export const updatePost = async (id: string, post: Partial<Post>): Promise<void> => {
  const postDoc = doc(db, 'posts', id);
  await updateDoc(postDoc, {
    ...post,
    updatedAt: serverTimestamp(),
  });
};

export const deletePost = async (id: string): Promise<void> => {
  const postDoc = doc(db, 'posts', id);
  await deleteDoc(postDoc);
};
