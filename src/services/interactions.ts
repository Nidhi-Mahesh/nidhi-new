
import { db } from '@/lib/firebase';
import { doc, runTransaction, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Post } from './posts';
import { cache, CacheKeys, CacheTags } from './cache';

export type InteractionType = 'like' | 'dislike';

export const updateInteraction = async (postId: string, userId: string, type: InteractionType) => {
    const postRef = doc(db, 'posts', postId);

    try {
        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) {
                throw "Document does not exist!";
            }

            const postData = postDoc.data() as Post;
            const likes = postData.likes || [];
            const dislikes = postData.dislikes || [];
            
            const hasLiked = likes.includes(userId);
            const hasDisliked = dislikes.includes(userId);

            let newLikes = [...likes];
            let newDislikes = [...dislikes];

            if (type === 'like') {
                if (hasLiked) {
                    // User is un-liking
                    newLikes = newLikes.filter(uid => uid !== userId);
                } else {
                    // User is liking
                    newLikes.push(userId);
                    // If user had disliked, remove dislike
                    if (hasDisliked) {
                        newDislikes = newDislikes.filter(uid => uid !== userId);
                    }
                }
            } else if (type === 'dislike') {
                if (hasDisliked) {
                    // User is un-disliking
                    newDislikes = newDislikes.filter(uid => uid !== userId);
                } else {
                    // User is disliking
                    newDislikes.push(userId);
                    // If user had liked, remove like
                    if (hasLiked) {
                        newLikes = newLikes.filter(uid => uid !== userId);
                    }
                }
            }
            
            transaction.update(postRef, { 
                likes: newLikes,
                dislikes: newDislikes,
                likeCount: newLikes.length,
                dislikeCount: newDislikes.length,
            });
        });

        // Invalidate cache for this specific post and all posts
        await cache.delete(CacheKeys.posts.byId(postId));
        await cache.clearByTags([CacheTags.POSTS]);
    } catch (error: any) {
        console.error("Interaction transaction failed: ", error);
        throw new Error(`Failed to update interaction: ${error.message}`);
    }
};
