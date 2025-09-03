import Link from "next/link";
import Logo from "@/components/logo";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
                <Logo />
                <h1 className="text-2xl font-bold font-headline">Modern Chyrp</h1>
            </Link>
            <nav>
                <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Blog
                </Link>
            </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-8 bg-card mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Modern Chyrp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
