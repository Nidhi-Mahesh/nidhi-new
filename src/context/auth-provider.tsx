
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithRedirect, getRedirectResult, updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { createUserProfile, getUserProfile, UserProfile, updateUserProfileInDb } from '@/services/users';

export interface AppUser extends User {
    role?: UserProfile['role'];
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, displayName: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateUserProfile: (profile: { displayName?: string, photoURL?: string }) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error("Error processing redirect result:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userProfile = await getUserProfile(firebaseUser.uid);
        if (!userProfile) {
          await createUserProfile(firebaseUser.uid, firebaseUser.email!, firebaseUser.displayName!, firebaseUser.photoURL);
          userProfile = await getUserProfile(firebaseUser.uid);
        }

        const appUser = { ...firebaseUser, role: userProfile?.role };
        setUser(appUser);

        const protectedRedirectPaths = ['/login', '/signup'];
        if (protectedRedirectPaths.includes(pathname)) {
            router.push('/dashboard');
        }
      } else {
        setUser(null);
        const publicPaths = ['/login', '/signup', '/', '/blog'];
        const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

        if (!isPublicPath) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signup = async (email: string, pass: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;
    if (firebaseUser) {
        await updateProfile(firebaseUser, { displayName });
        await createUserProfile(firebaseUser.uid, firebaseUser.email!, displayName, firebaseUser.photoURL);
    }
    return userCredential;
  };
  
  const logout = () => {
    return signOut(auth);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  }

  const updateUserProfile = async (profile: { displayName?: string, photoURL?: string }) => {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, profile);
        await updateUserProfileInDb(auth.currentUser.uid, profile);
        setUser(prevUser => prevUser ? { ...prevUser, ...profile, displayName: profile.displayName ?? prevUser.displayName, photoURL: profile.photoURL ?? prevUser.photoURL } : null);
    } else {
        throw new Error("No user is signed in.");
    }
  }

  const updateUserPassword = async (newPassword: string) => {
    if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
    } else {
        throw new Error("No user is signed in.");
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
    updateUserProfile,
    updateUserPassword,
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Loading application...</p>
        </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
