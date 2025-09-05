
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { incrementCommentCount } from './posts';
import { cache, CacheKeys, CacheTags } from './cache';

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
        
        // Invalidate comments cache for this post
        await cache.delete(CacheKeys.comments.byPost(comment.postId));
        
        return docRef.id;
    } catch (error: any) {
        console.error('🚨 Error in addComment:', error);
        throw new Error(`Failed to add comment: ${error.message}`);
    }
}

export const getCommentsForPost = async (postId: string): Promise<Comment[]> => {
    try {
        return await cache.getOrSet(
            CacheKeys.comments.byPost(postId),
            async () => {
                const q = query(commentsCollection, where('postId', '==', postId));
                const snapshot = await getDocs(q);
                
                const comments = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Comment));

                // Sort comments on the client-side to avoid needing a composite index
                comments.sort((a, b) => {
                    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
                    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
                    return dateB.getTime() - dateA.getTime();
                });

                return comments;
            },
            5 * 60 * 1000, // 5 minutes cache
            [CacheTags.COMMENTS]
        );
    } catch (error: any) {
        console.error('🚨 Error in getCommentsForPost:', error);
        throw new Error(`Failed to fetch comments: ${error.message}`);
    }
}
