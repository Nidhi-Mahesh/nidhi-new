
'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/ui/icons"


export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const { signup, loginWithGoogle } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
          await signup(email, password, displayName);
          router.push('/dashboard'); // Redirect to dashboard after successful signup
        } catch (error: any) {
           toast({
            title: "Sign-up Failed",
            description: error.message,
            variant: "destructive"
          });
        } finally {
            setIsLoading(false);
        }
      };

      const handleGoogleLogin = async () => {
          setIsGoogleLoading(true);
          try {
            await loginWithGoogle();
          } catch (error: any) {
             toast({
              title: "Google Sign-up Failed",
              description: error.message,
              variant: "destructive"
            });
          } finally {
            setIsGoogleLoading(false);
          }
        };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" type="text" placeholder="John Doe" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                 <Button disabled={isLoading} className="w-full">
                    {isLoading && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create account
                </Button>
            </CardContent>
        </form>
         <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                Or continue with
                </span>
            </div>
        </div>
        <div className="grid gap-6 p-6 pt-0">
            <Button variant="outline" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
                {isGoogleLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <svg className="mr-2 h-4 w-4" role="img" aria-label="Google logo" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xmlSpace="preserve">
                        <path d="M423.8,260.4c0-15.2-1.3-30-3.7-44.5h-154v83.8h87.8c-3.8,27.1-16,51.8-37.3,67.8v54.5h70.3C403.4,424.3,423.8,348,423.8,260.4z" style={{fill:"#4285F4"}}/>
                        <path d="M266.1,438.3c63.4,0,116.5-21,155.3-56.8l-70.3-54.5c-21,14.1-48,22.5-79.3,22.5c-61.1,0-113-41.2-131.5-96.5H89.9v56.2C128.8,393.3,192.1,438.3,266.1,438.3z" style={{fill:"#34A853"}}/>
                        <path d="M134.6,258.9c-4.7-14.1-7.4-29.2-7.4-44.8s2.7-30.7,7.4-44.8V113H64.3C49.9,142.9,41.1,176.3,41.1,214.1s8.8,71.2,23.2,101.1L134.6,258.9z" style={{fill:"#FBBC05"}}/>
                        <path d="M266.1,126.7c34.4,0,65.7,11.8,90.2,35.2l62.3-62.3C382.5,60.2,329.5,40,266.1,40C192.1,40,128.8,85,89.9,140.7l70.3,56.2C177.3,142.4,205,126.7,266.1,126.7z" style={{fill:"#EA4335"}}/>
                    </svg>
                )}
                Google
            </Button>
      </div>
        <CardFooter>
          <p className="text-center text-sm w-full">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
