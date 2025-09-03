
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, listAll, getMetadata, updateMetadata } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export interface StorageFile {
  name: string;
  url: string;
  path: string;
  size: number;
  contentType: string;
  createdAt: string;
  alt?: string;
}

export const uploadFile = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create a unique file name
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${fileId}.${fileExtension}`;
    const storageRef = ref(storage, `uploads/${uniqueFileName}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error("Upload failed:", error);
        reject(new Error(`Failed to upload file: ${error.message}`));
      },
      async () => {
        // Handle successful uploads on complete
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error: any) {
           reject(new Error(`Failed to get download URL: ${error.message}`));
        }
      }
    );
  });
};


export const getFiles = async (): Promise<StorageFile[]> => {
    try {
        const listRef = ref(storage, 'uploads/');
        const res = await listAll(listRef);

        const filePromises = res.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            const metadata = await getMetadata(itemRef);
            return {
                name: metadata.name,
                url: url,
                path: itemRef.fullPath,
                size: metadata.size,
                contentType: metadata.contentType || 'application/octet-stream',
                createdAt: metadata.timeCreated,
                alt: metadata.customMetadata?.alt || '',
            };
        });

        const files = await Promise.all(filePromises);
        
        // Sort files by creation date, newest first
        files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return files;

    } catch (error: any) {
        console.error("Error getting files: ", error);
        throw new Error(`Failed to fetch files: ${error.message}`);
    }
}

export const updateFileAltText = async (filePath: string, altText: string): Promise<void> => {
    try {
        const fileRef = ref(storage, filePath);
        await updateMetadata(fileRef, {
            customMetadata: {
                alt: altText,
            }
        });
    } catch (error: any) {
        console.error("Error updating alt text: ", error);
        throw new Error(`Failed to update alt text: ${error.message}`);
    }
}
