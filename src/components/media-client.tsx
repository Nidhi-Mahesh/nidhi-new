'use client';

import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Copy, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadFile, getFiles, StorageFile, updateFileAltText } from "@/services/storage";
import { useToast } from "@/hooks/use-toast";
import { Progress } from '@/components/ui/progress';
import { generateAltText } from '@/ai/flows/ai-generate-alt-text';

export function MediaClient() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAlt, setIsGeneratingAlt] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    // Setup IntersectionObserver for videos
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 } // play only if 60% visible
    );

    videoRefs.current.forEach((video) => {
      observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        observer.unobserve(video);
      });
    };
  }, [files]);

  async function fetchFiles() {
    try {
      setIsLoading(true);
      const fetchedFiles = await getFiles();
      setFiles(fetchedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "Failed to load media files. This might be due to Firebase Storage configuration.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      toast({
        title: "Upload Successful",
        description: `File "${file.name}" has been uploaded.`
      });
      await fetchFiles();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload the file.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Image URL copied to clipboard.",
    });
  };

  const handleGenerateAlt = async (file: StorageFile) => {
    setIsGeneratingAlt(file.path);
    try {
      const result = await generateAltText({ imageDataUri: file.url });
      await updateFileAltText(file.path, result.altText);
      setFiles(files.map(f => f.path === file.path ? { ...f, alt: result.altText } : f));
      toast({
        title: "Alt Text Generated",
        description: `Alt text for "${file.name}" has been updated.`
      });
    } catch (error) {
       toast({
        title: "Error Generating Alt Text",
        description: "Could not generate alt text for the image.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAlt(null);
    }
  }


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Media Library</h2>
          <p className="text-muted-foreground">Manage your uploaded images and media.</p>
        </div>
        <div className="flex items-center space-x-2">
            <LabelledButton />
        </div>
      </div>
      
       {isUploading && (
        <div className="mb-4">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2 text-center">Uploading... {Math.round(uploadProgress)}%</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Media</CardTitle>
          <CardDescription>Click on an image to copy its URL or generate AI alt text.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading media files...</p>
            </div>
          ) : files.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file) => (
                <div key={file.path} className="group relative aspect-square">
                  {file.contentType.startsWith('video/') ? (
                    <video
                      ref={(el) => {
                        if (el) videoRefs.current.set(file.path, el);
                      }}
                      src={file.url}
                      className="rounded-lg object-cover w-full h-full"
                      loop
                      muted
                      playsInline
                    />
                  ) : file.contentType.startsWith('audio/') ? (
                    <div className="flex items-center justify-center bg-muted rounded-lg w-full h-full">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🎵</div>
                        <div className="text-xs text-muted-foreground truncate px-2">{file.name}</div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={file.url}
                      alt={file.alt || file.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  )}
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        title="Copy URL"
                        onClick={() => handleCopyUrl(file.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                       {file.contentType.startsWith('image/') && (
                         <Button
                           variant="outline"
                           size="icon"
                           title="Generate Alt Text"
                           disabled={isGeneratingAlt === file.path}
                           onClick={() => handleGenerateAlt(file)}
                         >
                           {isGeneratingAlt === file.path ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4" />}
                         </Button>
                       )}
                    </div>
                    {file.alt && <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] p-1 rounded-sm">{file.alt}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[300px] border-2 border-dashed rounded-lg">
                <p className="font-bold mb-2">No media found.</p>
                <p>Start by uploading your first media file.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  
  function LabelledButton() {
    return (
        <>
            <Button asChild>
                <label htmlFor="file-upload">
                    <Upload className="mr-2 h-4 w-4" /> Upload File
                </label>
            </Button>
            <Input id="file-upload" type="file" onChange={handleFileChange} className="hidden" disabled={isUploading} accept="image/*,video/*,audio/*" />
        </>
    )
  }
}
