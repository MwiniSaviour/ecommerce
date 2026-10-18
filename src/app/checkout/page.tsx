import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout-view";

export const metadata: Metadata = {
  title: "Checkout — Kora Market",
  description: "Confirm your contact details, delivery method, and payment.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
