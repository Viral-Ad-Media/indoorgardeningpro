import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { categories, posts } from "@/db/schema";

const published = eq(posts.status, "published");

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

/**
 * During `next build`, pages such as / and /sitemap.xml are prerendered, which
 * means the database is queried on the build machine. If DATABASE_URL is missing
 * or the migrations have not been run yet, that used to fail the whole deploy.
 * At build time only, fall back to empty data and log a warning; the pages are
 * ISR, so they fill in on the first revalidation once the database is ready.
 * At runtime, errors are thrown as normal so real problems stay visible.
 */
async function buildSafe<T>(label: string, query: () => Promise<T>, fallback: T): Promise<T> {
  if (!isBuild) return query();
  try {
    return await query();
  } catch (err) {
    const reason = err instanceof Error ? (err.cause instanceof Error ? err.cause.message : err.message) : String(err);
    console.warn(
      `[content] ${label}: database not ready during build (${reason}). ` +
        "Rendering with empty data; run `npm run db:migrate` and `npm run db:seed` against this DATABASE_URL.",
    );
    return fallback;
  }
}

export const PAGE_SIZE = 9;

export const getCategories = cache(async () =>
  buildSafe(
    "getCategories",
    () => db.select().from(categories).orderBy(categories.sortOrder, categories.name),
    [] as (typeof categories.$inferSelect)[],
  ),
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
  const query = () => Promise.all([
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
  const [rows, [{ count }]] = await buildSafe("listPosts", query, [[], [{ count: 0 }]] as Awaited<ReturnType<typeof query>>);
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
  return buildSafe(
    "allPublishedForSitemap",
    () =>
      db
        .select({ slug: posts.slug, updatedAt: posts.updatedAt, type: posts.type })
        .from(posts)
        .where(published),
    [],
  );
}
