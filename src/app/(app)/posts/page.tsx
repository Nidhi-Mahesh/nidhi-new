
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getPosts } from "@/services/posts";
import { getAuthenticatedUser } from "@/lib/auth";
import { PostsTable } from "@/components/posts-table";


export default async function PostsPage() {
  const posts = await getPosts();
  const user = await getAuthenticatedUser();
  
  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Posts</h2>
            <p className="text-muted-foreground">
              Manage your blog posts.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/posts/new">
                <PlusCircle className="mr-2 h-4 w-4" /> New Post
              </Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
            <CardDescription>A list of all posts in your blog.</CardDescription>
          </CardHeader>
          <CardContent>
            <PostsTable initialPosts={posts} user={user} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
