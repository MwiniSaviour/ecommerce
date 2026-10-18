import Link from "next/link";
import { ArrowRight, Bike, Store, Truck } from "lucide-react";

const services = [
  {
    title: "Kora Delivery",
    tagline: "Send a package",
    note: "Everywhere in Ghana",
    href: "/help/delivery",
    icon: Truck,
  },

  {
    title: "Sell on Kora",
    tagline: "Open your shop",
    note: "Free to list, easy to manage",
    href: "/seller",
    icon: Store,
  },
  {
    title: "Drive with Kora",
    tagline: "Become your own boss",
    note: "Earn on your schedule",
    href: "/driver/apply",
    icon: Bike,
  },
];

export function ServicesBanner() {
  return (
    <section aria-labelledby="services-title" className="mt-8 sm:mt-10">
      <h2 id="services-title" className="mb-2.5 text-[15px] font-bold text-ink sm:text-lg">
        Explore our quality services
      </h2>
      <ul className="grid gap-2.5 sm:grid-cols-3 sm:gap-3">
        {services.map(({ title, tagline, note, href, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full min-h-[104px] flex-col justify-between rounded-md border border-border bg-paper p-3.5 transition hover:border-brand/60 hover:shadow-sm"
            >
              <span className="flex items-start gap-3">
                <Icon aria-hidden="true" size={22} strokeWidth={1.75} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  <span className="block text-[14px] font-bold text-ink">{title}</span>
                  <span className="mt-0.5 block text-[12px] text-muted">{tagline}</span>
                </span>
              </span>
              <span className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted">
                {note}
                <ArrowRight aria-hidden="true" size={14} className="text-brand transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
