"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/products";

export type PdpGalleryView = {
  id: string;
  label: string;
  objectPosition: string;
  zoomClass: string;
};

export const pdpGalleryViews: PdpGalleryView[] = [
  { id: "front", label: "Front view", objectPosition: "50% 50%", zoomClass: "scale-100" },
  { id: "top", label: "Top angle", objectPosition: "22% 18%", zoomClass: "scale-[1.35]" },
  { id: "detail", label: "Detail close-up", objectPosition: "80% 72%", zoomClass: "scale-[1.35]" },
];

export function PdpGallery({ product }: { product: Product }) {
  const [activeView, setActiveView] = useState(pdpGalleryViews[0]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-sand sm:rounded-lg">
        <Image
          src={product.image}
          alt={`${product.name} — ${activeView.label}`}
          fill
          sizes="(max-width: 1024px) 100vw, 42vw"
          priority
          className={`object-cover transition-transform duration-300 ${activeView.zoomClass}`}
          style={{ objectPosition: activeView.objectPosition }}
        />
      </div>
      <div role="group" aria-label="Product image views" className="flex gap-2">
        {pdpGalleryViews.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => setActiveView(view)}
            aria-pressed={activeView.id === view.id}
            aria-label={view.label}
            className={`relative aspect-square w-14 overflow-hidden rounded-[4px] border-2 transition ${
              activeView.id === view.id ? "border-brand" : "border-border hover:border-brand/60"
            }`}
          >
            <Image
              src={product.image}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
              style={{ objectPosition: view.objectPosition }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
