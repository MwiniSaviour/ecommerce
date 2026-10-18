import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Cart — Kora Market",
  description: "Review your cart, adjust quantities, and continue to checkout.",
};

export default function CartPage() {
  return <CartView />;
}
