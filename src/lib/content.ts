import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { categories, posts } from "@/db/schema";

const published = eq(posts.status, "published");

export const PAGE_SIZE = 9;

export const getCategories = cache(async () =>
  db.select().from(categories).orderBy(categories.sortOrder, categories.name),
);

export const getCategoryBySlug = cache(async (slug: string) => {
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row ?? null;
});

export const getPublishedBySlug = cache(async (slug: string) => {
  const [row] = await db
    .select({ post: posts, category: categories })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.slug, slug), published))
    .limit(1);
  return row ?? null;
});

export async function listPosts({
  categoryId,
  page = 1,
  limit = PAGE_SIZE,
}: { categoryId?: number; page?: number; limit?: number } = {}) {
  const where = and(
    published,
    eq(posts.type, "post"),
    categoryId ? eq(posts.categoryId, categoryId) : undefined,
  );
  const [rows, [{ count }]] = await Promise.all([
    db
      .select({ post: posts, category: categories })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(where)
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(where),
  ]);
  return { rows, total: count, pages: Math.max(1, Math.ceil(count / limit)) };
}

export async function relatedPosts(categoryId: number | null, excludeId: number) {
  if (!categoryId) return [];
  return db
    .select()
    .from(posts)
    .where(
      and(
        published,
        eq(posts.type, "post"),
        eq(posts.categoryId, categoryId),
        sql`${posts.id} <> ${excludeId}`,
      ),
    )
    .orderBy(desc(posts.publishedAt))
    .limit(3);
}

export async function allPublishedForSitemap() {
  return db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt, type: posts.type })
    .from(posts)
    .where(published);
}
