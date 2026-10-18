import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata = {
  title: "Page not found — Kora Market",
};

const tiles = [
  { href: "/category/phones-tablets", label: "Tech" },
  { href: "/category/home-office", label: "Home" },
  { href: "/category/fashion", label: "Fashion" },
  { href: "/category/health-beauty", label: "Beauty" },
];

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6">
      <Compass aria-hidden="true" size={40} strokeWidth={1.4} className="text-brand" />
      <h1 className="mt-4 text-[26px] font-bold tracking-[-0.02em] text-ink sm:text-[30px]">This page took a wrong turn</h1>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
        The link is dead or the product sold out. Nothing is lost — the shop is one step away, either by search or through the
        shelves below.
      </p>
      <form action="/search" method="GET" className="mt-6 flex w-full max-w-sm" role="search">
        <input
          type="search"
          name="query"
          placeholder="Search phones, fans, dresses…"
          className="min-h-11 flex-1 rounded-l-[4px] border border-border bg-sand px-3 text-[13px] text-ink placeholder:text-muted"
          aria-label="Search the shop"
        />
        <button
          type="submit"
          className="min-h-11 rounded-r-[4px] bg-brand px-4 text-[13px] font-bold text-white transition hover:bg-brand-deep"
        >
          Search
        </button>
      </form>
      <div className="mt-4 flex gap-3" data-testid="not-found-actions">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-[4px] bg-brand px-5 text-[13px] font-bold text-white transition hover:bg-brand-deep"
        >
          Back home
        </Link>
        <Link
          href="/deals"
          className="inline-flex min-h-10 items-center rounded-[4px] border border-border bg-paper px-5 text-[13px] font-bold text-ink transition hover:border-brand hover:text-brand"
        >
          See deals
        </Link>
      </div>
      <nav aria-label="Popular categories" className="mt-8 w-full">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((tile) => (
            <li key={tile.href}>
              <Link
                href={tile.href}
                className="block rounded-[2px] border border-border bg-paper px-3 py-4 text-[13px] font-bold text-ink transition hover:border-brand hover:text-brand"
              >
                {tile.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
