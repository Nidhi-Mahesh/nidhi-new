'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { getPosts, Post } from "@/services/posts";
import { getUsers, UserProfile } from "@/services/users";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostInteractions } from "@/components/post-interactions";
import { CommentsSection } from "@/components/comments-section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import { BlogSearch } from '@/components/blog-search';

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

const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  }
  return new Date();
};

// Helper function to convert Firestore Timestamps to serializable format
const serializePost = (post: Post): Post => {
  return {
    ...post,
    createdAt: post.createdAt ? toDate(post.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: post.updatedAt ? toDate(post.updatedAt).toISOString() : undefined,
  };
};

export default function BlogPage() {
  const { user } = useAuth();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchPostsAndUsers = async () => {
      const posts = await getPosts();
      const users = await getUsers();
      setAllPosts(posts);
      setAllUsers(users);
    };
    fetchPostsAndUsers();
  }, []);

  const handleSearchResults = (results: Post[]) => {
    setSearchResults(results);
    setIsSearching(results.length > 0);
  };

  const publishedPosts = allPosts.filter(post => post.status === 'Published');
  const postsToDisplay = isSearching ? searchResults : publishedPosts;
  const usersMap = new Map<string, UserProfile>(allUsers.map(u => [u.uid, u]));

  return (
    <div className="relative w-full min-h-screen">
      {/* Header with Dashboard Button */}
      {user && (
        <div className='flex justify-end p-5'>
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      )}

      {/* Search Section */}
      <div className="w-full px-4 py-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <BlogSearch 
          posts={allPosts} 
          users={allUsers} 
          onSearchResults={handleSearchResults}
        />
      </div>

      {/* Posts Display */}
      <div className="relative w-full">
        {postsToDisplay.length > 0 ? (
          <div className={cn(
            "w-full",
            isSearching ? "p-4" : "h-[calc(100vh-200px)] overflow-y-auto snap-y snap-mandatory"
          )}>
            {isSearching ? (
              // Search Results Layout - List View
              <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold mb-6">Search Results ({searchResults.length})</h2>
                {postsToDisplay.map(post => {
                  const authorProfile = usersMap.get(post.authorId);
                  const serializablePost = serializePost(post);
                  
                  return (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Link href={`/users/${authorProfile?.uid}`}>
                            <Avatar className="h-12 w-12 border">
                              <AvatarImage src={authorProfile?.photoURL || undefined} alt={authorProfile?.displayName || undefined} />
                              <AvatarFallback>{getInitials(authorProfile?.displayName)}</AvatarFallback>
                            </Avatar>
                          </Link>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Link href={`/users/${authorProfile?.uid}`} className="text-sm text-muted-foreground hover:text-primary">
                                {authorProfile?.displayName || 'Unknown Author'}
                              </Link>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(serializablePost.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <Link href={`/blog/${post.id}`}>
                              <h3 className="text-2xl font-semibold mb-3 hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                            </Link>
                            
                            <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                              {post.content.replace(/[#*`_~\[\]()]/g, '').replace(/\n+/g, ' ').substring(0, 200)}...
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>❤️ {post.likeCount || 0}</span>
                                <span>💬 {post.commentCount || 0}</span>
                              </div>
                              <Link href={`/blog/${post.id}`}>
                                <Button variant="outline" size="sm">Read More</Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // Default Full-Screen Layout
              postsToDisplay.map(post => {
                const authorProfile = usersMap.get(post.authorId);
                const serializablePost = serializePost(post);
                
                return (
                  <section key={post.id} className="h-full w-full snap-start flex items-center justify-center relative p-4 md:p-8">
                    <div className="max-w-6xl w-full h-full flex flex-col md:flex-row items-start gap-8">
                      
                      {/* Main Content */}
                      <div className="flex-grow h-full overflow-hidden w-full md:w-2/3">
                        <Card className="h-full">
                          <ScrollArea className="h-full">
                            <CardContent className="p-6 md:p-8">
                              <div className="prose prose-lg dark:prose-invert max-w-none">
                                <div className="flex items-center gap-4 mb-8">
                                  <Link href={`/users/${authorProfile?.uid}`} className="flex items-center gap-4 group">
                                      <Avatar className="h-16 w-16 border-2 border-transparent group-hover:border-primary transition-all">
                                        <AvatarImage src={authorProfile?.photoURL || undefined} alt={authorProfile?.displayName || undefined} />
                                        <AvatarFallback>{getInitials(authorProfile?.displayName)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-lg font-semibold group-hover:text-primary">{authorProfile?.displayName || 'Unknown Author'}</p>
                                        <p className="text-sm text-muted-foreground">Posted on {new Date(serializablePost.createdAt).toLocaleDateString()}</p>
                                      </div>
                                  </Link>
                                </div>

                                <Link href={`/blog/${post.id}`}>
                                  <h1 className="text-4xl font-bold font-headline mb-4">{post.title}</h1>
                                </Link>
                                <ReactMarkdown
                                  remarkPlugins={[remarkMath]}
                                  rehypePlugins={[rehypeKatex]}
                                  components={{
                                        h1: ({node, ...props}) => <h2 className="text-3xl font-bold font-headline mt-8 mb-4" {...props} />,
                                        h2: ({node, ...props}) => <h3 className="text-2xl font-bold font-headline mt-6 mb-4" {...props} />,
                                        h3: ({node, ...props}) => <h4 className="text-xl font-bold font-headline mt-4 mb-4" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                                        a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                                        ul: ({node, ordered, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                                        ol: ({node, ordered, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props} />,
                                        img: ({node, ...props}) => <img className="rounded-lg shadow-md my-6 max-w-full h-auto" alt={props.alt || ''} {...props} />,
                                        code(props) {
                                          const {children, className, node, ...rest} = props
                                          const match = /language-(\w+)/.exec(className || '')
                                          return match ? (
                                            <SyntaxHighlighter
                                              style={materialDark}
                                              language={match[1]}
                                              PreTag="div"
                                            >
                                              {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                          ) : (
                                            <code {...rest} className={cn("bg-muted px-1 py-0.5 rounded-sm", className)}>
                                              {children}
                                            </code>
                                          )
                                        }
                                    }}
                                >
                                    {post.content}
                                </ReactMarkdown>
                              </div>
                            </CardContent>
                          </ScrollArea>
                        </Card>
                      </div>

                      {/* Interactions Sidebar */}
                      <div className="w-full md:w-1/3 h-full flex flex-col gap-8">
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Reactions</h3>
                            <PostInteractions post={serializablePost} />
                          </CardContent>
                        </Card>
                        <Card className="flex-grow">
                          <CardContent className="p-6 h-full">
                            <h3 className="text-lg font-semibold mb-4">Comments</h3>
                            <ScrollArea className="h-[calc(100%-40px)]">
                              <CommentsSection post={serializablePost} />
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </section>
                )
              })
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-semibold">
              {isSearching ? 'No search results found' : 'No posts yet!'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isSearching ? 'Try adjusting your search terms.' : 'Check back soon for new content.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
