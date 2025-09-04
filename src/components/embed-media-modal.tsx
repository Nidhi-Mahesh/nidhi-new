
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';

interface EmbedMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmbed: (embedCode: string) => void;
}

const embedSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

type EmbedFormValues = z.infer<typeof embedSchema>;

const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export function EmbedMediaModal({ isOpen, onClose, onEmbed }: EmbedMediaModalProps) {
  const { toast } = useToast();
  const [isEmbedding, setIsEmbedding] = useState(false);
  
  const form = useForm<EmbedFormValues>({
    resolver: zodResolver(embedSchema),
    defaultValues: { url: '' },
  });

  const onSubmit = (data: EmbedFormValues) => {
    setIsEmbedding(true);
    let embedCode = '';
    const { url } = data;

    try {
      const youtubeVideoId = getYouTubeVideoId(url);
      if (youtubeVideoId) {
        embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeVideoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      } else if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop()?.split('?')[0];
        if (videoId) {
            embedCode = `<iframe src="https://player.vimeo.com/video/${videoId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        }
      } else {
        // Fallback for generic links - create a simple hyperlink
        embedCode = `[${url}](${url})`;
      }

      if (embedCode) {
        onEmbed(embedCode);
      } else {
        toast({ title: 'Error', description: 'Could not generate embed code for this URL.', variant: 'destructive' });
      }

    } catch (error) {
       toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
        setIsEmbedding(false);
        form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Embed Media</DialogTitle>
          <DialogDescription>
            Paste a URL from YouTube, Vimeo, or another website to embed it in your post.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                        <Label htmlFor="url">Media URL</Label>
                        <FormControl>
                            <Input
                            id="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={isEmbedding}>
                        {isEmbedding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Embed
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

