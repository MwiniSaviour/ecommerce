"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useStorefront } from "@/components/storefront-provider";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";

export default function SavedItemsPage() {
  const { wishlistIds } = useStorefront();
  const saved = products.filter((product) => wishlistIds.includes(product.id));

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-[12px] text-muted">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-brand">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/account" className="hover:text-brand">Account</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">Saved items</li>
        </ol>
      </nav>
      <header>
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-ink">Saved items</h1>
        <p className="mt-1 text-[13px] text-muted">The picks you hearted on this device. Unheart any time to remove them.</p>
      </header>

      <section className="mt-6" data-testid="saved-list">
        {saved.length === 0 ? (
          <div className="rounded-[2px] border border-border bg-paper px-4 py-10 text-center">
            <Heart aria-hidden="true" size={26} strokeWidth={1.6} className="mx-auto text-brand" />
            <p className="mt-3 text-[14px] font-bold text-ink">Nothing saved yet</p>
            <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted">
              Tap the heart on any product tile and it will wait for you right here, even after a page refresh.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex min-h-10 items-center rounded-[4px] bg-brand px-5 text-[13px] font-bold text-white transition hover:bg-brand-deep"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label={`${saved.length} saved products`}>
            {saved.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
