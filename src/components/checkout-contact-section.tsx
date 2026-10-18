"use client";

type ContactValues = { email: string; phone: string };

export function CheckoutContactSection({
  values,
  errors,
  onChange,
}: {
  values: ContactValues;
  errors: Record<string, string>;
  onChange: (patch: Partial<ContactValues>) => void;
}) {
  return (
    <section aria-labelledby="checkout-contact-heading" className="rounded-sm border border-border bg-paper p-4">
      <h2 id="checkout-contact-heading" className="text-base font-bold text-ink">
        1. Contact details
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="checkout-email" className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Email
          </label>
          <input
            id="checkout-email"
            type="email"
            autoComplete="email"
            className="mt-1 h-10 w-full rounded-sm border border-border bg-white px-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            placeholder="you@example.com"
            value={values.email}
            onChange={(event) => onChange({ email: event.target.value })}
          />
          {errors.email ? (
            <p className="mt-1 text-[11px] font-medium text-[#e61601]">{errors.email}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="checkout-phone" className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Phone
          </label>
          <input
            id="checkout-phone"
            type="tel"
            autoComplete="tel"
            className="mt-1 h-10 w-full rounded-sm border border-border bg-white px-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            placeholder="024 000 0000"
            value={values.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
          />
          {errors.phone ? (
            <p className="mt-1 text-[11px] font-medium text-[#e61601]">{errors.phone}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export type { ContactValues };
