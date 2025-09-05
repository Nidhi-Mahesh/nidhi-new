import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/services/posts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ posts: [] });
    }

    const posts = await searchPosts(query);
    
    return NextResponse.json({ 
      posts,
      count: posts.length,
      query: query.trim()
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search posts', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ posts: [] });
    }

    const posts = await searchPosts(query);
    
    return NextResponse.json({ 
      posts,
      count: posts.length,
      query: query.trim()
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search posts', message: error.message },
      { status: 500 }
    );
  }
}
