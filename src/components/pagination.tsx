import Link from "next/link";

export function Pagination({ base, page, pages }: { base: string; page: number; pages: number }) {
  if (pages <= 1) return null;
  const href = (p: number) => (p === 1 ? base : `${base}?page=${p}`);
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={`grid h-10 w-10 place-items-center rounded-full text-sm font-medium ${
            p === page ? "bg-leaf-700 text-white" : "bg-white text-forest ring-1 ring-leaf-100 hover:bg-leaf-50"
          }`}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
