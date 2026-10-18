import type { Product } from "@/lib/products";

export function PdpDeliveryReturns({ product }: { product: Product }) {
  return (
    <section aria-label="Delivery and returns" className="rounded-md border border-border bg-paper p-4">
      <h2 className="text-[14px] font-bold text-ink">Delivery & returns</h2>
      <ul className="mt-2.5 space-y-2 text-[12px] leading-relaxed text-muted">
        <li>Home delivery across Ghana. Delivery fees depend on your location.</li>
        <li>
          {product.delivery?.express
            ? "Express delivery unlocks next-day delivery in Accra and Tema."
            : "Standard delivery usually takes 2 to 5 working days."}
        </li>
        <li>Return any unused item within 7 days of delivery for a replacement or refund.</li>
      </ul>
    </section>
  );
}

export function PdpDescription({ product }: { product: Product }) {
  return (
    <section aria-label="Product description" className="rounded-md border border-border bg-paper p-4">
      <h2 className="text-[14px] font-bold text-ink">Product details</h2>
      <p className="mt-2 text-[12px] leading-relaxed text-muted sm:text-[13px]">{product.description}</p>
    </section>
  );
}
