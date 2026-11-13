import { getCategories } from "@/lib/content";
import { PostForm } from "../post-form";

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const type = (await searchParams).type === "page" ? "page" : "post";
  const categories = await getCategories();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-forest">New {type === "page" ? "page" : "article"}</h1>
      <PostForm type={type} categories={categories} />
    </div>
  );
}
