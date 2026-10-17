import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CreditCard, PackageCheck, Truck } from "lucide-react";
import { CategoryRail } from "@/components/category-rail";
import { ProductGrid } from "@/components/product-grid";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-7 xl:px-8">
      <section aria-labelledby="hero-title" className="relative isolate grid overflow-hidden rounded-[26px] bg-[#edf0e8] sm:rounded-[32px] md:grid-cols-[1.02fr_0.98fr]">
        <div className="relative z-10 flex min-h-[350px] flex-col justify-center px-6 py-8 sm:min-h-[395px] sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/75 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-forest sm:text-[10px]">The Kora edit</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted sm:text-[10px]">A little better, every day</span>
          </div>
          <h1 id="hero-title" className="mt-5 max-w-[610px] font-display text-[42px] leading-[0.99] tracking-[-0.052em] text-ink sm:mt-6 sm:text-[54px] lg:text-[62px]">
            Your everyday,<br />
            a little more <span className="italic text-brand">delightful.</span>
          </h1>
          <p className="mt-4 max-w-[420px] text-[13px] leading-[1.7] text-[#5f6d64] sm:mt-5 sm:text-[15px]">
            Thoughtful finds for home, work and everywhere in between. Good things, without the endless scroll.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
            <Link href="#products" className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-brand px-5 text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(233,120,88,0.22)] transition hover:-translate-y-0.5 hover:bg-brand-deep sm:px-6 sm:text-[13px]">
              Explore the edit <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <Link href="#categories" className="inline-flex min-h-11 items-center gap-1.5 px-2 text-[11px] font-bold text-forest transition hover:text-brand sm:text-xs">
              Find your category <ArrowRight aria-hidden="true" size={14} />
            </Link>
          </div>
          <div className="mt-7 flex items-center gap-2.5 text-[10px] font-medium text-muted sm:mt-9 sm:text-[11px]">
            <span className="flex -space-x-1.5" aria-hidden="true">
              <span className="flex size-6 items-center justify-center rounded-full border-2 border-[#edf0e8] bg-[#e8c8ac] text-[8px] font-bold text-ink">K</span>
              <span className="flex size-6 items-center justify-center rounded-full border-2 border-[#edf0e8] bg-[#d5e0c7] text-[8px] font-bold text-ink">+</span>
              <span className="flex size-6 items-center justify-center rounded-full border-2 border-[#edf0e8] bg-[#ead9d1] text-[8px] font-bold text-ink">+</span>
            </span>
            <span>Good finds, picked with a little care.</span>
          </div>
          <span aria-hidden="true" className="hero-orb pointer-events-none absolute -bottom-32 -left-28 size-72 rounded-full" />
        </div>

        <div className="relative min-h-[250px] overflow-hidden bg-[#c8d0c8] sm:min-h-[310px] md:min-h-[430px]">
          <Image
            src="/images/hero-style.jpg"
            alt="A woman in a blue outfit with a pink crossbody bag in the city"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-[center_37%]"
          />
          <div className="hero-image-fade absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/15 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:via-transparent md:to-[#edf0e8]/10" />
          <div className="absolute left-4 top-4 rounded-full border border-white/35 bg-white/80 px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-forest shadow-sm backdrop-blur-md sm:left-6 sm:top-6 sm:px-4 sm:py-2.5">
            For wherever life takes you
          </div>
          <div className="absolute bottom-4 right-4 flex max-w-[230px] items-center gap-3 rounded-[18px] border border-white/70 bg-paper/95 p-2.5 shadow-[0_10px_34px_rgba(24,51,43,0.16)] backdrop-blur-sm sm:bottom-6 sm:right-6 sm:max-w-[260px] sm:gap-3.5 sm:p-3">
            <div className="relative size-[48px] shrink-0 overflow-hidden rounded-[13px] bg-[#efe9de] sm:size-[54px]">
              <Image src="/images/bag.jpg" alt="Brown city tote bag" fill sizes="54px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-brand sm:text-[9px]">The everyday edit</p>
              <p className="mt-1 truncate text-[11px] font-bold text-ink sm:text-xs">Little things, big love</p>
              <p className="mt-0.5 text-[10px] font-semibold text-muted">From GH₵ 129</p>
            </div>
            <span className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-[#edf0e8] text-forest"><ArrowRight aria-hidden="true" size={15} /></span>
          </div>
        </div>
      </section>

      <section aria-label="Shopping made easy" className="mt-4 grid overflow-hidden rounded-[20px] border border-border/80 bg-paper sm:grid-cols-3">
        <div className="flex items-center gap-3.5 border-b border-border/70 px-4 py-4 sm:border-b-0 sm:border-r sm:px-5 sm:py-4.5 lg:px-7">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-[#edf1e8] text-forest"><Truck aria-hidden="true" size={19} strokeWidth={1.8} /></span>
          <span><span className="block text-[11px] font-bold text-ink sm:text-xs">Delivery that works for you</span><span className="mt-1 block text-[10px] text-muted sm:text-[11px]">Doorstep or pick-up, across Ghana</span></span>
        </div>
        <div className="flex items-center gap-3.5 border-b border-border/70 px-4 py-4 sm:border-b-0 sm:border-r sm:px-5 sm:py-4.5 lg:px-7">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-[#f7ede7] text-brand"><CreditCard aria-hidden="true" size={19} strokeWidth={1.8} /></span>
          <span><span className="block text-[11px] font-bold text-ink sm:text-xs">Pay your way</span><span className="mt-1 block text-[10px] text-muted sm:text-[11px]">Mobile Money, card and more</span></span>
        </div>
        <div className="flex items-center gap-3.5 px-4 py-4 sm:px-5 sm:py-4.5 lg:px-7">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-[#f4f0df] text-[#97753f]"><PackageCheck aria-hidden="true" size={19} strokeWidth={1.8} /></span>
          <span><span className="block text-[11px] font-bold text-ink sm:text-xs">A little more peace of mind</span><span className="mt-1 block text-[10px] text-muted sm:text-[11px]">Clear delivery and return details</span></span>
        </div>
      </section>

      <div className="mt-12 sm:mt-16">
        <CategoryRail />
      </div>

      <div className="mt-12 sm:mt-[72px]">
        <ProductGrid />
      </div>

      <section id="home-edit" aria-labelledby="home-edit-title" className="mt-14 grid overflow-hidden rounded-[26px] bg-forest text-white sm:mt-[72px] sm:rounded-[32px] md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative flex min-h-[290px] flex-col justify-center overflow-hidden px-6 py-8 sm:min-h-[340px] sm:px-10 sm:py-10 lg:px-14">
          <div aria-hidden="true" className="promo-noise pointer-events-none absolute inset-0 opacity-30" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full border border-white/10" />
          <p className="relative text-[9px] font-bold uppercase tracking-[0.2em] text-[#dce8c2] sm:text-[10px]">A room to come home to</p>
          <h2 id="home-edit-title" className="relative mt-4 max-w-[430px] font-display text-[34px] leading-[1.04] tracking-[-0.04em] sm:text-[43px]">A home that feels a little more <span className="italic text-[#d9e5bd]">you.</span></h2>
          <p className="relative mt-4 max-w-[380px] text-[12px] leading-[1.75] text-white/70 sm:text-[13px]">From slow mornings to Sunday resets, find the small upgrades that make your space feel like yours.</p>
          <Link href="#products" className="relative mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-[11px] font-bold text-forest transition hover:bg-[#e8eddb] sm:text-xs">
            Browse home favourites <ArrowRight aria-hidden="true" size={15} />
          </Link>
          <span aria-hidden="true" className="absolute bottom-5 right-6 text-[52px] leading-none text-white/10 sm:bottom-8 sm:right-10 sm:text-[68px]">✳</span>
        </div>
        <div className="relative min-h-[230px] overflow-hidden bg-[#d1c09d] sm:min-h-[290px] md:min-h-[340px]">
          <Image src="/images/interior.jpg" alt="Warm, light living room with a mustard armchair and a simple side table" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-[center_55%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:via-transparent md:to-forest/10" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/40 bg-white/85 px-3 py-2 text-[9px] font-bold text-ink shadow-sm backdrop-blur sm:bottom-6 sm:left-6 sm:px-4 sm:py-2.5 sm:text-[10px]">
            <BadgeCheck aria-hidden="true" size={14} className="text-forest" /> Small upgrades, big everyday joy
          </div>
        </div>
      </section>

      <section aria-label="A note from Kora" className="mt-12 flex flex-col gap-3 rounded-[22px] border border-border/80 bg-[#f0f1e9] px-5 py-5 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand"><BadgeCheck aria-hidden="true" size={17} /></span>
          <div><p className="text-sm font-bold text-ink">A marketplace should feel easy, not like work.</p><p className="mt-1 text-xs leading-relaxed text-muted">So we keep the good stuff close, the details clear and the next step obvious.</p></div>
        </div>
        <Link href="#categories" className="ml-12 inline-flex items-center gap-1.5 text-[11px] font-bold text-forest transition hover:text-brand sm:ml-0 sm:whitespace-nowrap">Get to know Kora <ArrowRight aria-hidden="true" size={14} /></Link>
      </section>
    </div>
  );
}
