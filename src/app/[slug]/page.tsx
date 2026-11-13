import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pagination } from "@/components/pagination";
import { PostCard, PostGrid } from "@/components/post-card";
import { getCategoryBySlug, getPublishedBySlug, listPosts, relatedPosts } from "@/lib/content";
import { readingTime, renderMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (cat) {
    return { title: cat.name, description: cat.description, alternates: { canonical: `/${cat.slug}/` } };
  }
  const row = await getPublishedBySlug(slug);
  if (!row) return {};
  const { post } = row;
  const description = post.seoDescription ?? post.excerpt;
  return {
    title: post.seoTitle ?? post.title,
    description,
    alternates: { canonical: `/${post.slug}/` },
    openGraph: {
      type: post.type === "post" ? "article" : "website",
      title: post.title,
      description,
      images: post.featuredImage ? [post.featuredImage] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export default async function SlugPage({ params, searchParams }: Props) {
  const { slug } = await params;

  // Category hubs keep their old WordPress URLs (/plant-guide/, /plant-care/, /green-house/).
  const cat = await getCategoryBySlug(slug);
  if (cat) {
    const page = Math.max(1, Number((await searchParams).page) || 1);
    const { rows, pages } = await listPosts({ categoryId: cat.id, page });
    return (
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-leaf-600">Topic</p>
        <h1 className="mt-2 text-4xl font-bold text-forest">{cat.name}</h1>
        <p className="mt-3 max-w-2xl text-lg text-stone">{cat.description}</p>
        <div className="mt-10">
          <PostGrid rows={rows} />
        </div>
        <Pagination base={`/${cat.slug}/`} page={page} pages={pages} />
      </div>
    );
  }

  const row = await getPublishedBySlug(slug);
  if (!row) notFound();
  const { post, category } = row;
  const { html, toc } = renderMarkdown(post.body);

  if (post.type === "page") {
    return (
      <article className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-4xl font-bold text-forest">{post.title}</h1>
        <div className="prose prose-lg prose-article mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    );
  }

  const related = await relatedPosts(post.categoryId, post.id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage ? [new URL(post.featuredImage, site.url).toString()] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${site.url}/logo.png` } },
    mainEntityOfPage: `${site.url}/${post.slug}/`,
  };

  return (
    <>
      <article className="mx-auto max-w-6xl px-4 py-12">
        <header className="mx-auto max-w-3xl text-center">
          {category && (
            <Link href={`/${category.slug}/`} className="text-sm font-semibold uppercase tracking-widest text-leaf-600 hover:text-leaf-800">
              {category.name}
            </Link>
          )}
          <h1 className="mt-3 text-3xl font-bold leading-tight text-forest sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-stone">{post.excerpt}</p>
          <p className="mt-4 text-sm text-stone">
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                Updated {post.updatedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </time>
            )}
            {" · "}
            {readingTime(post.body)} min read
          </p>
        </header>

        {post.featuredImage && (
          <div className="relative mx-auto mt-10 aspect-[16/9] max-w-5xl overflow-hidden rounded-3xl bg-leaf-50">
            <Image src={post.featuredImage} alt={post.featuredImageAlt ?? post.title} fill priority sizes="(min-width:1024px) 1024px, 100vw" className="object-cover" />
          </div>
        )}

        <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[1fr_16rem]">
          <div className="prose prose-lg prose-article max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
          {toc.length > 2 && (
            <aside className="order-first lg:order-last">
              <nav aria-label="On this page" className="rounded-2xl bg-white p-5 ring-1 ring-leaf-100 lg:sticky lg:top-28">
                <p className="text-sm font-semibold uppercase tracking-wide text-forest">On this page</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {toc
                    .filter((t) => t.depth === 2)
                    .map((t) => (
                      <li key={t.id}>
                        <a href={`#${t.id}`} className="text-stone hover:text-leaf-700">{t.text}</a>
                      </li>
                    ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-forest">Keep reading</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} category={category} />
            ))}
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
