'use client';

import { useState } from 'react';
import { createPost } from '@/services/posts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DebugNewPostPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testCreatePost = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const testPost = {
        title: 'Test Post ' + Date.now(),
        content: 'This is a test post content',
        author: 'Test Author',
        status: 'Draft' as const,
        metaDescription: 'Test meta description',
        tags: ['test', 'debug']
      };

      console.log('Attempting to create post:', testPost);
      const postId = await createPost(testPost);
      setResult(`✅ Success! Created post with ID: ${postId}`);
    } catch (error: any) {
      console.error('Detailed error:', error);
      setResult(`❌ Error: ${error.message}\n\nCheck the browser console for more details.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Debug Post Creation</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground mb-4">
                Click the button below to attempt to create a sample post directly via the `createPost` service. Check the browser's developer console for detailed logs.
            </p>
            <Button 
                onClick={testCreatePost} 
                disabled={loading}
                className="mb-4"
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? 'Testing...' : 'Test Create Post'}
            </Button>
            
            {result && (
                <div className={`p-3 rounded-md ${result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <pre className="whitespace-pre-wrap text-sm font-mono">{result}</pre>
                </div>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground border-t pt-4">
                <p><strong>Project ID:</strong> modern-chyrp</p>
                <p><strong>Note:</strong> Ensure your Firestore security rules allow write operations.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
