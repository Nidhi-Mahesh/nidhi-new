
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadFile, getFiles, StorageFile } from "@/services/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (url: string) => void;
}

export function MediaModal({ isOpen, onClose, onInsertImage }: MediaModalProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  async function fetchFiles() {
    setIsLoading(true);
    try {
      const fetchedFiles = await getFiles();
      setFiles(fetchedFiles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch media files.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen, toast]);

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
      await fetchFiles(); // Refresh file list
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>Select an image to insert or upload a new one.</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="library" className="flex-grow flex flex-col min-h-0">
          <TabsList className="shrink-0">
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="flex-grow overflow-hidden">
             <ScrollArea className="h-full pr-4">
                {isLoading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {Array.from({ length: 18 }).map((_, index) => (
                        <Skeleton key={index} className="aspect-square rounded-lg" />
                      ))}
                  </div>
                ) : files.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {files.map((file) => (
                      <div key={file.path} className="group relative aspect-square cursor-pointer" onClick={() => onInsertImage(file.url)}>
                        <Image
                          src={file.url}
                          alt={file.name}
                          fill
                          className="rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                           <p className="text-white text-xs text-center p-1">Click to insert</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
                      <p className="font-bold mb-2">No media found.</p>
                      <p>Switch to the "Upload New" tab to add images.</p>
                  </div>
                )}
             </ScrollArea>
          </TabsContent>
          <TabsContent value="upload" className="flex-grow">
             <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8">
                {isUploading ? (
                    <div className="w-full max-w-sm text-center">
                        <Progress value={uploadProgress} className="w-full mb-4" />
                        <p className="text-sm text-muted-foreground">Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                ) : (
                    <>
                        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Upload an Image</h3>
                        <p className="text-sm text-muted-foreground mb-4">Drag and drop a file or click to select.</p>
                        <Button asChild>
                          <label htmlFor="modal-file-upload">
                              Choose File
                          </label>
                        </Button>
                        <Input id="modal-file-upload" type="file" onChange={handleFileChange} className="hidden" disabled={isUploading} accept="image/*" />
                    </>
                )}
             </div>
          </TabsContent>
        </Tabs>
        
      </DialogContent>
    </Dialog>
  );
}
