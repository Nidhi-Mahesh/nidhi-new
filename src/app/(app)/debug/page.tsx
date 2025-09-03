
'use client';

import { useState } from 'react';
import { createPost } from '@/services/posts';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DebugPage() {
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceResult, setServiceResult] = useState('');
  
  const [directLoading, setDirectLoading] = useState(false);
  const [directResult, setDirectResult] = useState('');

  const testCreatePostService = async () => {
    setServiceLoading(true);
    setServiceResult('Testing service...');
    try {
      const testPost = {
        title: 'Test Post via Service ' + Date.now(),
        content: 'This is a test post content.',
        author: 'Test Author',
        status: 'Draft' as const,
        metaDescription: 'Test meta description.',
        tags: ['test', 'service']
      };
      const postId = await createPost(testPost);
      setServiceResult(`✅ Success via Service! Post ID: ${postId}`);
    } catch (error: any) {
      setServiceResult(`❌ Error via Service: ${error.message}`);
      console.error('🚨 Detailed service error:', error);
    } finally {
      setServiceLoading(false);
    }
  };
  
  const testDirectFirestoreWrite = async () => {
    setDirectLoading(true);
    setDirectResult('Testing direct write...');
    try {
      const postsCollection = collection(db, 'posts');
      const docData = {
        title: 'Test Post via Direct Write ' + Date.now(),
        content: 'Direct write test content.',
        author: 'Direct Writer',
        status: 'Draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tags: ['test', 'direct']
      };
      const docRef = await addDoc(postsCollection, docData);
      setDirectResult(`✅ Success via Direct Write! Post ID: ${docRef.id}`);
    } catch (error: any) {
      setDirectResult(`❌ Error via Direct Write: ${error.message}`);
      console.error('🚨 Detailed direct write error:', error);
    } finally {
      setDirectLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Firestore Debugging</CardTitle>
            <CardDescription>
              These tests will help isolate the issue. Test the direct write first. Check the browser console for detailed logs.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>1. Test Direct Firestore Write</CardTitle>
            <CardDescription>
              This bypasses the `createPost` service and writes directly to Firestore. If this fails, the issue is likely with your Firebase config or security rules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testDirectFirestoreWrite} disabled={directLoading}>
              {directLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {directLoading ? 'Testing...' : 'Test Direct Write'}
            </Button>
            {directResult && (
              <div className={`mt-4 p-3 rounded-md ${directResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <pre className="whitespace-pre-wrap text-sm font-mono">{directResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>2. Test `createPost` Service</CardTitle>
             <CardDescription>
              This uses the `createPost` function from your `services/posts.ts` file. If this fails but the direct write succeeds, the issue is within the service function itself.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testCreatePostService} disabled={serviceLoading}>
              {serviceLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {serviceLoading ? 'Testing...' : 'Test Service Function'}
            </Button>
            {serviceResult && (
              <div className={`mt-4 p-3 rounded-md ${serviceResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <pre className="whitespace-pre-wrap text-sm font-mono">{serviceResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
