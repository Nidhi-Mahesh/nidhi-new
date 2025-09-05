'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { Post } from '@/services/posts';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/services/users';

interface BlogSearchProps {
  posts: Post[];
  users: UserProfile[];
  onSearchResults?: (results: Post[]) => void;
}

function getInitials(name: string | null | undefined) {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length > 1 && names[0] && names[names.length - 1]) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  if (name && name.length > 0) {
    return name[0];
  }
  return 'U';
}

export function BlogSearch({ posts, users, onSearchResults }: BlogSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const usersMap = useMemo(() => 
    new Map<string, UserProfile>(users.map(u => [u.uid, u])), 
    [users]
  );

  // Search function that looks through title, content, tags, categories, and author
  const searchPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const searchTerms = query.split(' ').filter(term => term.length > 0);

    return posts.filter(post => {
      if (post.status !== 'Published') return false;

      const author = usersMap.get(post.authorId);
      const searchableText = [
        post.title,
        post.content,
        post.metaDescription || '',
        author?.displayName || '',
        ...(post.tags || []),
        ...(post.categories || [])
      ].join(' ').toLowerCase();

      // Check if all search terms are found in the searchable text
      return searchTerms.every(term => searchableText.includes(term));
    }).sort((a, b) => {
      // Sort by relevance - posts with query in title get higher priority
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const queryInATitle = searchTerms.some(term => aTitle.includes(term));
      const queryInBTitle = searchTerms.some(term => bTitle.includes(term));

      if (queryInATitle && !queryInBTitle) return -1;
      if (!queryInATitle && queryInBTitle) return 1;

      // Then sort by creation date (newest first)
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return bDate - aDate;
    });
  }, [searchQuery, posts, usersMap]);

  useEffect(() => {
    if (onSearchResults) {
      onSearchResults(searchPosts);
    }
  }, [searchPosts, onSearchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setShowResults(true);
      // Simulate search delay for better UX
      setTimeout(() => setIsSearching(false), 300);
    }
  };

  // Auto-search as user types (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsSearching(true);
      setShowResults(true);
      setTimeout(() => setIsSearching(false), 300);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    if (onSearchResults) {
      onSearchResults([]);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
    });
    
    return highlightedText;
  };

  const getExcerpt = (content: string, maxLength: number = 150) => {
    const plainText = content.replace(/[#*`_~\[\]()]/g, '').replace(/\n+/g, ' ');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search posts by title, content, tags, categories, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20 h-12 text-base"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={!searchQuery.trim() || isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>

      {/* Search Results */}
      {showResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Search Results ({searchPosts.length})
            </h3>
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={clearSearch}>
                Clear Search
              </Button>
            )}
          </div>

          {searchPosts.length > 0 ? (
            <div className="space-y-4">
              {searchPosts.map(post => {
                const author = usersMap.get(post.authorId);
                return (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Link href={`/users/${author?.uid}`}>
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={author?.photoURL || undefined} alt={author?.displayName || undefined} />
                            <AvatarFallback>{getInitials(author?.displayName)}</AvatarFallback>
                          </Avatar>
                        </Link>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Link href={`/users/${author?.uid}`} className="text-sm text-muted-foreground hover:text-primary">
                              {author?.displayName || 'Unknown Author'}
                            </Link>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <Link href={`/blog/${post.id}`}>
                            <h4 
                              className="text-xl font-semibold mb-2 hover:text-primary transition-colors"
                              dangerouslySetInnerHTML={{ 
                                __html: highlightText(post.title, searchQuery) 
                              }}
                            />
                          </Link>
                          
                          <p 
                            className="text-muted-foreground mb-3 leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                              __html: highlightText(getExcerpt(post.content), searchQuery) 
                            }}
                          />
                          
                          {/* Tags and Categories */}
                          <div className="flex flex-wrap gap-2">
                            {post.tags?.map(tag => (
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="text-xs"
                                dangerouslySetInnerHTML={{ 
                                  __html: highlightText(tag, searchQuery) 
                                }}
                              />
                            ))}
                            {post.categories?.map(category => (
                              <Badge 
                                key={category} 
                                variant="outline" 
                                className="text-xs"
                                dangerouslySetInnerHTML={{ 
                                  __html: highlightText(category, searchQuery) 
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium mb-2">No posts found</h4>
                  <p>Try adjusting your search terms or browse all posts below.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
