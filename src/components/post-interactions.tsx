
'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { Post, getPost } from '@/services/posts';
import { updateInteraction } from '@/services/interactions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PostInteractionsProps {
  post: Post;
}

export function PostInteractions({ post: initialPost }: PostInteractionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<Post>(initialPost);
  const [isProcessing, setIsProcessing] = useState<null | 'like' | 'dislike'>(null);

  useEffect(() => {
    if (!post.id) return;
    const postRef = doc(db, "posts", post.id);
    const unsubscribe = onSnapshot(postRef, (doc) => {
        if (doc.exists()) {
            setPost({ id: doc.id, ...doc.data() } as Post);
        }
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleInteraction = async (type: 'like' | 'dislike') => {
    if (!user) {
      toast({ 
          title: "Authentication required", 
          description: "Please log in or create an account to interact with posts.",
          variant: "destructive" 
      });
      return;
    }
    if (!post.id) return;

    setIsProcessing(type);
    try {
      await updateInteraction(post.id, user.uid, type);
    } catch (error) {
      toast({ title: "Error", description: "Could not record your interaction.", variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  const hasLiked = post.likes?.includes(user?.uid || '');
  const hasDisliked = post.dislikes?.includes(user?.uid || '');

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => handleInteraction('like')}
        disabled={!!isProcessing}
      >
        <ThumbsUp className={cn("h-6 w-6", hasLiked && "fill-primary text-primary")} />
        <span className="font-semibold">{post.likeCount || 0}</span>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => handleInteraction('dislike')}
        disabled={!!isProcessing}
      >
        <ThumbsDown className={cn("h-6 w-6", hasDisliked && "fill-destructive text-destructive")} />
        <span className="font-semibold">{post.dislikeCount || 0}</span>
      </Button>
      <div className="flex items-center gap-2 text-muted-foreground">
        <MessageCircle className="h-6 w-6" />
        <span className="font-semibold">{post.commentCount || 0} Comments</span>
      </div>
    </div>
  );
}
