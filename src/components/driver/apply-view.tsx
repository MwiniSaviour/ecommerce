"use client";

/* DESIGN DIRECTION: not Jumia-verified — assumed */

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Clock3, FileText, Phone, Truck, UserRound } from "lucide-react";
import type { DriverProfile } from "@/lib/driver-tasks";
import { authApi } from "@/lib/api";
import { useStorefront } from "@/components/storefront-provider";

const VEHICLES = ["Motorbike", "Tricycle", "Van", "Car"];
const CITIES = ["Accra", "Tema", "Kumasi", "Takoradi"];

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold text-ink">{label}</span>
      {children}
      {error && <span className="text-[11px] font-medium text-error">{error}</span>}
    </label>
  );
}

const inputClass =
  "min-h-11 rounded-[4px] border border-border bg-paper px-3 text-[13px] text-ink outline-none transition focus:border-brand motion-safe:transition-colors";

export function ApplyView() {
  const storefront = useStorefront();
  const [profile, setProfile] = useState<DriverProfile | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => {
      authApi
        .getDriverProfile()
        .then((next) => {
          if (active) setProfile(next);
        })
        .catch(() => {
          if (active) setProfile(null);
        });
    };
    load();
    const unsubscribe = authApi.subscribeDriverProfile(load);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(CITIES[0] ?? "Accra");
  const [vehicle, setVehicle] = useState(VEHICLES[0] ?? "Motorbike");
  const [plate, setPlate] = useState("");
  const [license, setLicense] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitted = profile?.status === "verification-pending";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Enter your full name.";
    if (!/^(\+233|0)\d{9}$/.test(phone.trim().replace(/\s/g, ""))) nextErrors.phone = "Use a Ghana number, e.g. 024 355 2310.";
    if (!plate.trim()) nextErrors.plate = "Enter your vehicle plate.";
    if (license.trim().length < 5) nextErrors.license = "Enter your DVLA licence number.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const next: DriverProfile = {
      status: "verification-pending",
      name: name.trim(),
      phone: phone.trim(),
      city,
      vehicle,
      plate: plate.trim().toUpperCase(),
      license: license.trim().toUpperCase(),
      submittedAt: Date.now(),
      approvedAt: null,
    };
    void authApi.setDriverProfile(next);
    storefront.showToast("Application received");
  }

  function demoApprove() {
    if (!profile) return;
    void authApi.setDriverProfile({ ...profile, status: "approved", approvedAt: Date.now() });
  }

  if (submitted) {
    return (
      <main className="flex flex-1 flex-col gap-4 px-4 py-6">
        <div className="rounded-[4px] border border-warn bg-warn-soft p-4">
          <div className="flex items-center gap-2">
            <Clock3 size={18} aria-hidden="true" className="text-warn" />
            <h1 className="text-[15px] font-bold text-ink">Verification pending — up to 48 hours</h1>
          </div>
          <p className="mt-2 text-[12px] text-ink/80">
            Our fleet team is reviewing {profile.name}&apos;s details. We&apos;ll call {profile.phone} once approved.
          </p>
        </div>
        <section className="rounded-[4px] border border-border bg-paper p-4">
          <h2 className="flex items-center gap-2 text-[13px] font-bold text-ink">
            <ClipboardList size={16} aria-hidden="true" /> Documents checklist
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-[12px] text-muted">
            {["Ghana Card of the rider", "Valid driver licence", "Vehicle roadworthy certificate", "Photo of your vehicle"].map(
              (doc) => (
                <li key={doc} className="flex items-center gap-2">
                  <FileText size={14} aria-hidden="true" /> {doc}
                </li>
              ),
            )}
          </ul>
        </section>
        <button type="button" onClick={demoApprove} className="motion-safe:transition min-h-11 rounded-[4px] border border-dashed border-border text-[12px] font-medium text-muted hover:text-ink">
          Demo: mark verified now
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-[20px] font-bold tracking-[-0.02em] text-ink">Ride with Kora Market</h1>
        <p className="mt-1 text-[13px] text-muted">Deliver customer parcels in Accra and Tema and earn GH₵ per trip.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-[4px] border border-border bg-paper p-4">
        <Field label="Full name" error={errors.name}>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Yaw Mensah" />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <div className="flex items-center gap-2">
            <span className="flex min-h-11 items-center gap-1 rounded-[4px] border border-border bg-paper px-2 text-[13px] text-muted" aria-hidden="true">
              <Phone size={14} /> +233
            </span>
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel-national" placeholder="024 355 2310" />
          </div>
        </Field>
        <Field label="Operating city">
          <select className={inputClass} value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Vehicle">
          <select className={inputClass} value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
            {VEHICLES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Plate number" error={errors.plate}>
            <input className={inputClass} value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="GT 441-24" />
          </Field>
          <Field label="Licence number" error={errors.license}>
            <input className={inputClass} value={license} onChange={(e) => setLicense(e.target.value)} placeholder="DVA123456" />
          </Field>
        </div>
        <button
          type="submit"
          className="motion-safe:transition inline-flex min-h-12 items-center justify-center rounded-[4px] bg-brand px-5 text-[14px] font-bold text-white hover:bg-brand-deep"
        >
          Submit application
        </button>
        <p className="flex items-center gap-1.5 text-[11px] text-muted">
          <UserRound size={13} aria-hidden="true" /> Applications are reviewed within 48 hours.
        </p>
      </form>
      <div className="rounded-[4px] border border-border bg-ok-soft p-4 text-[12px] text-ink/80">
        <p className="flex items-center gap-2 font-bold text-ok">
          <CheckCircle2 size={15} aria-hidden="true" /> Why ride for Kora
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          <li className="flex items-center gap-2">
            <Truck size={14} aria-hidden="true" /> Choose your hours — morning or afternoon shifts.
          </li>
          <li className="flex items-center gap-2">
            <Truck size={14} aria-hidden="true" /> GH₵ 8–25 per leg, disclosed before you accept.
          </li>
          <li className="flex items-center gap-2">
            <Truck size={14} aria-hidden="true" /> Saturday payouts to your MoMo wallet.
          </li>
        </ul>
      </div>
    </main>
  );
}
