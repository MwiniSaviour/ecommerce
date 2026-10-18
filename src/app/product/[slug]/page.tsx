import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, products, type Product } from "@/lib/products";
import { categoryBySlug, productCategoryToSlug } from "@/lib/categories";
import { CatalogBreadcrumbs } from "@/components/catalog-breadcrumbs";
import { PdpGallery } from "@/components/pdp-gallery";
import { PdpBuyBox } from "@/components/pdp-buy-box";
import { PdpDeliveryReturns, PdpDescription } from "@/components/pdp-info-blocks";
import { ProductCard } from "@/components/product-card";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product — Kora Market" };
  return { title: `${product.name} — Kora Market` };
}

function similarItems(product: Product): Product[] {
  return products.filter((candidate) => candidate.category === product.category && candidate.slug !== product.slug);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const categorySlug = productCategoryToSlug(product.category);
  const category = categoryBySlug(categorySlug);
  const similar = similarItems(product);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
      <CatalogBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: category ? category.label : "Shop", href: `/category/${categorySlug}` },
          { label: product.name },
        ]}
      />
      <div className="mt-4 grid gap-6 lg:grid-cols-[42%_1fr] lg:gap-8">
        <PdpGallery product={product} />
        <div className="flex flex-col gap-5">
          <div className="rounded-md border border-border bg-paper p-4 sm:p-5">
            <PdpBuyBox product={product} />
          </div>
          <PdpDescription product={product} />
          <PdpDeliveryReturns product={product} />
        </div>
      </div>
      {similar.length > 0 && (
        <section aria-label="Similar items" className="mt-8">
          <h2 className="w-fit border-b-2 border-brand pb-1 text-[15px] font-bold text-ink sm:text-lg">Similar items</h2>
          <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-2 sm:gap-3">
            {similar.map((candidate) => (
              <li
                key={candidate.slug}
                className="w-[46%] min-w-[168px] shrink-0 sm:w-[31%] lg:w-[23%]"
              >
                <ProductCard product={candidate} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
