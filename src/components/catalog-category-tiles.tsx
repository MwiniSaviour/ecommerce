import Link from "next/link";
import { categories } from "@/lib/categories";

type CatalogCategoryTilesProps = {
  excludeSlug?: string;
  heading?: string;
  className?: string;
};

export function CatalogCategoryTiles({ excludeSlug, heading = "Other categories", className }: CatalogCategoryTilesProps) {
  const tiles = categories.filter((category) => category.slug !== excludeSlug);

  return (
    <section aria-label={heading} className={className}>
      <h2 className="w-fit border-b-2 border-brand pb-1 text-[15px] font-bold text-ink sm:text-lg">{heading}</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((category) => {
          const Icon = category.icon;
          return (
            <li key={category.slug}>
              <Link
                href={`/category/${category.slug}`}
                className="flex items-center gap-2.5 rounded-[4px] border border-border bg-paper px-3 py-2.5 transition hover:border-brand/60 hover:bg-sand"
              >
                <Icon aria-hidden="true" size={18} strokeWidth={1.75} className="shrink-0 text-brand" />
                <span className="text-[12px] font-medium text-ink">{category.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
