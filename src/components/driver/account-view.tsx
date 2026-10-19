"use client";

/* DESIGN DIRECTION: not Jumia-verified — assumed */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, FileCheck2, LogOut, Phone, Plus } from "lucide-react";
import { authApi } from "@/lib/api";
import type { DriverProfile } from "@/lib/api/types";

const HELP_ITEMS = [
  {
    q: "What if a customer refuses to pay COD?",
    a: "Do not hand over the parcel. Mark the delivery as failed with reason \"Customer refused\" and return the parcel to your hub. Kora will follow up on the order.",
  },
  {
    q: "Can I decline a task after accepting?",
    a: "Accepting a task is a commitment. Decline offers before accepting them; repeated declines after acceptance lower your acceptance rate and future offer priority.",
  },
  {
    q: "How do payouts work?",
    a: "Every delivered trip adds its leg fee to your earnings. The full amount is paid out each Saturday to your registered MTN MoMo number ending 024.",
  },
];

const DOCS = ["Ghana Card — verified", "Driver licence — verified", "Roadworthy certificate — verified", "Vehicle photo — verified"];

export function AccountView() {
  const router = useRouter();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [open, setOpen] = useState<string | null>(HELP_ITEMS[0]?.q ?? null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProfile = () => {
      authApi
        .getDriverProfile()
        .then((next) => {
          if (active) setProfile(next);
        })
        .catch(() => {
          if (active) setProfile(null);
        });
    };
    const loadAvailability = () => {
      authApi
        .getDriverAvailability()
        .then((next) => {
          if (active) setOnline(next === "online");
        })
        .catch(() => {
          if (active) setOnline(false);
        });
    };
    loadProfile();
    loadAvailability();
    const unsubscribeProfile = authApi.subscribeDriverProfile(loadProfile);
    const unsubscribeAvailability = authApi.subscribeDriverAvailability(loadAvailability);
    return () => {
      active = false;
      unsubscribeProfile();
      unsubscribeAvailability();
    };
  }, []);

  function handleSignOut() {
    void authApi.clearDriverData();
    router.push("/driver");
  }

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-5">
      <h1 className="text-[18px] font-bold tracking-[-0.02em] text-ink">Account</h1>

      <section className="rounded-[4px] border border-border bg-paper p-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-leaf text-[16px] font-bold text-brand-deep">
            {profile?.name.slice(0, 1) ?? "?"}
          </span>
          <div>
            <p className="text-[14px] font-bold text-ink">{profile?.name ?? "Kora Fleet rider"}</p>
            <p className="text-[11px] text-muted">{profile?.phone ?? "News coming soon"}</p>
          </div>
        </div>
        <ul className="mt-3 flex flex-col gap-1.5 text-[12px] text-muted">
          <li>Vehicle: {profile?.vehicle ?? "—"}</li>
          <li>Plate: {profile?.plate ?? "—"}</li>
          <li>City: {profile?.city ?? "—"}</li>
        </ul>
      </section>

      <section className="flex items-center justify-between rounded-[4px] border border-border bg-paper p-4">
        <div>
          <p className="text-[13px] font-bold text-ink">Availability</p>
          <p className="text-[11px] text-muted">{online ? "Receiving offers now" : "Paused until you go online"}</p>
        </div>
        <button
          type="button"
          onClick={() => void authApi.setDriverAvailability(online ? "offline" : "online")}
          aria-pressed={online}
          className={`motion-safe:transition min-h-11 rounded-[99px] px-4 text-[12px] font-bold ${
            online ? "bg-ok text-white hover:opacity-90" : "border border-border text-muted hover:text-ink"
          }`}
        >
          {online ? "Online" : "Offline"}
        </button>
      </section>

      <section className="rounded-[4px] border border-border bg-paper p-4">
        <h2 className="flex items-center gap-2 text-[13px] font-bold text-ink">
          <FileCheck2 size={15} aria-hidden="true" /> Documents
        </h2>
        <ul className="mt-2 flex flex-col gap-1.5 text-[12px] text-muted">
          {DOCS.map(doc => (
            <li key={doc} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-ok" aria-hidden="true" /> {doc}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[4px] border border-border bg-paper p-4">
        <h2 className="text-[13px] font-bold text-ink">Help</h2>
        <ul className="mt-1 flex flex-col divide-y divide-border">
          {HELP_ITEMS.map((item) => {
            const expanded = open === item.q;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : item.q)}
                  className="motion-safe:transition flex min-h-11 w-full items-center justify-between gap-2 text-left text-[13px] font-medium text-ink hover:text-brand-deep"
                >
                  {item.q}
                  {expanded ? <ChevronDown size={16} aria-hidden="true" className="rotate-180" /> : <ChevronDown size={16} aria-hidden="true" />}
                </button>
                {expanded && <p className="pb-3 text-[12px] text-muted">{item.a}</p>}
              </li>
            );
          })}
        </ul>
      </section>

      <button
        type="button"
        onClick={handleSignOut}
        className="motion-safe:transition inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] border border-primary/40 text-[14px] font-bold text-primary hover:bg-primary/5"
      >
        <LogOut size={16} aria-hidden="true" /> Sign out
      </button>

      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        <Phone size={13} aria-hidden="true" /> Fleet support: call <a href="tel:+233242424024" className="font-bold text-info">+233 24 242 4024</a>
      </p>
      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        <Plus size={13} aria-hidden="true" /> Want to sell too? Visit the Kora Seller Hub.
      </p>
    </main>
  );
}
