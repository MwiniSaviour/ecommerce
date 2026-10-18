import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type CatalogBreadcrumb = {
  label: string;
  href?: string;
};

export function CatalogBreadcrumbs({ items }: { items: CatalogBreadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-[11px] text-muted sm:text-[12px]">
        {items.map((item, index) => (
          <li key={item.href ?? item.label} className="flex items-center gap-1">
            {index > 0 ? (
              <ChevronRight aria-hidden="true" size={13} strokeWidth={1.75} className="shrink-0 text-muted" />
            ) : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-brand hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
