
'use client';
import Link from 'next/link';
import { Post } from '@/services/posts';
import { AppUser } from '@/context/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowRight } from "lucide-react";
import { Timestamp } from 'firebase/firestore';

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


function formatTimestamp(timestamp: any) {
  if (!timestamp) {
    return 'N/A';
  }
  try {
    return toDate(timestamp).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
}

export function RecentPosts({ posts, user }: { posts: Post[], user: AppUser | null }) {
    const recentPosts = posts.slice(0, 5);

    const canEditPost = (post: Post) => {
        if (!user) return false;
        if (user.role === 'Admin' || user.role === 'Editor') return true;
        if (user.role === 'Author' && post.authorId === user.uid) return true;
        return false;
    }

    return (
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your 5 most recently created posts.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPosts.length > 0 ? (
                 <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="flex items-center">
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none truncate">{post.title}</p>
                          <p className="text-sm text-muted-foreground">{formatTimestamp(post.createdAt)}</p>
                        </div>
                        {canEditPost(post) && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/posts/${post.id}/edit`}>
                              Edit
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                        No recent posts. <br/>
                        <Link href="/posts/new" className="text-primary underline">Create one now!</Link>
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
    );
}
