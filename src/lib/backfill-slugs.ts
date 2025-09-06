import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Post } from '@/services/posts';

// Helper to generate a URL-friendly slug (duplicate from services/posts to avoid circular dependency for a one-off script)
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
};

export const backfillSlugs = async () => {
  console.log('Starting slug backfill...');
  const postsCollection = collection(db, 'posts');
  const snapshot = await getDocs(postsCollection);
  let updatedCount = 0;

  for (const document of snapshot.docs) {
    const post = { id: document.id, ...document.data() } as Post;
    if (!post.slug || post.slug === '') {
      const newSlug = generateSlug(post.title);
      const postRef = doc(db, 'posts', post.id!);
      await updateDoc(postRef, { slug: newSlug });
      console.log(`Updated post "${post.title}" with slug: ${newSlug}`);
      updatedCount++;
    }
  }
  console.log(`Slug backfill complete. ${updatedCount} posts updated.`);
};

// To run this script, you would typically import it and call backfillSlugs()
// For example, you could temporarily add it to a page's useEffect or a server-side function.
// Remember to remove it after execution to avoid unnecessary runs.
