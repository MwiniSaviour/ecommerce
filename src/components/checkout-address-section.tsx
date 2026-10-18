"use client";

type AddressValues = {
  fullname: string;
  region: string;
  city: string;
  street: string;
  saveAddress: boolean;
};

const GHANA_REGIONS = [
  "Ashanti",
  "Bono",
  "Central",
  "Eastern",
  "Greater Accra",
  "Northern",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
];

export function CheckoutAddressSection({
  values,
  errors,
  onChange,
}: {
  values: AddressValues;
  errors: Record<string, string>;
  onChange: (patch: Partial<AddressValues>) => void;
}) {
  return (
    <section aria-labelledby="checkout-address-heading" className="rounded-sm border border-border bg-paper p-4">
      <h2 id="checkout-address-heading" className="text-base font-bold text-ink">
        2. Delivery address
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="checkout-fullname" className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Full name
          </label>
          <input
            id="checkout-fullname"
            autoComplete="name"
            className="mt-1 h-10 w-full rounded-sm border border-border bg-white px-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            placeholder="Ama Serwaa"
            value={values.fullname}
            onChange={(event) => onChange({ fullname: event.target.value })}
          />
          {errors.fullname ? (
            <p className="mt-1 text-[11px] font-medium text-[#e61601]">{errors.fullname}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="checkout-region" className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Region
          </label>
          <select
            id="checkout-region"
            autoComplete="address-level1"
            className="mt-1 h-10 w-full rounded-sm border border-border bg-white px-3 text-sm text-ink focus:border-brand focus:outline-none"
            value={values.region}
            onChange={(event) => onChange({ region: event.target.value })}
          >
            <option value="">Select a region</option>
            {GHANA_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          {errors.region ? (
            <p className="mt-1 text-[11px] font-medium text-[#e61601]">{errors.region}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="checkout-city" className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            City
          </label>
          <input
            id="checkout-city"
            autoComplete="address-level2"
            className="mt-1 h-10 w-full rounded-sm border border-border bg-white px-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            placeholder="Accra"
            value={values.city}
            onChange={(event) => onChange({ city: event.target.value })}
          />
          {errors.city ? (
            <p className="mt-1 text-[11px] font-medium text-[#e61601]">{errors.city}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="checkout-street" className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Street
          </label>
          <input
            id="checkout-street"
            autoComplete="street-address"
            className="mt-1 h-10 w-full rounded-sm border border-border bg-white px-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
            placeholder="12 Independence Ave"
            value={values.street}
            onChange={(event) => onChange({ street: event.target.value })}
          />
          {errors.street ? (
            <p className="mt-1 text-[11px] font-medium text-[#e61601]">{errors.street}</p>
          ) : null}
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 text-[13px] text-forest-light">
        <input
          type="checkbox"
          className="h-4 w-4 accent-brand"
          checked={values.saveAddress}
          onChange={(event) => onChange({ saveAddress: event.target.checked })}
        />
        Save this address to my account
      </label>
    </section>
  );
}

export type { AddressValues };
