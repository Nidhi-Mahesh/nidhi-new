
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateDraftFromHeadline } from "@/ai/flows/ai-generate-draft-from-headline";
import { suggestPostTitles } from "@/ai/flows/ai-suggest-post-titles";
import { generateMetaDescription } from "@/ai/flows/ai-generate-meta-description";
import { suggestTagsAndCategories } from "@/ai/flows/ai-suggest-tags-and-categories";
import { createPost, updatePost, Post } from "@/services/posts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-provider";
import { MediaModal } from "@/components/media-modal";
import { EmbedMediaModal } from "@/components/embed-media-modal";
import { MarkdownPreview } from "@/components/markdown-preview"; // Import the new component

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components
import { Loader2, Sparkles, Image as ImageIcon, Link as LinkIcon, ShieldAlert, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const postFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(1, { message: 'Content is required.' }),
  metaDescription: z.string().optional(),
  tags: z.string().optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface PostFormProps {
  post?: Post;
}

export function PostForm({ post }: PostFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState<"Publish" | "Draft" | false>(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isSuggestingTitles, setIsSuggestingTitles] = useState(false);
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  
  const contentTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
  
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);

  const hasEditPermissions = (() => {
    if (!user) return false;
    if (!post) return true;
    if (user.role === 'Admin' || user.role === 'Editor') return true;
    if (user.role === 'Author' && post.authorId === user.uid) return true;
    return false;
  })();
  
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      metaDescription: "",
      tags: "",
    },
    disabled: !hasEditPermissions,
  });

  const contentValue = form.watch("content");
  
  const contentRef = (el: HTMLTextAreaElement) => {
    form.register('content');
    contentTextAreaRef.current = el;
  }

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content || '',
        metaDescription: post.metaDescription || '',
        tags: post.tags?.join(', ') || '',
      });
    }
  }, [post, form]);

  async function handleGenerateDraft() {
    const title = form.getValues("title");
    const existingContent = form.getValues("content");

    if (!title) {
      toast({
        title: "Title is required",
        description: "Please enter a title to generate a draft.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingDraft(true);
    try {
      const result = await generateDraftFromHeadline({ headline: title, existingContent: existingContent });
      const newContent = (existingContent ? existingContent + "\n\n" : "") + result.draft;
      form.setValue("content", newContent);
      toast({
        title: "Draft Generated",
        description: "The AI has generated a draft for your post.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate draft.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDraft(false);
    }
  }

  async function handleSuggestTitles() {
    const content = form.getValues("content");
    if (!content) {
      toast({
        title: "Content is required",
        description: "Please write some content to get title suggestions.",
        variant: "destructive",
      });
      return;
    }
    setIsSuggestingTitles(true);
    try {
      const result = await suggestPostTitles({ content });
      setSuggestedTitles(result.titles);
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to suggest titles.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingTitles(false);
    }
  }
  
  const insertContent = (markdown: string) => {
    const textarea = contentTextAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = form.getValues('content') || '';
    
    const newContent = 
        currentContent.substring(0, start) +
        markdown +
        currentContent.substring(end);
        
    form.setValue('content', newContent, { shouldDirty: true });

    setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
    }, 0);
  }
  
  function handleInsertImage(imageUrl: string) {
    insertContent(`![Image](${imageUrl})`);
    setIsMediaModalOpen(false);
    toast({ title: 'Image Inserted', description: 'The image has been added to your post.' });
  }
  
  function handleEmbedMedia(embedCode: string) {
    insertContent(`\n\n${embedCode}\n\n`);
    setIsEmbedModalOpen(false);
    toast({ title: 'Media Embedded', description: 'The embed code has been added to your post.' });
  }

  async function handleGenerateMeta() {
    const content = form.getValues("content");
     if (!content) {
      toast({
        title: "Content is required",
        description: "Please write some content to generate a meta description.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingMeta(true);
    try {
      const result = await generateMetaDescription({ postContent: content });
      form.setValue("metaDescription", result.metaDescription);
       toast({
        title: "Meta Description Generated",
        description: "The AI has generated a meta description.",
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to generate meta description.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMeta(false);
    }
  }

  async function handleSuggestTags() {
    const content = form.getValues("content");
    if (!content) {
      toast({
        title: "Content is required",
        description: "Please write some content to suggest tags.",
        variant: "destructive",
      });
      return;
    }
    setIsSuggestingTags(true);
    try {
      const result = await suggestTagsAndCategories({ postContent: content });
      const tags = result.tags.map(t => t.tag).join(', ');
      form.setValue("tags", tags);
       toast({
        title: "Tags Suggested",
        description: "The AI has suggested tags for your post.",
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to suggest tags.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingTags(false);
    }
  }
  
  async function onSubmit(data: PostFormValues, status: 'Published' | 'Draft') {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to create or update a post.", variant: "destructive" });
      return;
    }
    
    if (!hasEditPermissions) {
        toast({ title: "Permission Denied", description: "You do not have permission to edit this post.", variant: "destructive" });
        return;
    }

    setIsSubmitting(status);
    
    const postData = {
      title: data.title,
      content: data.content || '',
      author: post?.author || user.displayName || user.email || "Anonymous",
      authorId: post?.authorId || user.uid,
      status: status,
      metaDescription: data.metaDescription,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    };

    try {
      if (post?.id) {
        await updatePost(post.id, postData);
        toast({
          title: "Post Updated",
          description: "Your post has been successfully updated.",
        });
      } else {
        const newPostId = await createPost(postData);
        toast({
          title: `Post ${status === 'Published' ? 'Published' : 'Saved'}`,
          description: "Your post has been successfully saved.",
        });
      }
      router.push('/posts');
      router.refresh();
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to save post.",
        variant: "destructive",
      });
    } finally {
       setIsSubmitting(false);
    }
  }

  return (
    <>
    {!hasEditPermissions && post && (
        <Alert variant="destructive" className="mb-8">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription>
            You do not have permission to edit this post because you are not the original author.
            </AlertDescription>
        </Alert>
    )}
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
                <CardDescription>Fill in the main details of your blog post.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Your amazing post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                     <FormItem>
                        <div className="flex items-center justify-between">
                            <FormLabel>Content</FormLabel>
                             <div className="flex items-center gap-2">
                                <Button type="button" size="sm" variant="outline" onClick={() => setIsMediaModalOpen(true)} disabled={!hasEditPermissions}>
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Add Media
                                </Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => setIsEmbedModalOpen(true)} disabled={!hasEditPermissions}>
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    Embed Media
                                </Button>
                                <Button type="button" size="sm" variant="ghost" onClick={handleGenerateDraft} disabled={isGeneratingDraft || !hasEditPermissions}>
                                    {isGeneratingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Generate Draft
                                </Button>
                            </div>
                        </div>
                        <Tabs defaultValue="edit" className="w-full">
                            <TabsList>
                                <TabsTrigger value="edit">Edit</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                            </TabsList>
                            <TabsContent value="edit">
                                <FormControl>
                                    <Textarea
                                    placeholder="Tell your story..."
                                    className="min-h-[400px]"
                                    {...field}
                                    ref={contentRef}
                                    />
                                </FormControl>
                            </TabsContent>
                            <TabsContent value="preview">
                                <div className="min-h-[400px] p-4 border rounded-md">
                                    <MarkdownPreview content={contentValue || ''} />
                                </div>
                            </TabsContent>
                        </Tabs>
                        <FormDescription>
                            You can use Markdown for formatting.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO & Metadata</CardTitle>
                <CardDescription>Optimize your post for search engines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Meta Description</FormLabel>
                        <Button type="button" size="sm" variant="ghost" onClick={handleGenerateMeta} disabled={isGeneratingMeta || !hasEditPermissions}>
                           {isGeneratingMeta ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                           Generate
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea placeholder="A brief summary for search engines." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

          </div>

          <div className="lg:col-span-1 space-y-8">
             <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button 
                  type="button" 
                  onClick={form.handleSubmit(data => onSubmit(data, 'Published'))} 
                  disabled={!!isSubmitting || !hasEditPermissions}
                >
                  {isSubmitting === 'Published' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {post?.id ? 'Update & Publish' : 'Publish Post'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={form.handleSubmit(data => onSubmit(data, 'Draft'))} 
                  disabled={!!isSubmitting || !hasEditPermissions}
                >
                   {isSubmitting === 'Draft' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {post?.id ? 'Save Changes' : 'Save as Draft'}
                </Button>
                <Button 
                  type="button" 
                  variant="link"
                  onClick={() => router.back()}
                >
                   <ArrowLeft className="mr-2 h-4 w-4" />
                   Back to Posts
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Tools</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Dialog>
                   <DialogTrigger asChild>
                     <Button type="button" variant="outline" onClick={handleSuggestTitles} disabled={isSuggestingTitles || !hasEditPermissions}>
                        {isSuggestingTitles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Suggest Titles
                      </Button>
                   </DialogTrigger>
                   {suggestedTitles.length > 0 && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Suggested Titles</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-2">
                        {suggestedTitles.map((title, i) => (
                           <div key={i} className="p-3 rounded-md border bg-muted cursor-pointer hover:bg-muted/80" onClick={() => { form.setValue('title', title); toast({ title: 'Title updated!' })}}>
                              {title}
                           </div>
                        ))}
                      </div>
                    </DialogContent>
                   )}
                </Dialog>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                       <div className="flex items-center justify-between">
                        <FormLabel>Tags</FormLabel>
                        <Button type="button" size="sm" variant="ghost" onClick={handleSuggestTags} disabled={isSuggestingTags || !hasEditPermissions}>
                          {isSuggestingTags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                          Suggest
                        </Button>
                      </div>
                      <FormControl>
                        <Input placeholder="Tech, AI, Writing" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
    <MediaModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onInsertImage={handleInsertImage}
    />
    <EmbedMediaModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        onEmbed={handleEmbedMedia}
    />
    </>
  );
}
