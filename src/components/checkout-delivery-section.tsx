"use client";

import { Package, Truck } from "lucide-react";
import type { DeliveryMethod } from "@/components/checkout-view";

const STANDARD_FEE = "GH₵ 25.00";
const EXPRESS_FEE = "GH₵ 20.00";

export function CheckoutDeliverySection({
  value,
  hasExpress,
  onChange,
}: {
  value: DeliveryMethod;
  hasExpress: boolean;
  onChange: (value: DeliveryMethod) => void;
}) {
  const options: {
    value: DeliveryMethod;
    label: string;
    icon: typeof Truck;
    fee: string;
    note: string;
  }[] = [
    {
      value: "delivery",
      label: "Home delivery",
      icon: Truck,
      fee: hasExpress ? `From ${EXPRESS_FEE}` : STANDARD_FEE,
      note: hasExpress
        ? "Standard GH₵ 25 — express GH₵ 20 available for items in your cart"
        : "Standard shipment fee",
    },
    {
      value: "pickup",
      label: "Pickup station",
      icon: Package,
      fee: "Free",
      note: "Collect your order at a nearby pickup station",
    },
  ];

  return (
    <section aria-labelledby="checkout-delivery-heading" className="rounded-sm border border-border bg-paper p-4">
      <h2 id="checkout-delivery-heading" className="text-base font-bold text-ink">
        3. Delivery method
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map(({ value: optionValue, label, icon: Icon, fee, note }) => (
          <label
            key={optionValue}
            className={`flex cursor-pointer items-start gap-3 rounded-sm border p-3 ${
              value === optionValue ? "border-brand bg-leaf" : "border-border bg-white hover:border-brand/40"
            }`}
          >
            <input
              type="radio"
              name="checkout-delivery"
              className="mt-0.5 accent-brand"
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
            />
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Icon size={16} aria-hidden="true" className="text-brand-deep" />
                {label}
              </span>
              <span className="mt-0.5 block text-[11px] text-muted">{note}</span>
              <span className="mt-1 block text-xs font-bold text-ink">{fee}</span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
