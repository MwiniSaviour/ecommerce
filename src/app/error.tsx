"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6" aria-live="polite">
      <AlertTriangle aria-hidden="true" size={36} strokeWidth={1.5} className="text-[#e61601]" />
      <h1 className="mt-4 text-[24px] font-bold tracking-[-0.02em] text-ink sm:text-[28px]">Something snagged on our side</h1>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
        The page failed to build this time — usually a network hiccup. Try again; your cart is stored separately and is safe.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-10 items-center rounded-[4px] bg-brand px-5 text-[13px] font-bold text-white transition hover:bg-brand-deep"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex min-h-10 items-center rounded-[4px] border border-border bg-paper px-5 text-[13px] font-bold text-ink transition hover:border-brand hover:text-brand"
        >
          Back home
        </a>
      </div>
      {process.env.NODE_ENV === "development" && error.message.length > 0 && (
        <p className="mt-6 text-[11px] text-muted">{error.message}</p>
      )}
    </div>
  );
}
