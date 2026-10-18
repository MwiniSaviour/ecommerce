import Link from "next/link";
import { helpGroup } from "@/lib/navigation";
import type { ReactNode } from "react";

export function HelpArticle({
  topic,
  title,
  intro,
  children,
}: {
  topic: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-7 sm:px-6 lg:grid-cols-[1fr_240px]">
      <article>
        <nav aria-label="Breadcrumb" className="mb-3 text-[12px] text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={helpGroup[0]?.href ?? "/help/delivery"} className="hover:text-brand">Help</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-ink">{topic}</li>
          </ol>
        </nav>
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-ink sm:text-[26px]">{title}</h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">{intro}</p>
        <div className="mt-6 space-y-6 text-[13px] leading-relaxed text-ink">{children}</div>
      </article>
      <aside>
        <nav aria-label="Help topics" className="rounded-[2px] border border-border bg-paper p-4">
          <h2 className="mb-2.5 text-[12px] font-bold uppercase tracking-wide text-muted">Help topics</h2>
          <ul className="space-y-2 text-[12px]">
            {helpGroup.map((link) => (
              <li key={link.href}>
                {link.href.endsWith(topic.toLowerCase()) ? (
                  <span className="font-bold text-brand" aria-current="page">{link.label}</span>
                ) : (
                  <Link href={link.href} className="text-ink hover:text-brand hover:underline">
                    {link.label}
                  </Link>
                )}
                {link.description && (
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted">{link.description}</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}

export function HelpSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={slugify(title)}>
      <h2 id={slugify(title)} className="mb-2 text-[15px] font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
