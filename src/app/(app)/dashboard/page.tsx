
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BarChart, MessageSquare, Newspaper, Users, ArrowRight } from "lucide-react";
import { getPosts, Post } from '@/services/posts';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-provider';

function formatTimestamp(timestamp: any) {
  if (!timestamp) {
    return 'N/A';
  }
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleDateString();
  }
  try {
    return new Date(timestamp).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        toast({
          title: "Error fetching posts",
          description: "Could not retrieve posts for the dashboard.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, [toast]);
  
  const recentPosts = posts.slice(0, 5);

  const stats = [
    { title: "Total Posts", value: isLoading ? <Skeleton className="h-6 w-16" /> : posts.length.toString(), icon: <Newspaper className="h-6 w-6 text-muted-foreground" /> },
    { title: "Subscribers", value: "567", icon: <Users className="h-6 w-6 text-muted-foreground" />, description: "Feature coming soon" },
    { title: "Comments", value: "8,901", icon: <MessageSquare className="h-6 w-6 text-muted-foreground" />, description: "Feature coming soon" },
    { title: "Total Views", value: "2.3M", icon: <BarChart className="h-6 w-6 text-muted-foreground" />, description: "Feature coming soon" },
  ]

  const canEditPost = (post: Post) => {
    if (!user) return false;
    if (user.role === 'Admin' || user.role === 'Editor') return true;
    if (user.role === 'Author' && post.authorId === user.uid) return true;
    return false;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
               <p className="text-xs text-muted-foreground">
                {stat.description || "+20.1% from last month"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
             <CardDescription>Recent comments and likes will be displayed here.</CardDescription>
          </CardHeader>
          <CardContent className="pl-6">
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">Activity feed coming soon.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your 5 most recently created posts.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            ) : recentPosts.length > 0 ? (
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
      </div>
    </div>
  )
}
