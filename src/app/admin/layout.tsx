import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-leaf-100 pb-4">
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/admin/" className="text-forest hover:text-leaf-700">Content</Link>
          <Link href="/admin/posts/new/" className="text-forest hover:text-leaf-700">New article</Link>
          <Link href="/admin/posts/new/?type=page" className="text-forest hover:text-leaf-700">New page</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm text-stone">
          {session.user.email}
          <SignOutButton />
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
