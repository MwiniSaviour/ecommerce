"use client";

// DESIGN DIRECTION: seller payout statements matching Jumia's green finance page; not Jumia-verified.

import { useState } from "react";
import { ChevronDown, FileDown, Lock, Wallet } from "lucide-react";

import { HolidayBanner } from "@/components/seller/holiday-banner";
import { useStorefront } from "@/components/storefront-provider";
import { formatPrice } from "@/lib/format";
import {
  type SellerStatement,
  useSellerStatementActions,
  useSellerStatements,
} from "@/lib/seller-statements";

const PAYOUT_PIN = "1234";

type Finance = { title: string; body: string; testid: string };

function financeTile(amount: number, unit: Finance): Finance {
  return { ...unit, body: amount === 0 ? "GHS 0" : formatPrice(amount) };
}

function sumStatements(statements: SellerStatement[], status: SellerStatement["status"]) {
  return statements.reduce((total, statement) => (statement.status === status ? total + statement.net : total), 0);
}

export default function SellerFinancePage() {
  const { showToast } = useStorefront();
  const statements = useSellerStatements();
  const { downloadCsv, markStatementPaid } = useSellerStatementActions();  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const tiles = [
    financeTile(sumStatements(statements, "due-unpaid"), {
      title: "Due",
      body: "",
      testid: "seller-finance-status-Due",
    }),
    financeTile(sumStatements(statements, "open"), {
      title: "Open",
      body: "",
      testid: "seller-finance-status-Open",
    }),
    financeTile(sumStatements(statements, "paid"), {
      title: "Paid",
      body: "",
      testid: "seller-finance-status-Paid",
    }),
    { title: "Disputed", body: "—", testid: "seller-finance-status-Disputed" },
  ];

  if (!unlocked) {
    return (
      <div className="mx-auto grid max-w-5xl gap-4 bg-white p-4 md:p-6" data-testid="seller-finance">
        <HolidayBanner />
        <div className="grid gap-3 rounded-[14px] bg-paper p-6 shadow-sm">
          <Wallet size={24} className="text-brand" aria-hidden="true" />
          <h1 className="text-[18px] font-bold text-ink">Financial statement</h1>
          <p className="text-[13px] text-muted">
            Enter your payout PIN to unlock statements. Demo PIN is 1234.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              inputMode="numeric"
              placeholder="Payout PIN"
              data-testid="finance-pin"
              className="min-h-11 w-40 rounded-[10px] border border-border bg-white px-3 text-[13px] text-ink"
            />
            <button
              type="button"
              onClick={() => {
                if (pin === PAYOUT_PIN) {
                  setUnlocked(true);
                } else {
                  showToast("Incorrect payout PIN");
                }
              }}
              data-testid="finance-pin-entry"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-[13px] font-bold text-white transition-colors hover:bg-brand-deep"
            >
              <Lock size={16} aria-hidden="true" />
              Unlock statements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-4 bg-white p-4 md:p-6" data-testid="seller-finance">
      <HolidayBanner />
      <div className="grid gap-3 rounded-[14px] bg-paper p-5 shadow-sm">
        <p className="text-[12px] font-bold uppercase tracking-wide text-brand">Financial</p>
        <h1 className="text-[20px] font-bold text-ink">Financial statement</h1>
        <p className="text-[13px] text-muted">
          A statement with everything sold in a period. Paid and due-unpaid rows roll into the next payout.
        </p>
      </div>
      <div className="grid gap-3 rounded-[14px] bg-paper p-5 shadow-sm md:grid-cols-2">
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          {tiles.map((tile) => (
            <div key={tile.title} className="rounded-[10px] bg-white px-4 py-3">
              <p className="text-[12px] font-medium text-muted">{tile.title}</p>
              <p className="mt-1 text-[18px] font-bold text-ink" data-testid={tile.testid}>
                {tile.body}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-muted md:col-span-2">
          Commission for an order in Phones &amp; Electronics category is paid by the seller.
        </p>
      </div>
      <div className="grid gap-3 rounded-[14px] bg-paper p-5 shadow-sm">
        <p className="text-[12px] font-bold uppercase tracking-wide text-muted">All statements</p>
        {statements.map((statement) => (
          <div key={statement.id} className="rounded-[10px] bg-white">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => setOpenId(openId === statement.id ? null : statement.id)}
                data-testid={`seller-finance-statement-${statement.id}`}
                className="flex min-h-9 flex-1 items-center gap-2 text-left"
              >
                <ChevronDown
                  size={16}
                  className={`text-muted transition-transform ${openId === statement.id ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
                <span className="font-bold text-ink">{statement.monthLabel}</span>
                <span className="text-[12px] text-muted">{statement.issueDate}</span>
              </button>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  statement.status === "paid" ? "bg-ok-soft text-ok" : "bg-sand text-ink"
                }`}
              >
                {statement.status === "paid" ? "Paid out" : statement.status === "due-unpaid" ? "Due unpaid" : "Awaiting"}
              </span>
              <span className="font-bold text-ink">{formatPrice(statement.net)}</span>
            </div>
            {openId === statement.id ? (
              <div className="grid gap-2 border-t border-border px-4 py-3 text-[12px] text-muted">
                <p className="font-bold text-ink">Details</p>
                <p>Commission rate for phones &amp; electronics: set by Kora Market in the category commission table.</p>
                <p>Net payout: {formatPrice(statement.net)}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => downloadCsv(statement)}
                    className="flex min-h-9 items-center gap-2 rounded-full border border-border px-3 text-[12px] font-bold text-ink transition-colors hover:bg-sand"
                  >
                    <FileDown size={14} aria-hidden="true" />
                    Download statement CSV
                  </button>
                  {statement.status === "due-unpaid" ? (
                    <button
                      type="button"
                      onClick={() => {
                        markStatementPaid(statement.id);
                        showToast(`${statement.monthLabel} marked as paid out`);
                      }}
                      data-testid={`seller-finance-payout-${statement.id}`}
                      className="flex min-h-9 items-center rounded-full bg-brand px-4 text-[12px] font-bold text-white transition-colors hover:bg-brand-deep"
                    >
                      Request payout now
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
