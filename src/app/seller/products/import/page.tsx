"use client";

// DESIGN DIRECTION: bulk product CSV upload and in-progress processing — inspired by Jumia; not Jumia-verified.

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, Download, FileUp } from "lucide-react";

import { HolidayBanner } from "@/components/seller/holiday-banner";
import { useStorefront } from "@/components/storefront-provider";
import { formatPrice } from "@/lib/format";
import {
  IMPORT_TEMPLATE_CSV,
  type SellerImportRow,
  createSellerImport,
  parseSellerCsv,
  recordSellerImport,
  saveSellerCatalogOverride,
  useSellerImportActions,
  useSellerImports,
} from "@/lib/seller-catalog";
import { sellerProducts } from "@/lib/seller-products";

function getSellerProductBySku(sku: string) {
  return sellerProducts.find((product) => product.sku === sku);
}

export default function SellerProductImportPage() {
  const { showToast } = useStorefront();
  const { finishImport } = useSellerImportActions();
  const imports = useSellerImports();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("pasted-rows.csv");
  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState<SellerImportRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const checkRow = (row: SellerImportRow): SellerImportRow => {
    if (row.valid && !getSellerProductBySku(row.sku)) {
      return { ...row, valid: false, reason: "SKU does not match any product in this store" };
    }
    return row;
  };

  const parse = () => {
    const parseResult = parseSellerCsv(csv);
    setParseError(parseResult.error);
    setRows(parseResult.rows ? parseResult.rows.map(checkRow) : null);
  };

  const importFile = async (file: File) => {
    const text = await file.text();
    setFileName(file.name);
    setCsv(text);
    const parseResult = parseSellerCsv(text);
    setParseError(parseResult.error);
    setRows(parseResult.rows ? parseResult.rows.map(checkRow) : null);
  };

  const apply = () => {
    if (!rows) return;
    const valid = rows.filter((row) => row.valid);
    const failed = rows.length - valid.length;
    valid.forEach((row) => {
      const product = getSellerProductBySku(row.sku);
      if (product) saveSellerCatalogOverride(product.id, { price: row.price, stock: row.quantity, status: row.status });
    });
    const entry = createSellerImport(fileName, rows);
    recordSellerImport(entry);
    if (failed === 0) finishImport(entry.id);
    showToast(`Import completed with ${valid.length} updated, ${failed} failed`);
    setRows(null);
    setCsv("");
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([IMPORT_TEMPLATE_CSV], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "kora-seller-products-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 bg-white p-4 md:p-6" data-testid="seller-import">
      <HolidayBanner />
      <div className="flex flex-wrap items-center gap-3 rounded-[14px] bg-paper p-5 shadow-sm">
        <Link
          href="/seller/products"
          className="flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-bold text-ink transition-colors hover:bg-sand"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Products
        </Link>
        <div className="mr-auto">
          <p className="text-[12px] font-bold uppercase tracking-wide text-brand">Bulk edit</p>
          <h1 className="mt-1 text-[20px] font-bold text-ink">Import products</h1>
          <p className="mt-1 text-[13px] text-muted">Upload a CSV of price, stock and listing status updates.</p>
        </div>
      </div>
      <div className="grid gap-4 rounded-[14px] bg-paper p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={downloadTemplate}
            data-testid="seller-import-template"
            className="flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-bold text-ink transition-colors hover:bg-sand"
          >
            <Download size={16} aria-hidden="true" />
            Download template
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            data-testid="seller-import-file-button"
            className="flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-[13px] font-bold text-white transition-colors hover:bg-brand-deep"
          >
            <FileUp size={16} aria-hidden="true" />
            Choose CSV file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            data-testid="seller-import-file-input"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) importFile(file);
            }}
          />
        </div>
        <label className="grid gap-1 text-[12px] font-medium text-ink">
          Or paste CSV rows
          <textarea
            value={csv}
            onChange={(event) => {
              setCsv(event.target.value);
              setRows(null);
              setParseError(null);
            }}
            rows={5}
            data-testid="seller-import-text"
            placeholder="sku,name,brand,price,quantity,status,image-url"
            className="rounded-[10px] border border-border bg-white px-3 py-2 font-mono text-[12px] text-ink"
          />
        </label>
        <button
          type="button"
          onClick={parse}
          disabled={csv.trim().length === 0}
          data-testid="seller-import-parse"
          className="flex min-h-11 w-fit items-center justify-center rounded-full bg-brand px-5 text-[13px] font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-40"
        >
          Check rows
        </button>
        {parseError ? (
          <p className="rounded-[10px] bg-warn-soft px-3 py-2 text-[13px] text-warn" data-testid="seller-import-error">
            {parseError}
          </p>
        ) : null}
        {rows ? (
          <>
            <table className="w-full text-left text-[13px]" data-testid="seller-import-preview">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                  <th className="py-3 font-bold">Product</th>
                  <th className="py-3 font-bold">Price</th>
                  <th className="py-3 font-bold">Quantity</th>
                  <th className="py-3 font-bold">Check</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.sku}-${index}`} className="border-b border-border last:border-0">
                    <td className="py-3">
                      <p className="font-bold text-ink">{row.name}</p>
                      <p className="mt-0.5 font-mono text-[12px] text-muted">{row.sku}</p>
                    </td>
                    <td className="py-3 text-ink">{formatPrice(row.price)}</td>
                    <td className="py-3 text-ink">{row.quantity}</td>
                    <td className="py-3">
                      {row.valid ? (
                        <span className="rounded-full bg-ok-soft px-2.5 py-1 text-[11px] font-bold text-ok">Valid</span>
                      ) : (
                        <span
                          title={row.reason ?? ""}
                          data-testid={`seller-import-invalid-${index}`}
                          className="rounded-full bg-warn-soft px-2.5 py-1 text-[11px] font-bold text-warn"
                        >
                          {row.reason}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.some((row) => row.valid) ? (
              <button
                type="button"
                onClick={apply}
                data-testid="seller-import-apply"
                className="flex min-h-12 w-fit items-center justify-center rounded-full bg-brand px-6 text-[14px] font-bold text-white transition-colors hover:bg-brand-deep"
              >
                Import rows
              </button>
            ) : (
              <p className="text-[13px] text-muted">Fix the failed rows, then check again to import.</p>
            )}
          </>
        ) : null}
      </div>
      <div className="rounded-[14px] bg-paper p-5 shadow-sm" data-testid="seller-import-history">
        <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Import history</p>
        {imports.length === 0 ? (
          <p className="mt-2 text-[13px] text-muted">No product import uploads yet.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {imports.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center gap-3 rounded-[10px] bg-white px-4 py-3">
                <span className="font-mono text-[12px] font-bold text-ink">{entry.id}</span>
                <span className="mr-auto text-[13px] text-muted">{entry.fileName}</span>
                {entry.status === "finished" ? (
                  <span className="rounded-full bg-ok-soft px-2.5 py-1 text-[11px] font-bold text-ok">Finished</span>
                ) : entry.status === "failed" ? (
                  <span className="rounded-full bg-warn-soft px-2.5 py-1 text-[11px] font-bold text-warn">Failed</span>
                ) : (
                  <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink">In progress</span>
                )}
                <span className="font-mono text-[12px] text-ink">
                  {entry.rowsCompleted} rows completed · {entry.rowsFailed} failed
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
