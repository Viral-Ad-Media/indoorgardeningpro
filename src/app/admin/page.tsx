import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { categories, posts } from "@/db/schema";

export default async function AdminHome() {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      type: posts.type,
      status: posts.status,
      updatedAt: posts.updatedAt,
      category: categories.name,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .orderBy(posts.type, desc(posts.updatedAt));

  return (
    <div>
      <h1 className="text-2xl font-bold text-forest">Content</h1>
      <div className="mt-6 overflow-x-auto rounded-xl bg-white ring-1 ring-leaf-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-leaf-50 text-forest">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-leaf-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/posts/${r.id}/`} className="font-medium text-leaf-700 hover:underline">{r.title}</Link>
                  <div className="text-xs text-stone">/{r.slug}/</div>
                </td>
                <td className="px-4 py-3 capitalize">{r.type}</td>
                <td className="px-4 py-3">{r.category ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "published" ? "bg-leaf-100 text-leaf-800" : "bg-amber-100 text-amber-800"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone">{r.updatedAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
