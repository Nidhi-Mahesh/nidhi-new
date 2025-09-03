
'use client';

import { useEffect, useState } from 'react';
import { PostForm } from "@/components/post-form";
import { getPost } from "@/services/posts";
import type { Post } from "@/services/posts";
import { useToast } from '@/hooks/use-toast';

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPost() {
      try {
        const fetchedPost = await getPost(params.id);
        if (fetchedPost) {
          setPost(fetchedPost);
        } else {
          toast({
            title: "Post not found",
            description: "Could not find the requested post.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error fetching post",
          description: "There was an error loading the post data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [params.id, toast]);

  if (isLoading) {
    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <p>Loading post...</p>
            </div>
        </div>
    );
  }

  if (!post) {
     return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <p>Post not found.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-headline tracking-tight">Edit Post</h1>
          <p className="text-muted-foreground mt-1">
            Make changes to your existing blog post.
          </p>
        </header>
        <PostForm post={post} />
      </div>
    </div>
  );
}
