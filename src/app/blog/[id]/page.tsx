import { getPost } from "@/services/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatTimestamp(timestamp: any) {
  if (!timestamp) return null;
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
  }).format(date);
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post || post.status !== 'Published') {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
            <div className="mb-4">
                {post.tags && post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="mr-2">{tag}</Badge>
                ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
                By {post.author} on {formatTimestamp(post.createdAt)}
            </p>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none mx-auto">
             <ReactMarkdown
                components={{
                    h1: ({node, ...props}) => <h2 className="text-3xl font-bold font-headline mt-8 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h3 className="text-2xl font-bold font-headline mt-6 mb-4" {...props} />,
                    h3: ({node, ...props}) => <h4 className="text-xl font-bold font-headline mt-4 mb-4" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                    a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props} />,
                    img: ({node, ...props}) => <img className="rounded-lg shadow-md my-6" {...props} />,
                }}
             >
                {post.content}
            </ReactMarkdown>
        </div>
    </article>
  );
}
