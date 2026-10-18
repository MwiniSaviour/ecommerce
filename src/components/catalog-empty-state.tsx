import Link from "next/link";

export function CatalogEmptyState({ heading, message }: { heading: string; message: string }) {
  return (
    <div className="rounded-md border border-border bg-paper px-4 py-10 text-center">
      <h2 className="text-[15px] font-bold text-ink sm:text-base">{heading}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-relaxed text-muted sm:text-[13px]">{message}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Link href="/" className="inline-flex min-h-9 items-center rounded-[4px] bg-brand px-4 text-[12px] font-bold text-white transition hover:bg-brand-deep">
          Continue shopping
        </Link>
        <Link href="/deals" className="inline-flex min-h-9 items-center rounded-[4px] border border-brand px-4 text-[12px] font-semibold text-ink transition hover:bg-leaf">
          View flash sales
        </Link>
      </div>
    </div>
  );
}
