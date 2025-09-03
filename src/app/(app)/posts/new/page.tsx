import { PostForm } from "@/components/post-form";

export default function NewPostPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-headline tracking-tight">New Post</h1>
          <p className="text-muted-foreground mt-1">
            Create a new blog post. Use the AI tools to assist you.
          </p>
        </header>
        <PostForm />
      </div>
    </div>
  );
}
