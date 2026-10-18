import Link from "next/link";
import { HelpSection } from "@/components/help-article";
import { helpGroup } from "@/lib/navigation";

export const metadata = {
  title: "Help Centre — Kora Market",
  description: "Delivery, returns, payment and getting in touch with Kora Market.",
};

export default function HelpPage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-7 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-[12px] text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-brand">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">Help Centre</li>
        </ol>
      </nav>
      <header>
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-ink sm:text-[26px]">
          Kora Market Help Centre
        </h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
          Short answers on delivery, refunds and payments. Pick a topic below — most
          questions are one page long.
        </p>
      </header>
      <HelpSection title="Help topics">
        <ul className="grid gap-3 sm:grid-cols-2">
          {helpGroup.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block h-full rounded-[2px] border border-border bg-paper p-4 transition-colors hover:border-brand"
              >
                <span className="block text-[13px] font-bold text-ink underline-offset-2 hover:underline">
                  {link.label}
                </span>
                {link.description && (
                  <span className="mt-1 block text-[11px] leading-snug text-muted">
                    {link.description}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </HelpSection>
    </div>
  );
}
