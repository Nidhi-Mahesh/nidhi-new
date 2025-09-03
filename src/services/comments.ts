
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { incrementCommentCount } from './posts';

export interface Comment {
    id?: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorAvatar: string | null;
    content: string;
    createdAt: any;
}

const commentsCollection = collection(db, 'comments');

export const addComment = async (comment: Omit<Comment, 'id' | 'createdAt'>): Promise<string> => {
    try {
        const docRef = await addDoc(commentsCollection, {
            ...comment,
            createdAt: serverTimestamp(),
        });
        // After adding comment, increment the counter on the post
        await incrementCommentCount(comment.postId);
        return docRef.id;
    } catch (error: any) {
        console.error('🚨 Error in addComment:', error);
        throw new Error(`Failed to add comment: ${error.message}`);
    }
}

export const getCommentsForPost = async (postId: string): Promise<Comment[]> => {
    try {
        const q = query(commentsCollection, where('postId', '==', postId), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Comment));
    } catch (error: any) {
        console.error('🚨 Error in getCommentsForPost:', error);
        throw new Error(`Failed to fetch comments: ${error.message}`);
    }
}
