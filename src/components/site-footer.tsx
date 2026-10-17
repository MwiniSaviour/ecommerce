"use client";

import Link from "next/link";
import { ArrowRight, AtSign, Mail, MapPin, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useStorefront } from "@/components/storefront-provider";

const footerLinks = [
  { heading: "Explore", links: ["Phones & tech", "Home & living", "Fashion", "Beauty"] },
  { heading: "Here to help", links: ["Delivery information", "Returns & refunds", "Payment options", "Contact us"] },
  { heading: "Kora & community", links: ["Our story", "Sell with Kora", "The Kora edit", "Careers"] },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showToast } = useStorefront();

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setIsSubscribed(true);
    setEmail("");
    showToast("You’re on the list — look out for good things");
  }

  function handleLink(label: string) {
    if (label === "Phones & tech" || label === "Home & living" || label === "Fashion" || label === "Beauty") {
      document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    showToast(`${label} information will live here when Kora launches`);
  }

  return (
    <footer className="mt-2 bg-forest text-white">
      <div className="border-b border-white/10 bg-[#e8e8da] text-ink">
        <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-7 sm:px-6 sm:py-8 md:grid-cols-[1fr_1.1fr] md:items-center xl:px-8">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-brand">A good thing, now and then</p>
            <h2 className="mt-2 font-display text-[25px] leading-tight tracking-[-0.035em] sm:text-[29px]">A little good in your inbox.</h2>
            <p className="mt-1.5 text-xs text-muted">Fresh finds, thoughtful edits and the occasional lovely offer.</p>
          </div>
          <form onSubmit={submitNewsletter} className="flex flex-col gap-2 sm:flex-row sm:items-center" aria-label="Join the Kora newsletter">
            <label htmlFor="newsletter-email" className="sr-only">Your email address</label>
            <div className="flex min-h-12 flex-1 items-center gap-2 rounded-full border border-forest/10 bg-white px-4 focus-within:border-forest/40 focus-within:ring-4 focus-within:ring-forest/5">
              <Mail aria-hidden="true" size={16} className="shrink-0 text-muted" />
              <input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" className="min-w-0 flex-1 border-0 bg-transparent text-xs text-ink outline-none placeholder:text-muted/80 focus:outline-none focus:ring-0" />
            </div>
            <button type="submit" disabled={isSubscribed} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest px-5 text-xs font-bold text-white transition hover:bg-forest-light disabled:cursor-default disabled:bg-forest-light">
              {isSubscribed ? "You’re on the list" : "Count me in"} <ArrowRight aria-hidden="true" size={15} />
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-9 sm:px-6 sm:pb-12 sm:pt-12 xl:px-8">
        <div className="grid gap-9 sm:grid-cols-[1.35fr_2fr] lg:grid-cols-[1.35fr_2fr_0.75fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Kora Market home">
              <span className="flex size-10 items-center justify-center rounded-[14px] bg-brand text-white"><Sparkles aria-hidden="true" size={20} /></span>
              <span className="text-[27px] font-black tracking-[-0.08em] text-white">kora<span className="text-[#eeb69e]">.</span></span>
            </Link>
            <p className="mt-4 max-w-[260px] text-xs leading-[1.8] text-white/60">Good finds, well found. A calmer way to shop the things that make everyday life feel more you.</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-white/60"><MapPin aria-hidden="true" size={13} className="text-[#d9e5bd]" />Made for Ghana, with care.</div>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 sm:gap-x-4">
            {footerLinks.map((group) => (
              <div key={group.heading}>
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#d9e5bd]">{group.heading}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((label) => (
                    <li key={label}><button type="button" onClick={() => handleLink(label)} className="text-left text-[11px] text-white/65 transition hover:text-white">{label}</button></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:justify-self-end">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#d9e5bd]">Find us around</p>
            <div className="mt-4 flex items-center gap-2">
              <button type="button" aria-label="Kora on Instagram" onClick={() => showToast("Kora social links will be added at launch")} className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white/40 hover:text-white"><AtSign aria-hidden="true" size={15} /></button>
              <button type="button" aria-label="Email Kora" onClick={() => showToast("Kora support details will be available at launch")} className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white/40 hover:text-white"><Mail aria-hidden="true" size={15} /></button>
            </div>
            <p className="mt-4 text-[10px] text-white/50">A better everyday, one good find at a time.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-[10px] text-white/45 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Kora Market. Made for the everyday.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <button type="button" onClick={() => showToast("Privacy information will be published before launch")} className="transition hover:text-white/80">Privacy</button>
            <button type="button" onClick={() => showToast("Terms will be published before launch")} className="transition hover:text-white/80">Terms</button>
            <span>Ghana · GH₵</span>
          </div>
        </div>
        <p className="mt-3 text-[9px] leading-relaxed text-white/30">Storefront preview · Product, review, offer and checkout details are sample content.</p>
      </div>
    </footer>
  );
}
