// DESIGN DIRECTION: Kora seller support hub — static help content, no client state needed.

import { HelpCircle, LifeBuoy, PhoneCall } from "lucide-react";
import { HolidayBanner } from "@/components/seller/holiday-banner";

const tiles = [
  {
    title: "How payouts work",
    body: "Commission is 12.5% of every order, service fee is a flat GH₵20. Statements unlock the 3rd of each month; unpaid 'due' statements block payouts until reconciled.",
  },
  {
    title: "Returns and disputes",
    body: "Items in transit or received can be disputed. File a claim from the Returns page; support answers within 2 business days on chat or within 4 weeks on refunds.",
  },
  {
    title: "Performance pips",
    body: "Scores weight fulfilment speed, product rating, return rate and cancellation rate, each at 25%. 4.2+ makes you a Strong performer; below 3.0 needs attention.",
  },
];

export default function SellerSupportPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-4 bg-white p-4 md:p-6" data-testid="seller-support">
      <HolidayBanner />
      <div className="rounded-[14px] bg-paper p-5 shadow-sm">
        <p className="text-[12px] font-bold uppercase tracking-wide text-brand">Help</p>
        <h1 className="mt-1 text-[20px] font-bold text-ink">Seller support</h1>
        <p className="mt-1 text-[13px] text-muted">Answers for the jobs you run every day on Kora.</p>
      </div>
      <div className="grid gap-4 rounded-[14px] bg-paper p-5 shadow-sm md:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.title} className="grid gap-1">
            <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
              <HelpCircle size={16} aria-hidden="true" className="text-brand" />
              {tile.title}
            </p>
            <p className="text-[12px] text-muted">{tile.body}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 rounded-[14px] bg-info-soft p-5">
        <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
          <LifeBuoy size={16} aria-hidden="true" />
          Chat with a Kora seller agent
        </p>
        <p className="text-[13px] text-ink">Available 8:00–20:00 GMT on weekdays. Average first reply: 4 minutes.</p>
      </div>
      <div className="grid gap-3 rounded-[14px] bg-paper p-5 shadow-sm">
        <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
          <PhoneCall size={16} aria-hidden="true" />
          Phone line
        </p>
        <p className="text-[13px] text-ink">0700-KORA-SELL (Mon–Fri). Emergency shipment disputes can use 0700-KORA-HELP after hours.</p>
      </div>
    </div>
  );
}
