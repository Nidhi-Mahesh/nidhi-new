
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BarChart, MessageSquare, Newspaper, Users, ArrowRight, Edit } from "lucide-react";
import { getPosts, Post } from '@/services/posts';
import { getUsers, UserProfile } from '@/services/users';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

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

function formatRelativeTime(timestamp: any) {
  if (!timestamp) return 'some time ago';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'a while ago';
  }
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

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedPosts, fetchedUsers] = await Promise.all([
            getPosts(),
            getUsers()
        ]);
        setPosts(fetchedPosts);
        setUsers(fetchedUsers);
      } catch (error) {
        toast({
          title: "Error fetching data",
          description: "Could not retrieve data for the dashboard.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);
  
  const recentPosts = posts.slice(0, 5);
  const usersMap = new Map(users.map(u => [u.uid, u]));

  const recentActivity = posts.slice(0, 5).map(post => {
      const author = usersMap.get(post.authorId);
      const isUpdate = post.updatedAt && post.createdAt && post.updatedAt.seconds !== post.createdAt.seconds;
      return {
          id: post.id,
          type: isUpdate ? 'update' : 'create',
          user: author?.displayName || post.author,
          avatar: author?.photoURL,
          text: `${isUpdate ? 'updated' : 'created'} the post "${post.title}"`,
          time: formatRelativeTime(post.updatedAt || post.createdAt),
      }
  });


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
             <CardDescription>A live feed of recent post creations and updates.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                 <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-2">
                         <Skeleton className="h-4 w-[250px]" />
                         <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="space-y-6">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start">
                        <Avatar className="h-9 w-9 mr-4">
                          <AvatarImage src={activity.avatar || undefined} alt="Avatar" data-ai-hint="user avatar" />
                          <AvatarFallback>{getInitials(activity.user)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold">{activity.user}</span>
                            {' '}{activity.text}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                         {activity.type === 'create' ? <Newspaper className="h-5 w-5 text-muted-foreground" /> : <Edit className="h-5 w-5 text-muted-foreground" />}
                      </div>
                    ))}
                </div>
             )}
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
