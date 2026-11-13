import Image from "next/image";
import Link from "next/link";
import type { Category, Post } from "@/db/schema";

export function PostCard({ post, category }: { post: Post; category?: Category | null }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-leaf-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/${post.slug}/`} className="relative block aspect-[3/2] overflow-hidden bg-leaf-50">
        {post.featuredImage && (
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt ?? ""}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {category && (
          <Link
            href={`/${category.slug}/`}
            className="text-xs font-semibold uppercase tracking-wide text-leaf-600 hover:text-leaf-800"
          >
            {category.name}
          </Link>
        )}
        <h3 className="mt-2 text-lg font-semibold leading-snug text-forest">
          <Link href={`/${post.slug}/`} className="hover:text-leaf-700">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone">{post.excerpt}</p>
      </div>
    </article>
  );
}

export function PostGrid({ rows }: { rows: { post: Post; category: Category | null }[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(({ post, category }) => (
        <PostCard key={post.id} post={post} category={category} />
      ))}
    </div>
  );
}
