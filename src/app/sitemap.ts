import type { MetadataRoute } from "next";
import { allPublishedForSitemap, getCategories } from "@/lib/content";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [items, cats] = await Promise.all([allPublishedForSitemap(), getCategories()]);
  return [
    { url: `${site.url}/`, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/blog/`, changeFrequency: "daily", priority: 0.8 },
    ...cats.map((c) => ({ url: `${site.url}/${c.slug}/`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...items.map((p) => ({
      url: `${site.url}/${p.slug}/`,
      lastModified: p.updatedAt,
      priority: p.type === "post" ? 0.7 : 0.3,
    })),
  ];
}
