import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit3, Feather, Rss, Share2, Sparkles } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Edit3 className="w-8 h-8 text-primary" />,
      title: "Powerful Editor",
      description: "A rich Markdown editor with live preview, autosave, and seamless media embedding.",
    },
    {
      icon: <Feather className="w-8 h-8 text-primary" />,
      title: "Content Feathers",
      description: "Go beyond text. Create posts for photos, videos, links, quotes, and audio.",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "AI-Assisted Writing",
      description: "Generate titles, drafts, tags, and meta descriptions with a single click.",
    },
    {
      icon: <Share2 className="w-8 h-8 text-primary" />,
      title: "Community Features",
      description: "Engage your audience with comments, likes, webmentions, and more.",
    },
    {
      icon: <Rss className="w-8 h-8 text-primary" />,
      title: "Syndication",
      description: "Built-in Atom feeds, sitemaps, and SEO features to grow your reach.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
      title: "Extensible",
      description: "Customize everything with themes and pluggable modules. Make it yours.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline">Modern Chyrp</h1>
        <nav className="flex items-center gap-4">
          <Button asChild variant="link">
            <Link href="/blog">Blog</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild className="ml-2">
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="text-center py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl lg:text-6xl font-bold font-headline tracking-tight">
              A modern, elegant, & powerful <br /> blogging platform.
            </h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
              Modern Chyrp is a lightweight, open-source blogging engine designed for simplicity and power. Get your voice heard.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start Your Blog <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/blog">View The Blog</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-24 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl lg:text-4xl font-bold font-headline">Everything you need to succeed.</h3>
              <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                Packed with features for writers, creators, and developers.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-6 rounded-lg transition-transform hover:scale-105 hover:shadow-xl bg-background">
                  <div className="mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-bold font-headline mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <div className="relative rounded-lg overflow-hidden border p-4">
                <Image
                  src="https://picsum.photos/1200/600"
                  alt="Abstract image representing the admin dashboard"
                  width={1200}
                  height={600}
                  className="rounded-md"
                  data-ai-hint="abstract dashboard"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                   <h3 className="text-3xl lg:text-4xl font-bold font-headline text-white">Powerful Admin Console</h3>
                   <p className="mt-2 text-white/80 max-w-xl">
                     Manage your posts, media, users, and settings from a single, intuitive interface.
                   </p>
                </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Modern Chyrp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
