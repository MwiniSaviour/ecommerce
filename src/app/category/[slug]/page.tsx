import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/lib/products";
import { categories, categoryBySlug, productCategoryToSlug, type ShopCategory } from "@/lib/categories";
import { CatalogBreadcrumbs } from "@/components/catalog-breadcrumbs";
import { CatalogListing } from "@/components/catalog-listing";
import { CatalogCategoryTiles } from "@/components/catalog-category-tiles";
import { CatalogEmptyState } from "@/components/catalog-empty-state";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) return { title: "Category — Kora Market" };
  return { title: `${category.label} — Kora Market` };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  const categoryItems = products.filter((product) => productCategoryToSlug(product.category) === slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
      <CatalogBreadcrumbs items={[{ label: "Home", href: "/" }, { label: category.label }]} />
      <div className="mt-4 flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-52 shrink-0 lg:block">
          <h2 className="text-[15px] font-bold text-ink">Categories</h2>
          <ul className="mt-2.5 flex flex-col gap-0.5">
            {categories.map((sideCategory: ShopCategory) => (
              <li key={sideCategory.slug}>
                <Link
                  href={`/category/${sideCategory.slug}`}
                  aria-current={sideCategory.slug === slug ? "true" : undefined}
                  className={`block rounded-[4px] px-2.5 py-2 text-[12px] font-medium transition ${
                    sideCategory.slug === slug ? "bg-leaf text-ink" : "text-muted hover:bg-sand hover:text-ink"
                  }`}
                >
                  {sideCategory.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-ink sm:text-xl">{category.label}</h1>
          {categoryItems.length === 0 ? (
            <div className="mt-4">
              <CatalogEmptyState
                heading={`${category.label} is on the way`}
                message="We are stocking this category right now. Meanwhile, browse the sections below for essentials you may like."
              />
              <CatalogCategoryTiles excludeSlug={slug} className="mt-8" />
            </div>
          ) : (
            <div className="mt-4">
              <CatalogListing items={categoryItems} activeCategory={slug} />
              <CatalogCategoryTiles excludeSlug={slug} className="mt-8" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
