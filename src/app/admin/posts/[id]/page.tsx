import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { getCategories } from "@/lib/content";
import { deletePost } from "../../actions";
import { PostForm } from "../post-form";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [[post], categories, { saved }] = await Promise.all([
    db.select().from(posts).where(eq(posts.id, id)),
    getCategories(),
    searchParams,
  ]);
  if (!post) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-forest">Edit {post.type === "page" ? "page" : "article"}</h1>
        <div className="flex items-center gap-3 text-sm">
          {saved && <span className="rounded-full bg-leaf-100 px-3 py-1 text-leaf-800">Saved</span>}
          {post.status === "published" && (
            <Link href={`/${post.slug}/`} className="text-leaf-700 hover:underline">View live →</Link>
          )}
          <form action={deletePost.bind(null, post.id)}>
            <button className="text-red-700 hover:underline">Delete</button>
          </form>
        </div>
      </div>
      <PostForm post={post} type={post.type} categories={categories} />
    </div>
  );
}
