
import { getFiles } from "@/services/storage";
import { MediaClient } from "@/components/media-client";

export default async function MediaPage() {
  const files = await getFiles();

  return <MediaClient initialFiles={files} />;
}
