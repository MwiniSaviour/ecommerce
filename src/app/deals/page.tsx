import Link from "next/link";
import { Clock, Percent, Truck, Zap } from "lucide-react";
import { discountedProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { DealsFilteredGrid } from "@/components/deals-filtered-grid";

const perks = [
  { icon: Zap, text: "Best markdowns of the week, refreshed every Monday" },
  { icon: Percent, text: "Verified savings — the old price is listed before the discount" },
  { icon: Truck, text: "Same delivery promise across Ghana Express routes" },
  { icon: Clock, text: "Deal prices apply while listed stock lasts, no timers" },
];

export const metadata = {
  title: "Flash Sales — Kora Market",
  description: "Limited-time deals across tech, home, fashion and beauty with clear before-and-after pricing.",
};

export default function DealsPage() {
  const deals = discountedProducts();

  return (
    <div className="pb-10">
      <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-[1440px] px-4 pt-4 sm:px-6">
        <ol className="flex items-center gap-1.5 text-[12px] text-muted">
          <li>
            <Link href="/" className="hover:text-brand">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">Deals</li>
        </ol>
      </nav>

      <header className="mx-auto mt-5 w-full max-w-[1440px] px-4 sm:px-6">
        <div className="rounded-[2px] border border-border bg-paper p-5 sm:p-7">
          <span className="inline-flex items-center rounded-full bg-[#f8e8e2] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#a54f38]">
            Limited-time deals
          </span>
          <h1 className="mt-3 max-w-xl text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink sm:text-[28px]">
            Prices that stayed down, so you don&apos;t have to wait for a better day.
          </h1>
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted">
            Every pick below is marked below its recent price in hand-picked ways. Grab what makes sense now —
            stock moves quickly on the lower prices.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {perks.map((perk) => (
              <li key={perk.text} className="flex items-start gap-2 text-[12px] text-ink">
                <perk.icon aria-hidden="true" size={16} strokeWidth={1.9} className="mt-0.5 shrink-0 text-brand" />
                {perk.text}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <section className="mx-auto mt-7 w-full max-w-[1440px] px-4 sm:px-6" aria-labelledby="deals-row-heading">
        <h2 id="deals-row-heading" className="mb-3 text-[16px] font-bold text-ink">Lowest markdowns, picked in store</h2>
        {deals.length === 0 ? (
          <p className="rounded-[2px] border border-border bg-paper px-4 py-6 text-[13px] text-muted">
            No marked-down items on the shelf right now — back soon with fresh savings.
          </p>
        ) : (
          <ul className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {deals.map((product) => (
              <li key={product.id} className="w-[160px] shrink-0 sm:w-[188px]">
                <div className="product-image h-full">
                  <ProductCard product={product} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8">
        <DealsFilteredGrid deals={deals} />
      </div>
    </div>
  );
}
