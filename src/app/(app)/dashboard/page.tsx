
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { BarChart, MessageSquare, Newspaper, Users, Edit } from "lucide-react";
import { getPosts, Post } from '@/services/posts';
import { getUsers, UserProfile } from '@/services/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/services/users';
import { headers } from 'next/headers';
import { getAuthenticatedUser } from '@/lib/auth';
import { RecentPosts } from '@/components/dashboard/recent-posts';

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

export default async function DashboardPage() {
  const [posts, allUsers] = await Promise.all([
    getPosts(),
    getUsers()
  ]);
  const user = await getAuthenticatedUser();
  
  const usersMap = new Map(allUsers.map(u => [u.uid, u]));

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
    { title: "Total Posts", value: posts.length.toString(), icon: <Newspaper className="h-6 w-6 text-muted-foreground" /> },
    { title: "Subscribers", value: "567", icon: <Users className="h-6 w-6 text-muted-foreground" />, description: "Feature coming soon" },
    { title: "Comments", value: "8,901", icon: <MessageSquare className="h-6 w-6 text-muted-foreground" />, description: "Feature coming soon" },
    { title: "Total Views", value: "2.3M", icon: <BarChart className="h-6 w-6 text-muted-foreground" />, description: "Feature coming soon" },
  ]

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
          </CardContent>
        </Card>
        <RecentPosts posts={posts} user={user} />
      </div>
    </div>
  )
}
