import Image from "next/image";
import Link from "next/link";
import { PostGrid } from "@/components/post-card";
import { getCategories, listPosts } from "@/lib/content";
import { site } from "@/lib/site";

export const revalidate = 300;

export default async function HomePage() {
  const [{ rows }, cats] = await Promise.all([listPosts({ limit: 7 }), getCategories()]);
  const [lead, ...rest] = rows;

  return (
    <>
      <section className="relative overflow-hidden bg-forest text-white">
        <Image
          src="/uploads/2022/04/herbs.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <span className="block h-1 w-14 rounded bg-sun" />
          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Grow healthier plants indoors, one simple habit at a time.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-leaf-100">{site.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/plant-guide/" className="rounded-full bg-sun px-6 py-3 font-semibold text-forest hover:bg-sun-dark">
              Browse the plant guide
            </Link>
            <Link href="/plant-care/" className="rounded-full px-6 py-3 font-semibold text-white ring-1 ring-white/40 hover:bg-white/10">
              Plant care basics
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-leaf-600">Explore by topic</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/${c.slug}/`}
              className="group relative flex h-44 items-end overflow-hidden rounded-2xl bg-leaf-800 p-5 text-white"
            >
              {c.image && (
                <Image src={c.image} alt="" fill sizes="(min-width:640px) 33vw, 100vw" className="object-cover opacity-50 transition group-hover:scale-105 group-hover:opacity-40" />
              )}
              <span className="relative">
                <span className="block text-xl font-semibold">{c.name}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-leaf-100">{c.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {lead && (
        <section className="mx-auto max-w-6xl px-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-leaf-600">Latest guides</h2>
          <Link
            href={`/${lead.post.slug}/`}
            className="group mt-5 grid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-leaf-100 md:grid-cols-2"
          >
            <div className="relative aspect-[3/2] md:aspect-auto">
              {lead.post.featuredImage && (
                <Image src={lead.post.featuredImage} alt={lead.post.featuredImageAlt ?? ""} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
              )}
            </div>
            <div className="p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-leaf-600">{lead.category?.name}</p>
              <h3 className="mt-3 text-2xl font-bold text-forest group-hover:text-leaf-700">{lead.post.title}</h3>
              <p className="mt-3 leading-relaxed text-stone">{lead.post.excerpt}</p>
              <span className="mt-5 inline-block font-semibold text-leaf-700">Read the guide →</span>
            </div>
          </Link>
          <div className="mt-8">
            <PostGrid rows={rest} />
          </div>
          <div className="mt-10 text-center">
            <Link href="/blog/" className="rounded-full bg-leaf-700 px-6 py-3 font-semibold text-white hover:bg-leaf-800">
              See all articles
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
