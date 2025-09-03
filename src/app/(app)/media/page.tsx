import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

export default function MediaPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Media Library</h2>
      <Card>
        <CardHeader>
          <CardTitle>Manage Media</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[400px]">
          <Image className="h-16 w-16 mb-4" />
          <p className="font-bold">Media Library Coming Soon</p>
          <p>Drag and drop to upload and manage your images, videos, and other files.</p>
        </CardContent>
      </Card>
    </div>
  );
}
