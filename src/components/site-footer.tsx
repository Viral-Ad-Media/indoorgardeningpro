import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-forest text-leaf-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-white">{site.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-leaf-200">{site.tagline}.</p>
        </div>
        <nav aria-label="Topics">
          <p className="text-sm font-semibold uppercase tracking-wide text-sun">Topics</p>
          <ul className="mt-3 space-y-2 text-sm">
            {site.nav.slice(0, 4).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Site">
          <p className="text-sm font-semibold uppercase tracking-wide text-sun">Site</p>
          <ul className="mt-3 space-y-2 text-sm">
            {site.footer.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-leaf-200">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
