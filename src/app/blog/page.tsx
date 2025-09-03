
import Link from "next/link";
import { getPosts, Post } from "@/services/posts";
import { getUsers, UserProfile } from "@/services/users";
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostInteractions } from "@/components/post-interactions";
import { CommentsSection } from "@/components/comments-section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";


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
            <section key={post.id} className="h-full w-full snap-start flex items-center justify-center relative p-4 md:p-8">
              <div className="max-w-7xl w-full h-full flex flex-row items-start gap-8">
                
                {/* Main Content */}
                <Card className="flex-grow h-full overflow-hidden">
                  <ScrollArea className="h-full">
                    <CardContent className="p-6 md:p-8">
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                         <div className="flex items-center gap-4 mb-8">
                           <Link href="#" className="flex items-center gap-4 group">
                              <Avatar className="h-16 w-16 border-2 border-transparent group-hover:border-primary transition-all">
                                <AvatarImage src={authorProfile?.photoURL || undefined} alt={authorProfile?.displayName} />
                                <AvatarFallback>{getInitials(authorProfile?.displayName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-lg font-semibold group-hover:text-primary">{authorProfile?.displayName || 'Unknown Author'}</p>
                                <p className="text-sm text-muted-foreground">Posted on {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</p>
                              </div>
                          </Link>
                         </div>


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
                    </CardContent>
                  </ScrollArea>
                </Card>

                {/* Right Sidebar for Interactions and Comments */}
                <div className="w-full max-w-md flex-shrink-0 h-full flex flex-col gap-4">
                    <PostInteractions post={post} />
                    <CommentsSection post={post} />
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
