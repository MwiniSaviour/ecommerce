import type { Metadata } from "next";
import { CheckoutSuccessView } from "@/components/checkout-success-view";

export const metadata: Metadata = {
  title: "Order confirmed — Kora Market",
  description: "Your order confirmation and delivery details.",
};

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessView />;
}
