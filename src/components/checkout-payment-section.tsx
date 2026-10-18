"use client";

import { Banknote, CreditCard, Smartphone } from "lucide-react";
import type { PaymentMethod } from "@/components/checkout-view";

const options: {
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
  note: string;
}[] = [
  { value: "pod", label: "Pay on delivery", icon: Banknote, note: "Cash when your order arrives" },
  { value: "momo", label: "Mobile money", icon: Smartphone, note: "Pay with MOMO at confirmation" },
  { value: "card", label: "Card", icon: CreditCard, note: "Visa or Mastercard" },
];

export function CheckoutPaymentSection({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}) {
  return (
    <section aria-labelledby="checkout-payment-heading" className="rounded-sm border border-border bg-paper p-4">
      <h2 id="checkout-payment-heading" className="text-base font-bold text-ink">
        4. Payment method
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {options.map(({ value: optionValue, label, icon: Icon, note }) => (
          <label
            key={optionValue}
            className={`flex cursor-pointer items-start gap-3 rounded-sm border p-3 ${
              value === optionValue ? "border-brand bg-leaf" : "border-border bg-white hover:border-brand/40"
            }`}
          >
            <input
              type="radio"
              name="checkout-payment"
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
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
