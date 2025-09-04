
'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getUserProfile, UserProfile } from '@/services/users';
import { getPosts, Post } from '@/services/posts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

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

export default function UserProfilePage() {
  const params = useParams();
  const { id } = params;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id === 'string') {
      const fetchUserData = async () => {
        setLoading(true);
        const userData = await getUserProfile(id);
        setUser(userData);
        if (userData) {
          const userPosts = await getPosts();
          setPosts(userPosts.filter(p => p.authorId === id && p.status === 'Published'));
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><p>Loading profile...</p></div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen"><p>User not found.</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-col md:flex-row items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User avatar'} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
                <CardTitle className="text-3xl font-bold font-headline">{user.displayName}</CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">Role: {user.role}</p>
            </div>
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-semibold font-headline mt-8 mb-4">Posts by {user.displayName}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.length > 0 ? (
              posts.map(post => (
                <Link href={`/blog/${post.id}`} key={post.id}>
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold font-headline">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">{post.content.substring(0, 100)}...</p>
                    </CardContent>
                    </Card>
                </Link>
              ))
            ) : (
              <p>This user has no published posts yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
