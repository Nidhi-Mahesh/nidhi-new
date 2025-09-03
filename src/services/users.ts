
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, updateDoc } from 'firebase/firestore';

export type UserRole = 'Admin' | 'Editor' | 'Author';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
}

const usersCollection = collection(db, 'users');

export const createUserProfile = async (uid: string, email: string, displayName: string, photoURL: string | null): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    // Check if user profile already exists
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
        const isFirstUser = (await getDocs(query(usersCollection))).empty;
        await setDoc(userRef, {
            uid,
            email,
            displayName,
            photoURL,
            role: isFirstUser ? 'Admin' : 'Author', // Make the first user an Admin
        });
    }
  } catch (error: any) {
    console.error('🚨 Error in createUserProfile:', error);
    throw new Error(`Failed to create user profile: ${error.message}`);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    } catch (error: any) {
        console.error('🚨 Error in getUserProfile:', error);
        throw new Error(`Failed to get user profile: ${error.message}`);
    }
}

export const getUsers = async (): Promise<UserProfile[]> => {
  try {
    const q = query(usersCollection, orderBy('displayName', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error: any) {
    console.error('🚨 Error in getUsers:', error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

export const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { role });
    } catch (error: any) {
        console.error('🚨 Error in updateUserRole:', error);
        throw new Error(`Failed to update user role: ${error.message}`);
    }
};

export const updateUserProfileInDb = async (uid: string, profileData: { displayName?: string, photoURL?: string }): Promise<void> => {
    try {
        const userRef = doc(db, 'users', uid);
        const dataToUpdate: any = {};
        if(profileData.displayName) dataToUpdate.displayName = profileData.displayName;
        if(profileData.photoURL) dataToUpdate.photoURL = profileData.photoURL;

        if(Object.keys(dataToUpdate).length > 0) {
            await updateDoc(userRef, dataToUpdate);
        }
    } catch (error: any) {
        console.error('🚨 Error in updateUserProfileInDb:', error);
        throw new Error(`Failed to update user profile in database: ${error.message}`);
    }
}
