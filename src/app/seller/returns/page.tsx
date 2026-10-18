"use client";

// DESIGN DIRECTION: returns tracking with dispute claims — inspired by Jumia seller center; not Jumia-verified.

import { useState } from "react";
import { MessageSquareWarning, PackageX } from "lucide-react";
import { HolidayBanner } from "@/components/seller/holiday-banner";
import { useStorefront } from "@/components/storefront-provider";
import {
  type SellerReturn,
  returnStatusClasses,
  returnStatusLabel,
  useSellerClaimActions,
  useSellerClaims,
  useSellerReturns,
} from "@/lib/seller-returns";

const claimable = (status: SellerReturn["status"]): boolean => status === "in-transit" || status === "item-received";

export default function SellerReturnsPage() {
  const { showToast } = useStorefront();
  const returns = useSellerReturns();
  const claims = useSellerClaims();
  const { openSellerClaim } = useSellerClaimActions();
  const [activeReturn, setActiveReturn] = useState<SellerReturn | null>(null);
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const submitClaim = () => {
    if (!activeReturn || !subject.trim() || !details.trim()) return;
    openSellerClaim({
      returnId: activeReturn.id,
      orderId: activeReturn.orderId,
      createdAt: new Date().toISOString(),
      subject: subject.trim(),
      details: details.trim(),
      contactEmail: contactEmail.trim(),
      status: "submitted",
    });
    showToast(`Claim filed for order ${activeReturn.orderId}`);
    setActiveReturn(null);
    setSubject("");
    setDetails("");
    setContactEmail("");
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 bg-white p-4 md:p-6" data-testid="seller-returns">
      <HolidayBanner />
      <div className="flex flex-wrap items-center gap-3 rounded-[14px] bg-paper p-5 shadow-sm">
        <div className="mr-auto">
          <p className="text-[12px] font-bold uppercase tracking-wide text-brand">After-sales</p>
          <h1 className="mt-1 text-[20px] font-bold text-ink">Returns</h1>
          <p className="mt-1 text-[13px] text-muted">Track returning items and open dispute claims.</p>
        </div>
        <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink">{returns.length} openings</span>
      </div>
      <div className="grid gap-4 rounded-[14px] bg-paper p-5 shadow-sm" data-testid="seller-returns-list">
        {returns.map((sellerReturn) => (
          <div key={sellerReturn.id} className="grid gap-2 border-b border-border pb-4 last:border-b-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-ink">
                {sellerReturn.orderId} · {sellerReturn.productName}
                <span className="ml-2 text-[11px] font-normal text-muted">Qty {sellerReturn.qty}</span>
              </p>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${returnStatusClasses(sellerReturn.status)}`}>
                {returnStatusLabel(sellerReturn.status)}
              </span>
            </div>
            <p className="text-[12px] text-muted">
              Opened {new Date(sellerReturn.openedAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })} · {sellerReturn.city} · Refund GH₵{sellerReturn.refundAmount.toLocaleString()} · Reason: {sellerReturn.reason}
            </p>
            {claimable(sellerReturn.status) && (
              <button
                type="button"
                onClick={() => setActiveReturn(sellerReturn)}
                className="flex min-h-9 items-center gap-2 self-start rounded-full bg-brand px-4 text-[12px] font-bold text-white transition-colors hover:bg-brand-deep"
              >
                <MessageSquareWarning size={14} aria-hidden="true" />
                File a claim
              </button>
            )}
          </div>
        ))}
      </div>
      {claims.length > 0 && (
        <div className="grid gap-3 rounded-[14px] bg-paper p-5 shadow-sm">
          <p className="text-[13px] font-bold text-ink">Claims sent to Kora support</p>
          {claims.map((claim) => (
            <div key={claim.id} className="grid gap-1 rounded-[14px] bg-sand p-4">
              <p className="text-[13px] font-bold text-ink">
                {claim.id} · {claim.subject}
                <span className="ml-2 text-[11px] font-normal text-muted">Order {claim.orderId}</span>
              </p>
              <p className="text-[12px] text-muted">{claim.details}</p>
              <p className="text-[12px] text-muted">Contact: {claim.contactEmail} · Status: Submitted</p>
            </div>
          ))}
        </div>
      )}
      {claims.length === 0 && (
        <p className="flex items-center gap-2 text-[12px] text-muted">
          <PackageX size={14} aria-hidden="true" />
          No claims filed yet.
        </p>
      )}
      {activeReturn && (
        <div className="rounded-[14px] bg-warn-soft p-5" data-testid="seller-returns-claim">
          <p className="text-[13px] font-bold text-warn">Dispute {activeReturn.id} for order {activeReturn.orderId}</p>
          <input
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Claim subject"
            className="mt-3 w-full rounded-[14px] border border-border bg-paper px-4 py-2 text-[13px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            rows={3}
            placeholder="What went wrong with this order?"
            className="mt-2 w-full rounded-[14px] border border-border bg-paper px-4 py-2 text-[13px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <input
            type="text"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="Contact email"
            className="mt-2 w-full rounded-[14px] border border-border bg-paper px-4 py-2 text-[13px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={submitClaim}
              className="min-h-11 rounded-full bg-brand px-5 text-[13px] font-bold text-white transition-colors hover:bg-brand-deep"
            >
              Submit claim
            </button>
            <button
              type="button"
              onClick={() => setActiveReturn(null)}
              className="min-h-11 rounded-full border border-border px-5 text-[13px] font-bold text-ink transition-colors hover:bg-sand"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
