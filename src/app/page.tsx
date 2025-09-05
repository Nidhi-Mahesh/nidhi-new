
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <h1 className="text-2xl font-bold font-headline">Modern Chyrp</h1>
        </Link>
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
        <section className="text-center py-20 lg:py-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-5xl lg:text-7xl font-bold font-headline tracking-tight">
              Build Your Digital Voice
            </h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
              Modern Chyrp is the minimalist blogging platform for creators who value simplicity and elegance. Focus on your writing, and we'll handle the rest.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start Your Blog <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Modern Chyrp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
