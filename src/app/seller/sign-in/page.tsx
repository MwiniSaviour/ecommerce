"use client";

// DESIGN DIRECTION: Aries & Co. Phones sign-in — inspired by Jumia seller
// hub's centered credential card; not Jumia-verified. Demo credentials are
// placeholders (aries@koravendorhub.com / KoraDemo2026).

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { SELLER_DEMO_ACCOUNT, setSellerSession } from "@/lib/seller-auth";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function SellerSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSellerSession({
      name: "Aries Mensah",
      email,
      business: "Aries & Co. Phones",
      since: new Date().toISOString(),
    });
    router.replace("/seller/dashboard");
  };

  const fillDemo = () => {
    setEmail(SELLER_DEMO_ACCOUNT.email);
    setPassword(SELLER_DEMO_ACCOUNT.password);
    setErrors({});
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-muted hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Kora Market
        </Link>
        <div className="rounded-[14px] bg-paper p-6 shadow-sm">
          <span className="flex size-10 items-center justify-center rounded-[14px] bg-brand text-[15px] font-bold text-white">
            K
          </span>
          <h1 className="mt-4 text-[18px] font-bold text-ink">Kora Vendor Hub</h1>
          <p className="mt-1 text-[13px] text-muted">
            Sign in to manage your Kora Market storefront.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4" noValidate>
            <div>
              <label htmlFor="seller-sign-in-email" className="text-[12px] font-bold text-ink">
                Email
              </label>
              <input
                id="seller-sign-in-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@business.com"
                className="mt-1 min-h-12 w-full rounded-[14px] border border-border bg-cream px-3 text-[14px] text-ink outline-none transition-colors focus:border-brand"
                data-testid="seller-sign-in-email"
              />
              {errors.email && (
                <p className="mt-1 text-[12px] font-medium text-[#e61601]">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="seller-sign-in-password" className="text-[12px] font-bold text-ink">
                Password
              </label>
              <input
                id="seller-sign-in-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                className="mt-1 min-h-12 w-full rounded-[14px] border border-border bg-cream px-3 text-[14px] text-ink outline-none transition-colors focus:border-brand"
                data-testid="seller-sign-in-password"
              />
              {errors.password && (
                <p className="mt-1 text-[12px] font-medium text-[#e61601]">{errors.password}</p>
              )}
            </div>
            <label className="flex items-center gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="size-4 accent-[#1e6091]"
                data-testid="seller-sign-in-remember"
              />
              Keep me signed in
            </label>
            <button
              type="submit"
              className="flex min-h-12 items-center justify-center rounded-full bg-brand text-[14px] font-bold text-white transition-colors hover:bg-brand-deep"
              data-testid="seller-sign-in-submit"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={fillDemo}
              className="flex min-h-12 items-center justify-center rounded-full border border-border bg-paper text-[14px] font-bold text-brand transition-colors hover:bg-leaf"
              data-testid="seller-sign-in-demo"
            >
              Use demo account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
