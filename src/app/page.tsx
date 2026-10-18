import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HomeHero } from "@/components/home-hero";
import { CategoryRail } from "@/components/category-rail";
import { ProductCard } from "@/components/product-card";
import { ServicesBanner } from "@/components/services-banner";
import { discountedProducts, products } from "@/lib/products";

export default function HomePage() {
  const deals = discountedProducts();
  return (
    <div className="mx-auto max-w-[1440px] px-3 pb-16 pt-3 sm:px-4 sm:pb-20 sm:pt-4 xl:px-6">
      <HomeHero />

      <section aria-labelledby="flash-sales-title" className="mt-5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 id="flash-sales-title" className="text-[15px] font-bold text-ink sm:text-lg">Flash Sales</h2>
            <span className="rounded-full bg-[#ff550c] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Limited time</span>
          </div>
          <Link href="/deals" className="flex items-center gap-0.5 text-[12px] font-medium text-brand hover:underline">
            See all <ChevronRight aria-hidden="true" size={14} />
          </Link>
        </div>
        <ul className="hide-scrollbar flex snap-x gap-2.5 overflow-x-auto pb-1">
          {deals.map((product) => (
            <li key={product.id} className="w-[46%] min-w-[168px] shrink-0 snap-start sm:w-[30%] lg:w-[23%]">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 sm:mt-10">
        <CategoryRail />
      </div>

      <section aria-labelledby="recommended-title" className="mt-8 sm:mt-10">
        <h2 id="recommended-title" className="mb-2.5 text-[15px] font-bold text-ink sm:text-lg">Recommended for you</h2>
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>

      <ServicesBanner />
    </div>
  );
}
