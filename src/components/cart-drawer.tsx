"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStorefront } from "@/components/storefront-provider";
import { getProductById } from "@/lib/products";
import { formatPrice } from "@/lib/format";

const FREE_DELIVERY_THRESHOLD = 350;

type DeliveryMethod = "doorstep" | "pickup";
type PaymentMethod = "mobile-money" | "pay-on-delivery";

export function CartDrawer() {
  const {
    isCartOpen,
    setCartOpen,
    cartItems,
    cartCount,
    cartSubtotal,
    updateCartItem,
    removeFromCart,
    showToast,
  } = useStorefront();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("doorstep");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mobile-money");

  useEffect(() => {
    if (!isCartOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCheckoutMode(false);
        setCartOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, setCartOpen]);

  if (!isCartOpen) return null;

  const deliveryProgress = Math.min(100, (cartSubtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - cartSubtotal);

  function placeSampleOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    cartItems.forEach((item) => removeFromCart(item.id));
    setCheckoutMode(false);
    setCartOpen(false);
    showToast("Your sample order is in — no payment was taken");
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-end" role="presentation">
      <button
        type="button"
        aria-label="Close shopping bag"
        className="drawer-backdrop absolute inset-0 cursor-default bg-ink/45 backdrop-blur-[2px]"
        onClick={() => { setCheckoutMode(false); setCartOpen(false); }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="drawer-panel relative z-[1] flex h-full w-full max-w-[480px] flex-col bg-paper shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-border px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-7">
          <div>
            {checkoutMode && (
              <button type="button" onClick={() => setCheckoutMode(false)} className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-ink">
                <ArrowLeft aria-hidden="true" size={14} /> Back to bag
              </button>
            )}
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-brand">A good choice</p>
            <h2 id="cart-title" className="mt-1 font-display text-[29px] leading-tight tracking-[-0.035em] text-ink sm:text-[32px]">
              {checkoutMode ? "Checkout preview" : "Your shopping bag"}
            </h2>
            {!checkoutMode && <p className="mt-1.5 text-xs text-muted">{cartCount} {cartCount === 1 ? "thoughtful find" : "thoughtful finds"} in your bag</p>}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close shopping bag"
            onClick={() => { setCheckoutMode(false); setCartOpen(false); }}
            className="flex size-10 items-center justify-center rounded-full border border-border text-muted transition hover:bg-cream hover:text-ink"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        {checkoutMode ? (
          <form onSubmit={placeSampleOrder} className="flex min-h-0 flex-1 flex-col">
            <div className="hide-scrollbar flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ink">Delivery address</h3>
                  <span className="rounded-full bg-[#eaf0e1] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-forest">Sample</span>
                </div>
                <div className="flex items-start gap-3 rounded-[18px] border border-forest/20 bg-[#f2f4ec] p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-forest"><Check aria-hidden="true" size={17} /></span>
                  <div>
                    <p className="text-sm font-bold text-ink">Accra, Greater Accra</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">Ghana · Add a street address after signing in</p>
                  </div>
                </div>
              </div>

              <fieldset>
                <legend className="mb-3 text-sm font-bold text-ink">How should it get to you?</legend>
                <div className="space-y-2">
                  <label className={`flex cursor-pointer items-center gap-3 rounded-[17px] border p-3.5 transition ${deliveryMethod === "doorstep" ? "border-forest/35 bg-[#f2f4ec]" : "border-border hover:bg-cream"}`}>
                    <input type="radio" name="delivery" value="doorstep" checked={deliveryMethod === "doorstep"} onChange={() => setDeliveryMethod("doorstep")} className="accent-[#193d32]" />
                    <span className="flex-1"><span className="block text-xs font-bold text-ink">Doorstep delivery</span><span className="mt-1 block text-[10px] text-muted">We’ll show your estimate before you place the order</span></span>
                  </label>
                  <label className={`flex cursor-pointer items-center gap-3 rounded-[17px] border p-3.5 transition ${deliveryMethod === "pickup" ? "border-forest/35 bg-[#f2f4ec]" : "border-border hover:bg-cream"}`}>
                    <input type="radio" name="delivery" value="pickup" checked={deliveryMethod === "pickup"} onChange={() => setDeliveryMethod("pickup")} className="accent-[#193d32]" />
                    <span className="flex-1"><span className="block text-xs font-bold text-ink">Pick-up point</span><span className="mt-1 block text-[10px] text-muted">Choose a convenient collection point at checkout</span></span>
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-sm font-bold text-ink">Choose how you’ll pay</legend>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`cursor-pointer rounded-[17px] border p-3.5 transition ${paymentMethod === "mobile-money" ? "border-forest/35 bg-[#f2f4ec]" : "border-border hover:bg-cream"}`}>
                    <input type="radio" name="payment" value="mobile-money" checked={paymentMethod === "mobile-money"} onChange={() => setPaymentMethod("mobile-money")} className="accent-[#193d32]" />
                    <span className="mt-2 block text-xs font-bold text-ink">Mobile Money</span>
                    <span className="mt-1 block text-[10px] leading-relaxed text-muted">Pay securely on your phone</span>
                  </label>
                  <label className={`cursor-pointer rounded-[17px] border p-3.5 transition ${paymentMethod === "pay-on-delivery" ? "border-forest/35 bg-[#f2f4ec]" : "border-border hover:bg-cream"}`}>
                    <input type="radio" name="payment" value="pay-on-delivery" checked={paymentMethod === "pay-on-delivery"} onChange={() => setPaymentMethod("pay-on-delivery")} className="accent-[#193d32]" />
                    <span className="mt-2 block text-xs font-bold text-ink">Pay on delivery</span>
                    <span className="mt-1 block text-[10px] leading-relaxed text-muted">Payment at your door</span>
                  </label>
                </div>
              </fieldset>

              <div className="rounded-[18px] bg-[#f7f5ef] p-4">
                <div className="flex items-center justify-between text-xs text-muted"><span>Items ({cartCount})</span><span className="font-semibold text-ink">{formatPrice(cartSubtotal)}</span></div>
                <p className="mt-2 text-[10px] leading-relaxed text-muted">Delivery and any applicable fees are estimates for this demo and would be confirmed before a real order.</p>
              </div>
            </div>
            <div className="border-t border-border bg-paper px-5 pb-5 pt-4 sm:px-7 sm:pb-7">
              <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white transition hover:bg-brand-deep">
                Place sample order <span className="text-white/60">·</span> {formatPrice(cartSubtotal)} <ArrowRight aria-hidden="true" size={16} />
              </button>
              <p className="mt-2 text-center text-[10px] text-muted">Preview only · no payment or delivery will be initiated</p>
            </div>
          </form>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex size-[76px] items-center justify-center rounded-[26px] bg-[#edf1e9] text-forest"><ShoppingBag aria-hidden="true" size={29} strokeWidth={1.5} /></span>
            <h3 className="mt-5 font-display text-[27px] tracking-[-0.035em] text-ink">Your bag has room for good things.</h3>
            <p className="mt-2 max-w-[270px] text-sm leading-relaxed text-muted">Start with one thoughtful find. We’ll keep it right here while you look around.</p>
            <button type="button" onClick={() => setCartOpen(false)} className="mt-6 flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-xs font-bold text-white transition hover:bg-forest-light">
              Keep browsing <ArrowRight aria-hidden="true" size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-5 py-4 sm:px-7">
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <p className="font-semibold text-ink">
                  {amountToFreeDelivery > 0 ? <>Add <span className="text-brand">{formatPrice(amountToFreeDelivery)}</span> for complimentary delivery</> : <span className="text-forest">Lovely — you’ve unlocked complimentary delivery</span>}
                </p>
                <span className="shrink-0 text-muted">{Math.round(deliveryProgress)}%</span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#e7e9e1]">
                <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${deliveryProgress}%` }} />
              </div>
            </div>

            <div className="hide-scrollbar flex-1 space-y-3 overflow-y-auto px-5 py-4 sm:px-7 sm:py-5">
              {cartItems.map((item) => {
                const product = getProductById(item.id);
                if (!product) return null;
                return (
                  <article key={item.id} className="flex gap-3 rounded-[20px] border border-border/80 bg-white p-2.5">
                    <div className="relative size-[84px] shrink-0 overflow-hidden rounded-[15px] bg-[#f1f0eb]">
                      <Image src={product.image} alt={product.alt} fill sizes="84px" className="object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col py-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[9px] font-bold uppercase tracking-[0.13em] text-muted">{product.brand}</p>
                          <h3 className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-ink">{product.name}</h3>
                        </div>
                        <button type="button" aria-label={`Remove ${product.name} from bag`} onClick={() => removeFromCart(item.id)} className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-[#f9eae5] hover:text-brand"><Trash2 aria-hidden="true" size={14} /></button>
                      </div>
                      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                        <div className="flex h-7 items-center rounded-full border border-border">
                          <button type="button" aria-label={`Decrease quantity of ${product.name}`} onClick={() => updateCartItem(item.id, item.quantity - 1)} className="flex size-7 items-center justify-center text-muted transition hover:text-ink"><Minus aria-hidden="true" size={12} /></button>
                          <span aria-live="polite" className="min-w-5 text-center text-[10px] font-bold text-ink">{item.quantity}</span>
                          <button type="button" aria-label={`Increase quantity of ${product.name}`} onClick={() => updateCartItem(item.id, item.quantity + 1)} className="flex size-7 items-center justify-center text-muted transition hover:text-ink"><Plus aria-hidden="true" size={12} /></button>
                        </div>
                        <span className="text-xs font-extrabold text-ink">{formatPrice(product.price * item.quantity)}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
              <button type="button" onClick={() => setCartOpen(false)} className="flex items-center gap-1.5 px-1 py-2 text-[11px] font-semibold text-muted transition hover:text-brand"><ArrowLeft aria-hidden="true" size={14} /> Keep looking around</button>
            </div>

            <div className="border-t border-border bg-paper px-5 pb-5 pt-4 sm:px-7 sm:pb-7">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-ink">Subtotal</span>
                <span className="text-base font-extrabold tracking-[-0.03em] text-ink">{formatPrice(cartSubtotal)}</span>
              </div>
              <p className="mb-4 text-[10px] leading-relaxed text-muted">Delivery, if any, is calculated once you choose how you’d like it sent.</p>
              <button type="button" onClick={() => setCheckoutMode(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white transition hover:bg-brand-deep">
                Continue to checkout <ArrowRight aria-hidden="true" size={16} />
              </button>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted"><Check aria-hidden="true" size={12} className="text-forest" /> Secure checkout preview</div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
