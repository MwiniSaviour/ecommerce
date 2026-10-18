"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { eyebrow: null, heading: "Everyday tech, fair prices", cta: "Shop phones & tablets", href: "/category/phones-tablets", image: "/images/phone.jpg" },
  { eyebrow: null, heading: "Gear up for game day", cta: "Shop sporting goods", href: "/category/sporting-goods", image: "/images/sneakers.jpg" },
  { eyebrow: "Flash Sales", heading: "Sound up. Prices down.", cta: "Shop the deals", href: "/deals", image: "/images/headphones.jpg" },
  { eyebrow: null, heading: "Upgrade your space", cta: "Shop home & office", href: "/category/home-office", image: "/images/interior.jpg" },
];

export function HomeHero() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIndex((current) => (current + 1) % slides.length), 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index]);

  function goTo(next: number) {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }

  const slide = slides[index];

  return (
    <section aria-label="Featured collections" className="relative h-[240px] overflow-hidden rounded-[14px] bg-forest sm:h-[320px] lg:h-[380px]">
      {slides.map((item, slideIndex) => (
        <Image
          key={item.image}
          src={item.image}
          alt=""
          fill
          priority={slideIndex === 0}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1440px"
          className={`object-cover transition-opacity duration-500 ${slideIndex === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8">
        {slide.eyebrow ? (
          <span className="mb-2 inline-block rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            {slide.eyebrow}
          </span>
        ) : null}
        <h1 className="max-w-md text-[22px] font-bold leading-tight text-white sm:max-w-lg sm:text-3xl">{slide.heading}</h1>
        <Link
          href={slide.href}
          className="mt-3 inline-flex items-center rounded-md bg-white px-4 py-2 text-[13px] font-medium text-ink hover:bg-leaf"
        >
          {slide.cta}
        </Link>
      </div>
      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="previous"
        className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink hover:bg-white"
      >
        <ChevronLeft aria-hidden="true" size={20} />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="next"
        className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink hover:bg-white"
      >
        <ChevronRight aria-hidden="true" size={20} />
      </button>
      <div className="absolute bottom-2 right-4 flex gap-1.5">
        {slides.map((item, dotIndex) => (
          <button
            key={item.image}
            type="button"
            aria-label={`Go to slide ${dotIndex + 1}`}
            aria-current={dotIndex === index}
            onClick={() => goTo(dotIndex)}
            className={`h-1.5 rounded-full transition-all ${dotIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
