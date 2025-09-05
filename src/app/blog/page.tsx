
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
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';


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

  useEffect(() => {
    const fetchPostsAndUsers = async () => {
      const posts = await getPosts();
      const users = await getUsers();
      setAllPosts(posts);
      setAllUsers(users);
    };
    fetchPostsAndUsers();
  }, []);

  
  const publishedPosts = allPosts.filter(post => post.status === 'Published');
  const usersMap = new Map<string, UserProfile>(allUsers.map(u => [u.uid, u]));

  return (
    <div className="relative w-full h-full">
      { user &&
        <div className='flex justify-end p-5'>
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      }
      <div className="relative w-full h-[calc(100vh-81px)] overflow-y-auto snap-y snap-mandatory">
        {publishedPosts.length > 0 ? (
          publishedPosts.map(post => {
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
                              rehypePlugins={[rehypeRaw, rehypeKatex]}
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
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-semibold">No posts yet!</h2>
            <p className="text-muted-foreground mt-2">Check back soon for new content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
