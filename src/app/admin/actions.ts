"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { slugify } from "@/lib/markdown";
import { requireAdmin } from "@/lib/session";

const PostInput = z.object({
  type: z.enum(["post", "page"]),
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().max(120).optional(),
  excerpt: z.string().trim().max(400).default(""),
  body: z.string().max(200_000).default(""),
  featuredImage: z
    .string()
    .trim()
    .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//.test(v), "Use a /uploads/ path or an https URL")
    .default(""),
  featuredImageAlt: z.string().trim().max(200).default(""),
  categoryId: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().trim().max(70).default(""),
  seoDescription: z.string().trim().max(170).default(""),
});

export type FormState = { error?: string } | undefined;

export async function savePost(id: number | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = PostInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  const v = parsed.data;
  const slug = slugify(v.slug || v.title);
  if (!slug) return { error: "Slug is empty." };

  const values = {
    type: v.type,
    title: v.title,
    slug,
    excerpt: v.excerpt,
    body: v.body,
    featuredImage: v.featuredImage || null,
    featuredImageAlt: v.featuredImageAlt || null,
    categoryId: v.type === "post" ? (v.categoryId ?? null) : null,
    status: v.status,
    seoTitle: v.seoTitle || null,
    seoDescription: v.seoDescription || null,
    updatedAt: new Date(),
  };

  try {
    if (id) {
      const [existing] = await db.select({ publishedAt: posts.publishedAt }).from(posts).where(eq(posts.id, id));
      await db
        .update(posts)
        .set({ ...values, publishedAt: existing?.publishedAt ?? (v.status === "published" ? new Date() : null) })
        .where(eq(posts.id, id));
    } else {
      const [row] = await db
        .insert(posts)
        .values({ ...values, authorId: session.user.id, publishedAt: v.status === "published" ? new Date() : null })
        .returning({ id: posts.id });
      id = row.id;
    }
  } catch (e) {
    if (String(e).includes("posts_slug_unique")) return { error: `The URL /${slug}/ is already used.` };
    throw e;
  }

  revalidatePath("/", "layout");
  redirect(`/admin/posts/${id}/?saved=1`);
}

export async function deletePost(id: number) {
  await requireAdmin();
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/", "layout");
  redirect("/admin/");
}
