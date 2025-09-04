
'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deletePost, Post } from "@/services/posts";
import { useToast } from "@/hooks/use-toast";
import type { AppUser } from "@/context/auth-provider";
import { Timestamp } from "firebase/firestore";

function toDate(timestamp: any): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  }
  return new Date();
};


function formatTimestamp(timestamp: any) {
  if (!timestamp) {
    return 'N/A';
  }
  try {
    return toDate(timestamp).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
}

export function PostsTable({ initialPosts, user }: { initialPosts: Post[], user: AppUser | null }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteClick = (post: Post) => {
    setSelectedPost(post);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPost || !selectedPost.id) return;
    
    setIsDeleting(true);
    try {
      await deletePost(selectedPost.id);
      setPosts(posts.filter(p => p.id !== selectedPost.id));
      toast({
        title: "Post Deleted",
        description: `The post "${selectedPost.title}" has been deleted.`,
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to delete the post.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
      setSelectedPost(null);
    }
  };
  
  const canEditOrDelete = (post: Post) => {
    if (!user) return false;
    if (user.role === 'Admin' || user.role === 'Editor') {
      return true;
    }
    if (user.role === 'Author' && post.authorId === user.uid) {
      return true;
    }
    return false;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Created at</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
              <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No posts found. <Link href="/posts/new" className="text-primary underline">Create one now</Link>.
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={post.status === "Published" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatTimestamp(post.createdAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!canEditOrDelete(post)}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {canEditOrDelete(post) ? (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href={`/posts/${post.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(post)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      ) : (
                          <DropdownMenuItem disabled>
                            No actions available
                          </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              <span className="font-semibold"> {selectedPost?.title}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, delete post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
