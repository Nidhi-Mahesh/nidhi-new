
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateDraftFromHeadline } from "@/ai/flows/ai-generate-draft-from-headline";
import { suggestPostTitles } from "@/ai/flows/ai-suggest-post-titles";
import { generateMetaDescription } from "@/ai/flows/ai-generate-meta-description";
import { suggestTagsAndCategories } from "@/ai/flows/ai-suggest-tags-and-categories";
import { createPost } from "@/services/posts";
import { useToast } from "@/hooks/use-toast";

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
import { Loader2, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

const postFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.string().optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

export function PostForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isSuggestingTitles, setIsSuggestingTitles] = useState(false);
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      metaDescription: "",
      tags: "",
    },
  });

  async function handleGenerateDraft() {
    const title = form.getValues("title");
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
      const result = await generateDraftFromHeadline({ headline: title });
      form.setValue("content", result.draft);
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
    setIsSubmitting(true);
    try {
      await createPost({
        title: data.title,
        content: data.content || '',
        author: "Jane Doe", // Hardcoded for now
        status: status,
        metaDescription: data.metaDescription,
        tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
      });
      toast({
        title: `Post ${status === 'Published' ? 'Published' : 'Saved'}`,
        description: "Your post has been successfully saved.",
      });
      router.push('/posts');
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
                        <Button type="button" size="sm" variant="ghost" onClick={handleGenerateDraft} disabled={isGeneratingDraft}>
                          {isGeneratingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                          Generate Draft
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Tell your story..."
                          className="min-h-[400px]"
                          {...field}
                        />
                      </FormControl>
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
                        <Button type="button" size="sm" variant="ghost" onClick={handleGenerateMeta} disabled={isGeneratingMeta}>
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
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publish Post
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={form.handleSubmit(data => onSubmit(data, 'Draft'))} 
                  disabled={isSubmitting}
                >
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save as Draft
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
                     <Button type="button" variant="outline" onClick={handleSuggestTitles} disabled={isSuggestingTitles}>
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
                        <Button type="button" size="sm" variant="ghost" onClick={handleSuggestTags} disabled={isSuggestingTags}>
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
  );
}

    