import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/categories";

const railImages: Record<string, string> = {
  "phones-tablets": "/images/phone.jpg",
  "home-office": "/images/interior.jpg",
  fashion: "/images/bag.jpg",
  "health-beauty": "/images/skincare.jpg",
  "sporting-goods": "/images/sneakers.jpg",
};

export function CategoryRail() {
  const promoted = ["phones-tablets", "home-office", "fashion", "health-beauty", "sporting-goods"]
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category) => category !== undefined);
  return (
    <section aria-labelledby="category-rail-title">
      <h2 id="category-rail-title" className="mb-2.5 text-[15px] font-bold text-ink sm:text-lg">Shop by category</h2>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3">
        {promoted.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center gap-2 overflow-hidden rounded-md bg-paper p-2 text-center shadow-[0_1px_2px_rgba(28,28,30,0.06)] transition hover:shadow-md sm:p-3"
            >
              <span className="relative aspect-square w-full overflow-hidden rounded-md bg-sand">
                <Image
                  src={railImages[category.slug]}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 30vw, 180px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </span>
              <span className="text-[11px] font-medium text-ink sm:text-[12px]">{category.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
