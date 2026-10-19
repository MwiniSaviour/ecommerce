"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ChevronRight } from "lucide-react";
import {
  cartHasExpressDelivery,
  shipmentFeeForItems,
  STANDARD_SHIPMENT_FEE,
} from "@/components/cart-fees";
import { CheckoutContactSection, type ContactValues } from "@/components/checkout-contact-section";
import { CheckoutAddressSection, type AddressValues } from "@/components/checkout-address-section";
import { CheckoutDeliverySection } from "@/components/checkout-delivery-section";
import { CheckoutPaymentSection } from "@/components/checkout-payment-section";
import { CheckoutOrderSummary } from "@/components/checkout-order-summary";
import { useStorefront } from "@/components/storefront-provider";
import { formatPrice } from "@/lib/format";
import { getProductById } from "@/lib/products";
import { ordersApi } from "@/lib/api";

export type DeliveryMethod = "delivery" | "pickup";
export type PaymentMethod = "pod" | "momo" | "card";

export type StoredOrderLine = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type StoredOrder = {
  id: string;
  placedAt: string;
  contact: { email: string; phone: string };
  deliveryMethod: DeliveryMethod;
  address: AddressValues | null;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shipmentFee: number;
  total: number;
  items: StoredOrderLine[];
};

export const ORDERS_KEY = "kora-market-orders-v1";

const emailPattern = /^\S+@\S+\.\S+$/;

export function CheckoutView() {
  const { cartItems, cartSubtotal, clearCart } = useStorefront();
  const router = useRouter();

  const [contact, setContact] = useState<ContactValues>({ email: "", phone: "" });
  const [address, setAddress] = useState<AddressValues>({
    fullname: "",
    region: "",
    city: "",
    street: "",
    saveAddress: false,
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const lines = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = getProductById(item.id);
          return product ? { product, quantity: item.quantity } : null;
        })
        .filter((entry): entry is { product: NonNullable<ReturnType<typeof getProductById>>; quantity: number } =>
          entry !== null,
        ),
    [cartItems],
  );

  const hasExpress = useMemo(() => cartHasExpressDelivery(cartItems), [cartItems]);
  const shipmentFee =
    deliveryMethod === "delivery"
      ? hasExpress
        ? Math.min(STANDARD_SHIPMENT_FEE, shipmentFeeForItems(cartItems))
        : STANDARD_SHIPMENT_FEE
      : 0;
  const total = cartSubtotal + shipmentFee;

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-sm border border-border bg-paper p-8 text-center">
          <h1 className="text-lg font-bold text-ink">Your cart is empty</h1>
          <p className="mt-1 text-[13px] text-muted">Add items to your cart before checking out.</p>
          <a
            href="/"
            className="mt-4 inline-flex min-h-12 items-center rounded-sm bg-brand px-5 text-sm font-bold text-white hover:bg-brand-deep"
          >
            Start shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-muted">
        <a href="/" className="hover:text-brand-deep">
          Home
        </a>
        <ChevronRight size={12} aria-hidden="true" />
        <a href="/cart" className="hover:text-brand-deep">
          Cart
        </a>
        <ChevronRight size={12} aria-hidden="true" />
        <span aria-current="page" className="font-semibold text-ink">
          Checkout
        </span>
      </nav>

      <h1 className="mt-4 text-xl font-bold text-ink">Checkout</h1>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const nextErrors: Record<string, string> = {};
            if (!emailPattern.test(contact.email.trim())) {
              nextErrors.email = "Enter a valid email address.";
            }
            const digits = contact.phone.replace(/\D/g, "");
            if (digits.length < 9 || digits.length > 12) {
              nextErrors.phone = "Enter a phone number with 9 to 12 digits.";
            }
            if (deliveryMethod === "delivery") {
              if (address.fullname.trim().length === 0) {
                nextErrors.fullname = "Enter your full name.";
              }
              if (address.region.length === 0) {
                nextErrors.region = "Select a region.";
              }
              if (address.city.trim().length === 0) {
                nextErrors.city = "Enter your city.";
              }
              if (address.street.trim().length === 0) {
                nextErrors.street = "Enter your street address.";
              }
            }
            setErrors(nextErrors);
            if (Object.keys(nextErrors).length > 0) return;

            setSubmitting(true);
            window.setTimeout(() => {
              const order: StoredOrder = {
                id: `KOR-${Date.now().toString(36).toUpperCase()}`,
                placedAt: new Date().toISOString(),
                contact: { email: contact.email.trim(), phone: contact.phone.trim() },
                deliveryMethod,
                address: deliveryMethod === "delivery" ? address : null,
                paymentMethod,
                subtotal: cartSubtotal,
                shipmentFee,
                total,
                items: lines.map(({ product, quantity }) => ({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: product.image,
                  price: product.price,
                  quantity,
                })),
              };
              void ordersApi.addCustomerOrder(order);
              clearCart();
              router.push("/checkout/success");
            }, 1200);
          }}
        >
          <CheckoutContactSection
            values={contact}
            errors={errors}
            onChange={(patch) => setContact((values) => ({ ...values, ...patch }))}
          />
          <CheckoutAddressSection
            values={address}
            errors={errors}
            onChange={(patch) => setAddress((values) => ({ ...values, ...patch }))}
          />
          <CheckoutDeliverySection
            value={deliveryMethod}
            hasExpress={hasExpress}
            onChange={setDeliveryMethod}
          />
          <CheckoutPaymentSection value={paymentMethod} onChange={setPaymentMethod} />

          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-12 w-full items-center justify-center rounded-sm bg-brand text-sm font-bold text-white hover:bg-brand-deep disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Place order — ${formatPrice(total)}`}
          </button>
          {submitting ? (
            <p aria-live="polite" className="text-center text-[11px] text-muted">
              Saving your order and preparing your receipt…
            </p>
          ) : null}
          <p className="flex items-center justify-center gap-2 text-[11px] text-muted">
            <ShieldCheck size={14} aria-hidden="true" className="text-forest" />
            Demo checkout — you will be logged in with the demo account.
          </p>
        </form>
        <aside className="space-y-4">
          <CheckoutOrderSummary
            lines={lines}
            subtotal={cartSubtotal}
            shipmentFee={shipmentFee}
            deliveryMethod={deliveryMethod}
            paymentMethod={paymentMethod}
          />
          <a
            href="/cart"
            className="flex min-h-12 items-center justify-center rounded-sm border border-border bg-paper text-sm font-bold text-ink hover:border-brand hover:text-brand-deep"
          >
            Back to cart
          </a>
        </aside>
      </div>
    </div>
  );
}
