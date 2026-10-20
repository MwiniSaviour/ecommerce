"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, Trash2 } from "lucide-react";
import { authApi, type AccountAddress } from "@/lib/api";

const regions = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

// The stored address moved behind the api seam (api-seam migration);
// this page reads and writes through authApi instead of touching the
// kora-market-address-v1 localStorage entry directly.
export default function AddressPage() {
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof AccountAddress, string>>>({});
  const [saved, setSaved] = useState<AccountAddress | null>(null);

  useEffect(() => {
    let active = true;
    void authApi.getAddress().then((address) => {
      if (active) setSaved(address);
    });
    const unsubscribe = authApi.subscribeAddress((address) => {
      if (active) setSaved(address);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const candidate = {
      name: String(data.get("name") ?? "").trim(),
      region: String(data.get("region") ?? "").trim(),
      city: String(data.get("city") ?? "").trim(),
      street: String(data.get("street") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
    };
    const nextErrors: Partial<Record<keyof AccountAddress, string>> = {};
    if (!nextErrors.name && candidate.name.length === 0) nextErrors.name = "Add the name that should appear at the door.";
    if (candidate.region.length === 0) nextErrors.region = "Pick a region so couriers know where to go.";
    if (candidate.city.length === 0) nextErrors.city = "Add the town or city nearest to you.";
    if (candidate.street.length < 4) nextErrors.street = "Include a street or landmark the courier can find.";
    if (!/^\d{9,12}$/.test(candidate.phone.replace(/[ -]/g, ""))) {
      nextErrors.phone = "Use 9–12 digits, e.g. 024 without spaces: 0248912345.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setNotice("");
      return;
    }
    setErrors({});
    void authApi.setAddress(candidate).then(() => {
      setNotice("Delivery address saved — checkout will reuse it.");
    });
  }

  function handleDelete() {
    void authApi.clearAddress().then(() => {
      setNotice("Address removed. Next checkout will ask for it again.");
    });
  }

  const inputClass =
    "w-full rounded-[4px] border border-border bg-sand px-3 py-2 text-[13px] text-ink placeholder:text-muted";
  const labelClass = "mb-1 block text-[12px] font-medium text-ink";
  const errorClass = "mt-1 text-[11px] font-medium text-[#e61601]";

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-7 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-[12px] text-muted">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-brand">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/account" className="hover:text-brand">Account</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">Delivery address</li>
        </ol>
      </nav>
      <header>
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-ink">Delivery address</h1>
        <p className="mt-1 text-[13px] text-muted">One address is kept handy for checkout. Save it once, reuse it for every order.</p>
      </header>

      <div aria-live="polite" className="mt-3">
        {notice && (
          <p className="rounded-[2px] border border-border bg-paper px-3 py-2 text-[12px] font-medium text-forest" data-testid="address-notice">
            {notice}
          </p>
        )}
      </div>

      <section className="mt-6 rounded-[2px] border border-border bg-paper p-4 sm:p-5" data-testid="address-form">
        {saved ? (
          <div className="rounded-[2px] bg-cream p-4">
            <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-forest">
              <CheckCircle2 aria-hidden="true" size={15} strokeWidth={2} className="text-forest" />
              Current saved address
            </p>
            <p className="mt-2 text-[13px] font-bold text-ink">{saved.name}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{saved.street}</p>
            <p className="text-[12px] leading-relaxed text-muted">
              {saved.city}, {saved.region} · {saved.phone}
            </p>
            <button
              type="button"
              onClick={handleDelete}
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#e61601] hover:underline"
              data-testid="address-delete"
            >
              <Trash2 aria-hidden="true" size={14} strokeWidth={2} />
              Delete this address
            </button>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-[12px] text-muted">
            <MapPin aria-hidden="true" size={14} strokeWidth={2} className="text-brand" />
            No way to reach your doorstep yet — fill this in and couriers will always get it right.
          </p>
        )}

        <form key={saved === null ? "address-new" : "address-saved"} onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4" noValidate={false}>
          <div>
            <label htmlFor="addr-name" className={labelClass}>Recipient name</label>
            <input id="addr-name" name="name" type="text" defaultValue={saved?.name ?? ""} className={inputClass} placeholder="Ama Mensah" autoComplete="name" />
            {errors.name && <p id="addr-name-error" className={errorClass}>{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="addr-region" className={labelClass}>Region</label>
            <select id="addr-region" name="region" defaultValue={saved?.region ?? ""} className={inputClass}>
              <option value="">Choose your region</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {errors.region && <p id="addr-region-error" className={errorClass}>{errors.region}</p>}
          </div>
          <div>
            <label htmlFor="addr-city" className={labelClass}>City or town</label>
            <input id="addr-city" name="city" type="text" defaultValue={saved?.city ?? ""} className={inputClass} placeholder="Tema" autoComplete="address-level2" />
            {errors.city && <p id="addr-city-error" className={errorClass}>{errors.city}</p>}
          </div>
          <div>
            <label htmlFor="addr-street" className={labelClass}>Street address</label>
            <input id="addr-street" name="street" type="text" defaultValue={saved?.street ?? ""} className={inputClass} placeholder="House, street, nearest landmark" autoComplete="street-address" />
            {errors.street && <p id="addr-street-error" className={errorClass}>{errors.street}</p>}
          </div>
          <div>
            <label htmlFor="addr-phone" className={labelClass}>Phone number</label>
            <input id="addr-phone" name="phone" type="tel" defaultValue={saved?.phone ?? ""} className={inputClass} placeholder="0248912345" autoComplete="tel" inputMode="numeric" />
            {errors.phone && <p id="addr-phone-error" className={errorClass}>{errors.phone}</p>}
          </div>
          <p aria-live="polite" className="sr-only">{notice}</p>
          <button type="submit" className="min-h-10 rounded-[4px] bg-brand px-4 text-[13px] font-bold text-white transition hover:bg-brand-deep" data-testid="address-save">
            Save delivery address
          </button>
        </form>
      </section>
    </div>
  );
}
