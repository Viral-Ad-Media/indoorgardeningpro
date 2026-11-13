import type { Metadata } from "next";
import { Pagination } from "@/components/pagination";
import { PostGrid } from "@/components/post-card";
import { listPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "All Articles",
  description: "Every indoor gardening guide on Indoor Gardening Pro, newest first.",
  alternates: { canonical: "/blog/" },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { rows, pages } = await listPosts({ page });
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-bold text-forest">All articles</h1>
      <p className="mt-3 text-stone">Every guide on the site, newest first.</p>
      <div className="mt-10">
        <PostGrid rows={rows} />
      </div>
      <Pagination base="/blog/" page={page} pages={pages} />
    </div>
  );
}
