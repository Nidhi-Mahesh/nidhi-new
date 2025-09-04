
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/services/users';
import type { AppUser } from '@/context/auth-provider';

/**
 * A helper function to get the currently authenticated user on the server.
 * This is useful for Server Components.
 */
export const getAuthenticatedUser = async (): Promise<AppUser | null> => {
    // This is a temporary solution to get the authenticated user on the server.
    // In a real application, you would use a more robust solution like session cookies.
    // For now, we assume the client-side auth state has been populated.
    // This will likely only work after an initial client-side render.
    if (auth.currentUser) {
        const userProfile = await getUserProfile(auth.currentUser.uid);
        if (userProfile) {
            return {
                ...auth.currentUser,
                role: userProfile.role,
            };
        }
        return auth.currentUser;
    }
    return null;
}
