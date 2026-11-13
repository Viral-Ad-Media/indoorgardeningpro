"use client";
import { useActionState } from "react";
import type { Category, Post } from "@/db/schema";
import { savePost, type FormState } from "../actions";

const input =
  "mt-1 w-full rounded-lg border border-leaf-200 bg-white px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200";

export function PostForm({
  post,
  type,
  categories,
}: {
  post?: Post;
  type: "post" | "page";
  categories: Category[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePost.bind(null, post?.id ?? null), undefined);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <input type="hidden" name="type" value={type} />
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-forest">Title</span>
          <input name="title" required defaultValue={post?.title} className={`${input} text-lg`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-forest">Excerpt</span>
          <textarea name="excerpt" rows={2} defaultValue={post?.excerpt} className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-forest">Body (Markdown)</span>
          <textarea name="body" rows={28} defaultValue={post?.body} className={`${input} font-mono`} />
        </label>
      </div>
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-forest">Status</span>
          <select name="status" defaultValue={post?.status ?? "draft"} className={input}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-forest">URL slug</span>
          <input name="slug" defaultValue={post?.slug} placeholder="from title" className={input} />
        </label>
        {type === "post" && (
          <label className="block">
            <span className="text-sm font-medium text-forest">Topic</span>
            <select name="categoryId" defaultValue={post?.categoryId ?? ""} className={input}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          <span className="text-sm font-medium text-forest">Featured image</span>
          <input name="featuredImage" defaultValue={post?.featuredImage ?? ""} placeholder="/uploads/2022/04/basil.jpg" className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-forest">Image alt text</span>
          <input name="featuredImageAlt" defaultValue={post?.featuredImageAlt ?? ""} className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-forest">SEO title</span>
          <input name="seoTitle" maxLength={70} defaultValue={post?.seoTitle ?? ""} className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-forest">SEO description</span>
          <textarea name="seoDescription" maxLength={170} rows={3} defaultValue={post?.seoDescription ?? ""} className={input} />
        </label>
        {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        <button disabled={pending} className="w-full rounded-full bg-leaf-700 px-4 py-2.5 font-semibold text-white hover:bg-leaf-800 disabled:opacity-60">
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
