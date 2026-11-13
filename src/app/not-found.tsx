import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-leaf-600">404</p>
      <h1 className="mt-3 text-3xl font-bold text-forest">This page didn&apos;t take root</h1>
      <p className="mt-3 text-stone">The page you were looking for has moved or no longer exists.</p>
      <Link href="/blog/" className="mt-8 inline-block rounded-full bg-leaf-700 px-6 py-3 font-semibold text-white hover:bg-leaf-800">
        Browse all articles
      </Link>
    </div>
  );
}
