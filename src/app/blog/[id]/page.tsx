
'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPost, Post } from "@/services/posts";
import { getUserProfile, UserProfile } from "@/services/users";
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
import Link from 'next/link';

// Helper to get initials from a name
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

// Helper to convert Firestore Timestamps
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

// Helper to serialize post data
const serializePost = (post: Post): Post => {
  return {
    ...post,
    createdAt: post.createdAt ? toDate(post.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: post.updatedAt ? toDate(post.updatedAt).toISOString() : undefined,
  };
};

export default function BlogPostPage() {
  const params = useParams();
  const { id } = params;
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id === 'string') {
      const fetchPost = async () => {
        setLoading(true);
        const postData = await getPost(id);
        if (postData) {
          const serializablePost = serializePost(postData);
          setPost(serializablePost);
          const authorData = await getUserProfile(postData.authorId);
          setAuthor(authorData);
        } else {
          // Handle post not found
          console.log("Post not found");
        }
        setLoading(false);
      };
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-[calc(100vh-81px)]"><p>Loading post...</p></div>;
  }

  if (!post) {
    return <div className="flex items-center justify-center h-[calc(100vh-81px)]"><p>Post not found.</p></div>;
  }

  return (
    <div className="relative w-full h-[calc(100vh-81px)] overflow-y-auto">
      <section className="h-full w-full flex items-center justify-center relative p-4 md:p-8">
        <div className="max-w-4xl w-full h-full flex flex-col items-center">
          <Card className="flex-grow h-full overflow-hidden w-full">
            <ScrollArea className="h-full">
              <CardContent className="p-6 md:p-8">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="flex items-center gap-4 mb-8">
                    {author && (
                      <Link href={`/users/${author.uid}`} className="flex items-center gap-4 group">
                        <Avatar className="h-16 w-16 border-2 border-transparent group-hover:border-primary transition-all">
                          <AvatarImage src={author.photoURL || undefined} alt={author.displayName || undefined} />
                          <AvatarFallback>{getInitials(author.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-lg font-semibold group-hover:text-primary">{author.displayName || 'Unknown Author'}</p>
                          <p className="text-sm text-muted-foreground">Posted on {new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </Link>
                    )}
                  </div>

                  <h1 className="text-4xl font-bold font-headline mb-4">{post.title}</h1>
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                        h1: ({node, ...props}) => <h2 className="text-3xl font-bold font-headline mt-8 mb-4" {...props} />,
                        h2: ({node, ...props}) => <h3 className="text-2xl font-bold font-headline mt-6 mb-4" {...props} />,
                        h3: ({node, ...props}) => <h4 className="text-xl font-bold font-headline mt-4 mb-4" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                        a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
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
                <div className="mt-8">
                  <PostInteractions post={post} />
                  <CommentsSection post={post} />
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </section>
    </div>
  );
}
