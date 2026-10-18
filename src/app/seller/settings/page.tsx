"use client";

// DESIGN DIRECTION: account settings with payout reconciliation and holiday mode — per brief.

import { ShieldCheck } from "lucide-react";
import { HolidayBanner } from "@/components/seller/holiday-banner";
import { useStorefront } from "@/components/storefront-provider";
import { useSellerSettings, updateSellerSettings } from "@/lib/seller-settings";

export default function SellerSettingsPage() {
  const { showToast } = useStorefront();
  const settings = useSellerSettings();

  const toggleReconciled = () => {
    updateSellerSettings((current) => ({ ...current, reconciled: !current.reconciled }));
    showToast(settings.reconciled ? "Payout reconciliation paused" : "Payout reconciliation complete");
  };

  const toggleHolidayMode = () => {
    updateSellerSettings((current) => ({ ...current, holidayMode: !current.holidayMode }));
    showToast(settings.holidayMode ? "Holiday mode turned off" : "Holiday mode on — your store shows a banner");
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 bg-white p-4 md:p-6" data-testid="seller-settings">
      <HolidayBanner />
      <div className="rounded-[14px] bg-paper p-5 shadow-sm">
        <p className="text-[12px] font-bold uppercase tracking-wide text-brand">Account</p>
        <h1 className="mt-1 text-[20px] font-bold text-ink">Settings</h1>
        <p className="mt-1 text-[13px] text-muted">Payout reconciliation and store availability.</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] bg-paper p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} aria-hidden="true" className="mt-0.5 text-brand" />
          <div>
            <p className="text-[13px] font-bold text-ink">Payout reconciliation</p>
            <p className="mt-1 text-[12px] text-muted">
              {settings.reconciled
                ? "Reconciled — payouts settle to your bank every Friday."
                : "Pending — reconcile your identity and bank account to unlock payouts."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleReconciled}
          data-testid="seller-settings-reconciled"
          aria-pressed={settings.reconciled}
          className={`min-h-11 rounded-full px-5 text-[13px] font-bold transition-colors ${
            settings.reconciled
              ? "bg-ok-soft text-ok"
              : "bg-brand text-white hover:bg-brand-deep"
          }`}
        >
          {settings.reconciled ? "Reconciled" : "Reconcile now"}
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] bg-paper p-5 shadow-sm">
        <div>
          <p className="text-[13px] font-bold text-ink">Holiday mode</p>
          <p className="mt-1 text-[12px] text-muted">
            {settings.holidayMode
              ? "On — shoppers see 'Closed for Kora Christmas' on every seller page."
              : "Off — your storefront behaves normally."}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleHolidayMode}
          data-testid="seller-settings-holiday"
          aria-pressed={settings.holidayMode}
          className={`min-h-11 rounded-full px-5 text-[13px] font-bold transition-colors ${
            settings.holidayMode ? "bg-warn-soft text-warn" : "bg-brand text-white hover:bg-brand-deep"
          }`}
        >
          {settings.holidayMode ? "Turn off" : "Turn on"}
        </button>
      </div>
    </div>
  );
}
