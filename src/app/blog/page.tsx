import Link from "next/link";
import { getPosts } from "@/services/posts";
import { getUsers, UserProfile } from "@/services/users";
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function getInitials(name: string | null | undefined) {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    if(name.length > 0) {
      return name[0]
    }
    return 'U';
}

export default async function BlogPage() {
  const allPosts = await getPosts();
  const allUsers = await getUsers();
  
  const publishedPosts = allPosts.filter(post => post.status === 'Published');
  const usersMap = new Map<string, UserProfile>(allUsers.map(u => [u.uid, u]));

  return (
    <div className="relative w-full h-[calc(100vh-81px)] overflow-y-auto snap-y snap-mandatory">
      {publishedPosts.length > 0 ? (
        publishedPosts.map(post => {
          const authorProfile = usersMap.get(post.authorId);
          return (
            <section key={post.id} className="h-full w-full snap-start flex items-center justify-center relative">
              <div className="max-w-4xl w-full h-full flex flex-row items-center gap-8 p-4 md:p-8">
                {/* Main Content */}
                <div className="flex-grow h-full overflow-y-auto prose prose-lg dark:prose-invert max-w-none pr-4">
                  <h1 className="text-4xl font-bold font-headline mb-4">{post.title}</h1>
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
                          img: ({node, ...props}) => <img className="rounded-lg shadow-md my-6 max-w-full h-auto" {...props} />,
                      }}
                   >
                      {post.content}
                  </ReactMarkdown>
                </div>

                {/* Author Info & Actions (Right Sidebar) */}
                <div className="flex-shrink-0 flex flex-col items-center justify-start gap-6 pt-16">
                  <Link href="#" className="flex flex-col items-center gap-2 group">
                      <Avatar className="h-16 w-16 border-2 border-transparent group-hover:border-primary transition-all">
                        <AvatarImage src={authorProfile?.photoURL || undefined} alt={authorProfile?.displayName} />
                        <AvatarFallback>{getInitials(authorProfile?.displayName)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-semibold group-hover:text-primary">{authorProfile?.displayName || 'Unknown Author'}</p>
                  </Link>

                  <div className="flex flex-col gap-6 items-center mt-8">
                     <Button variant="ghost" size="icon" className="rounded-full h-14 w-14">
                        <Heart className="h-7 w-7" />
                        <span className="sr-only">Like</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-14 w-14">
                        <MessageCircle className="h-7 w-7" />
                        <span className="sr-only">Comment</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-14 w-14">
                        <Share2 className="h-7 w-7" />
                        <span className="sr-only">Share</span>
                    </Button>
                  </div>
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
  );
}