/**
 * Loads the categories and the Markdown articles/pages in /content into the database.
 * Safe to run more than once: rows are upserted by slug.
 *
 *   npm run db:seed
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { sql } from "drizzle-orm";
import { db } from "../src/db";
import { categories, posts } from "../src/db/schema";

const CATEGORIES = [
  {
    slug: "plant-guide",
    name: "Plant Guide",
    description: "Which plants to grow indoors, from easy houseplants and flowers to herbs, vegetables and terrarium plants.",
    image: "/uploads/2022/04/houseplant-care.jpg",
    sortOrder: 1,
  },
  {
    slug: "plant-care",
    name: "Plant Care",
    description: "Watering, light, humidity, soil, feeding, repotting and pest control, explained simply.",
    image: "/uploads/2022/04/plant-care.jpg",
    sortOrder: 2,
  },
  {
    slug: "green-house",
    name: "Greenhouse & Hydroponics",
    description: "Indoor greenhouses, hydroponic systems and other setups for growing more food and flowers at home.",
    image: "/uploads/2022/04/greenhouse-garden.jpg",
    sortOrder: 3,
  },
];

async function main() {
  for (const c of CATEGORIES) {
    await db
      .insert(categories)
      .values(c)
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: c.name, description: c.description, image: c.image, sortOrder: c.sortOrder },
      });
  }
  const catRows = await db.select().from(categories);
  const catId = new Map(catRows.map((c) => [c.slug, c.id]));

  const dir = path.join(process.cwd(), "content");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const slug = file.replace(/\.md$/, "");
    const type: "post" | "page" = data.type === "page" ? "page" : "post";
    const publishedAt = data.date ? new Date(data.date) : new Date();
    const image = data.image as string | undefined;
    if (image && !fs.existsSync(path.join(process.cwd(), "public", image))) {
      throw new Error(`${file}: image ${image} not found in /public`);
    }
    const row = {
      type,
      slug,
      title: String(data.title),
      excerpt: String(data.excerpt ?? ""),
      body: content.trim(),
      featuredImage: image ?? null,
      featuredImageAlt: data.imageAlt ?? null,
      categoryId: data.category ? (catId.get(data.category) ?? null) : null,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      status: "published" as const,
      publishedAt,
      updatedAt: data.updated ? new Date(data.updated) : publishedAt,
    };
    if (data.category && !row.categoryId) throw new Error(`${file}: unknown category ${data.category}`);
    await db
      .insert(posts)
      .values(row)
      .onConflictDoUpdate({
        target: posts.slug,
        set: { ...row, updatedAt: sql`excluded.updated_at` },
      });
    console.log(`  ${type.padEnd(4)} /${slug}/`);
  }
  console.log(`Seeded ${CATEGORIES.length} topics and ${files.length} articles/pages.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
