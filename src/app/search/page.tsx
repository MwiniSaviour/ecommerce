import type { Metadata } from "next";
import Link from "next/link";
import { products, type Product } from "@/lib/products";
import { CatalogSearchSync } from "@/components/catalog-search-sync";
import { CatalogListing } from "@/components/catalog-listing";
import { CatalogEmptyState } from "@/components/catalog-empty-state";
import { CatalogCategoryTiles } from "@/components/catalog-category-tiles";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : Array.isArray(q) ? q[0] : undefined;
  const trimmed = query?.trim();
  return { title: trimmed ? `${trimmed} — Kora Market` : "Search — Kora Market" };
}

function searchProducts(term: string): Product[] {
  const query = term.trim().toLowerCase();
  if (!query) return [];
  return products.filter((product) =>
    [product.name, product.brand, product.category, product.description].some((field) =>
      field.toLowerCase().includes(query),
    ),
  );
}

const trendingSeeds = ["headphones", "smartphone", "coffee maker", "tote", "skincare"];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const rawQuery = typeof q === "string" ? q : Array.isArray(q) ? (q[0] ?? "") : "";
  const query = rawQuery.trim();
  const results = searchProducts(query);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
      <CatalogSearchSync term={query} />
      {query ? (
        <>
          <h1 className="text-lg font-bold text-ink sm:text-xl">
            Results for &ldquo;{query}&rdquo;
          </h1>
          <div className="mt-4">
            {results.length === 0 ? (
              <>
                <CatalogEmptyState
                  heading={`Nothing matched "${query}"`}
                  message="Try a shorter word, check the spelling, or browse other categories below."
                />
                <CatalogCategoryTiles className="mt-8" />
              </>
            ) : (
              <CatalogListing items={results} />
            )}
          </div>
        </>
      ) : (
        <>
          <h1 className="text-lg font-bold text-ink sm:text-xl">Search Kora Market</h1>
          <p className="mt-1 text-[13px] text-muted">Popular searches right now</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {trendingSeeds.map((seed) => (
              <li key={seed}>
                <Link
                  href={`/search?q=${encodeURIComponent(seed)}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-border bg-paper px-3.5 text-[12px] font-medium text-ink transition hover:border-brand hover:text-brand"
                >
                  {seed}
                </Link>
              </li>
            ))}
          </ul>
          <CatalogCategoryTiles className="mt-8" />
        </>
      )}
    </div>
  );
}
