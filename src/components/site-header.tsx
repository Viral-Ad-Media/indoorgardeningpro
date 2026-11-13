import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-leaf-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:h-20">
        <Link href="/" className="shrink-0" aria-label={`${site.name} home`}>
          <Image src="/logo.png" alt={site.name} width={554} height={158} priority className="h-10 w-auto sm:h-12" />
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm font-medium text-forest">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3 py-2 transition hover:bg-leaf-50 hover:text-leaf-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MobileNav items={site.nav} />
      </div>
    </header>
  );
}
