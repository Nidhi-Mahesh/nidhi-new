
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-provider';
import { addComment, Comment } from '@/services/comments';
import { Post } from '@/services/posts';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage, FormDescription } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';


const commentFormSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty.').max(500, 'Comment must be 500 characters or less.'),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

interface CommentsSectionProps {
  post: Post;
}

function getInitials(name: string | null | undefined) {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    if(name && name.length > 0) {
      return name[0]
    }
    return 'U';
}

// Helper to handle various date formats robustly
const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  if (timestamp && timestamp.seconds) {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  }
  return new Date();
};


export function CommentsSection({ post }: CommentsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: { content: '' },
  });

  useEffect(() => {
    if (!post.id) return;

    const commentsQuery = query(
      collection(db, "comments"),
      where('postId', '==', post.id)
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const fetchedComments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? toDate(data.createdAt).toISOString() : new Date().toISOString(),
            } as Comment
        });
        
        // Sort comments by date on the client side
        fetchedComments.sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime());

        setComments(fetchedComments);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching comments in real-time:", error);
        toast({ title: "Error", description: "Could not load comments." });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [post.id, toast]);


  const onSubmit = async (data: CommentFormValues) => {
    if (!user || !post.id) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to comment.', variant: 'destructive' });
      return;
    }

    form.control.disabled = true;
    try {
      await addComment({
        postId: post.id,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || null,
        content: data.content,
      });
      form.reset();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to post comment.', variant: 'destructive' });
    } finally {
        form.control.disabled = false;
    }
  };
  
  const commentContent = form.watch('content');

  return (
    <Card className="flex-grow flex flex-col h-full">
      <CardHeader>
        <CardTitle>Comments ({post.commentCount || 0})</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col gap-4">
        {user ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <Avatar className="h-9 w-9 mt-1">
                <AvatarImage src={user.photoURL || undefined} data-ai-hint="user avatar" />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow space-y-2">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Add a comment..." {...field} rows={2} />
                      </FormControl>
                       <div className="flex justify-between items-center">
                          <FormMessage />
                           <p className={`text-xs ${commentContent.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {commentContent.length} / 500
                           </p>
                       </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post Comment
                </Button>
              </div>
            </form>
          </Form>
        ) : (
            <div className="text-center p-4 border rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                    <Link href="/login" className="text-primary underline">Log in</Link> or <Link href="/signup" className="text-primary underline">Sign up</Link> to leave a comment.
                </p>
            </div>
        )}
        <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="space-y-6">
            {isLoading ? (
                <div className="text-center text-muted-foreground p-4">Loading comments...</div>
            ) : comments.length > 0 ? (
                comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={comment.authorAvatar || undefined} data-ai-hint="user avatar" />
                        <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{comment.authorName}</p>
                            <p className="text-xs text-muted-foreground">
                                {comment.createdAt ? formatDistanceToNow(toDate(comment.createdAt), { addSuffix: true }) : 'just now'}
                            </p>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                    </div>
                </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground p-8">
                    <p className="font-semibold">No comments yet.</p>
                    <p>Be the first to share your thoughts!</p>
                </div>
            )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
