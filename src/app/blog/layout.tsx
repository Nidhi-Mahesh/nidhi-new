import Link from "next/link";
import Logo from "@/components/logo";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b shrink-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-[80px] flex justify-between items-center">
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
      <main className="flex-grow overflow-hidden">
        {children}
      </main>
    </div>
  );
}
