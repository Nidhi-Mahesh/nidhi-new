import Link from "next/link";
import { getPosts, Post } from "@/services/posts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

function formatTimestamp(timestamp: any) {
  if (!timestamp) {
    return 'N/A';
  }
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  try {
    return new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (error) {
    return 'Invalid Date';
  }
}


export default async function BlogPage() {
  const allPosts = await getPosts();
  const publishedPosts = allPosts.filter(post => post.status === 'Published');

  return (
    <div>
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold font-headline tracking-tight">The Blog</h1>
        <p className="mt-2 text-lg text-muted-foreground">Welcome to our corner of the internet.</p>
      </header>
      
      {publishedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedPosts.map(post => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-headline tracking-tight hover:text-primary transition-colors">
                    <Link href={`/blog/${post.id}`}>
                        {post.title}
                    </Link>
                </CardTitle>
                <CardDescription>
                  <span>By {post.author}</span>
                  <span className="mx-2">&middot;</span>
                  <span>{formatTimestamp(post.createdAt)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">
                  {post.metaDescription || post.content.substring(0, 150) + '...'}
                </p>
              </CardContent>
              <CardFooter>
                 <Button asChild variant="link" className="p-0 h-auto">
                    <Link href={`/blog/${post.id}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No posts yet!</h2>
          <p className="text-muted-foreground mt-2">Check back soon for new content.</p>
        </div>
      )}
    </div>
  );
}
