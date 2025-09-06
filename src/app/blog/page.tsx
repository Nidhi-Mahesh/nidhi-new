'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { getPosts, Post } from "@/services/posts";
import { getUsers, UserProfile } from "@/services/users";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostInteractions } from "@/components/post-interactions";
import { CommentsSection } from "@/components/comments-section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Palette } from 'lucide-react';

function getInitials(name: string | null | undefined) {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length > 1 && names[0] && names[names.length - 1]) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  if(name && name.length > 0) {
    return name[0];
  }
  return 'U';
}

const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (typeof timestamp === 'string') return new Date(timestamp);
  if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  }
  return new Date();
};

const serializePost = (post: Post): Post => ({
  ...post,
  createdAt: post.createdAt ? toDate(post.createdAt).toISOString() : new Date().toISOString(),
  updatedAt: post.updatedAt ? toDate(post.updatedAt).toISOString() : undefined,
});

const themes = {
  "default": {
    background: "bg-background",
    text: "text-foreground",
    links: "text-primary",
    accent: "text-primary",
    fontStyle: "font-sans", // Default font
  },
  "sepia": {
    background: "bg-[#E9DDC7]",
    text: "text-[#2C1B12]",
    links: "text-[#2E7D75]",
    accent: "text-[#C96F44]",
    fontStyle: "font-merriweather", // Custom font
  },
  "pastel": {
    background: "bg-[#E6D5EC]",
    text: "text-[#2B2B38]",
    links: "text-[#E75A7C]",
    accent: "text-[#88C999]",
    fontStyle: "font-poppins", // Custom font
  },
  "high-contrast": {
    background: "bg-[#0B0B0B]",
    text: "text-[#FAFAFA]",
    links: "text-[#FFC107]",
    accent: "text-[#2196F3]",
    fontStyle: "font-roboto-mono", // Custom font
  },
  "cosmic-noir": {
    background: "bg-[#0D0C1D]",
    text: "text-[#E6E6E6]",
    links: "text-[#9A4DFF]",
    accent: "text-[#00E5FF]",
    fontStyle: "font-orbitron", // Custom font
  },
  "forest-whisper": {
    background: "bg-[#1E2D24]",
    text: "text-[#F1EEDC]",
    links: "text-[#5FBF6C]",
    accent: "text-[#D9A441]",
    fontStyle: "font-lora", // Custom font
  },
  "mystic-twilight": {
    background: "bg-[#1B1035]",
    text: "text-[#F8F7FF]",
    links: "text-[#7A3EFF]",
    accent: "text-[#FF4FA3]",
    fontStyle: "font-cinzel-decorative", // Custom font
  },
  "ocean-drift": {
    background: "bg-[#0E3D45]",
    text: "text-[#F2F9F9]",
    links: "text-[#4DD0E1]",
    accent: "text-[#FF8A65]",
    fontStyle: "font-quicksand", // Custom font
  },
  "solar-ember": {
    background: "bg-[#1C0A0A]",
    text: "text-[#F9F6F2]",
    links: "text-[#FF7043]",
    accent: "text-[#FFD54F]",
    fontStyle: "font-playfair-display", // Custom font
  },
};

type ThemeKey = keyof typeof themes;

// 🔍 Highlight matching text
function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-300">{part}</mark> : part
  );
}

export default function BlogPage() {
  const { user } = useAuth();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("default");

  const currentTheme = themes[selectedTheme];

  useEffect(() => {
    const fetchPostsAndUsers = async () => {
      const posts = await getPosts();
      const users = await getUsers();
      setAllPosts(posts);
      setAllUsers(users);
    };
    fetchPostsAndUsers();

    const saved = localStorage.getItem("savedPosts");
    if (saved) setSavedPosts(JSON.parse(saved));
  }, []);

  const toggleSavePost = (postId: string) => {
    let updated = [...savedPosts];
    if (updated.includes(postId)) {
      updated = updated.filter(id => id !== postId);
    } else {
      updated.push(postId);
    }
    setSavedPosts(updated);
    localStorage.setItem("savedPosts", JSON.stringify(updated));
  };

  const publishedPosts = allPosts.filter(post => post.status === 'Published');
  const filteredPosts = publishedPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const usersMap = new Map<string, UserProfile>(allUsers.map(u => [u.uid, u]));

  return (
    <div className={cn("relative w-full h-full", currentTheme.background, currentTheme.text, currentTheme.fontStyle)}>
      { user &&
        <div className='flex justify-end p-5'>
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      }

      {/* Theme selection button - moved to bottom right */}
      <div className="fixed bottom-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-gray-800 dark:text-gray-200">
              <Palette className="h-4 w-4" />
              <span>Themes</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.keys(themes).map((themeKey) => (
              <DropdownMenuItem key={themeKey} onClick={() => setSelectedTheme(themeKey as ThemeKey)}>
                {themeKey.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">

          {/* 🔍 Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => {
              const authorProfile = usersMap.get(post.authorId);
              const serializablePost = serializePost(post);
              const isSaved = savedPosts.includes(post.id);

              return (
                <section key={post.id} className={`w-full flex items-center justify-center relative p-4 md:p-8 ${index < filteredPosts.length - 1 ? 'mb-16' : ''}`}>
                  <div className="max-w-6xl w-full flex flex-col md:flex-row items-stretch gap-8 h-[85vh]">
                    
                    {/* Main Content */}
                    <div className="flex-grow overflow-hidden w-full md:w-2/3">
                      <Card className="h-full">
                        <ScrollArea className="h-full">
                          <CardContent className="p-6 md:p-8">
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                              <div className="flex items-center justify-between mb-8">
                                {/* Author Info */}
                                <Link href={`/users/${authorProfile?.uid}`} className="flex items-center gap-4 group">
                                    <Avatar className="h-16 w-16">
                                      <AvatarImage src={authorProfile?.photoURL || undefined} />
                                      <AvatarFallback>{getInitials(authorProfile?.displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-lg font-semibold">{authorProfile?.displayName || 'Unknown Author'}</p>
                                      <p className="text-sm text-muted-foreground">Posted on {new Date(serializablePost.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </Link>

                                {/* ⭐ Save button */}
                                <button
                                  onClick={() => toggleSavePost(post.id)}
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${isSaved ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-800'}`}
                                >
                                  {isSaved ? "Saved ★" : "Save ☆"}
                                </button>
                              </div>

                              {/* Title */}
                              <Link href={`/blog/${post.id}`}>
                                <h1 className="text-4xl font-bold font-headline mb-4">
                                  {highlightText(post.title, searchQuery)}
                                </h1>
                              </Link>

                              {/* Render Markdown with raw HTML support */}
                              <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex, rehypeRaw, rehypeSanitize]}
                                components={{
                                  img: ({src, alt}) => (
                                    <img src={src || ''} alt={alt || ''} className="max-w-full h-auto rounded-lg shadow-md my-4" />
                                  ),
                                  video: ({node, ...props}) => (
                                    <video controls className="w-full rounded-lg my-4">
                                      <source src={props.src as string} type="video/mp4" />
                                      Your browser does not support the video tag.
                                    </video>
                                  ),
                                  code({children, className, ...rest}) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return match ? (
                                      <SyntaxHighlighter style={materialDark} language={match[1]} PreTag="div">
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code {...rest} className={cn("bg-muted px-1 py-0.5 rounded-sm", className)}>
                                        {children}
                                      </code>
                                    );
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
                    <div className="w-full md:w-1/3 flex flex-col gap-8">
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Reactions</h3>
                          <PostInteractions post={serializablePost} />
                        </CardContent>
                      </Card>
                      <Card className="flex-grow overflow-hidden">
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
              );
            })
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-semibold">No posts found!</h2>
              <p className="text-muted-foreground mt-2">Try a different search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
