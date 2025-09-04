
'use client'
import Link from "next/link";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, signOutUser } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b shrink-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-[80px] flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
                <Logo />
                <h1 className="text-2xl font-bold font-headline">Modern Chyrp</h1>
            </Link>
            <nav className="flex items-center gap-2">
                <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    View Blogs
                </Link>
                 {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings">Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOutUser}>
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <>
                        <Button variant="ghost" asChild>
                            <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </>
                )}
            </nav>
        </div>
      </header>
      <main className="flex-grow overflow--hidden">
        {children}
      </main>
    </div>
  );
}
