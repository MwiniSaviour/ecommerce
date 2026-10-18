import {
  Baby,
  Dumbbell,
  Gamepad2,
  Heart,
  House,
  LayoutGrid,
  Monitor,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Tv,
  type LucideIcon,
} from "lucide-react";
import type { ProductCategory } from "./products";

export type ShopCategory = {
  label: string;
  slug: string;
  icon: LucideIcon;
};

export const categories: ShopCategory[] = [
  { label: "Supermarket", slug: "supermarket", icon: ShoppingBasket },
  { label: "Phones & Tablets", slug: "phones-tablets", icon: Smartphone },
  { label: "Health & Beauty", slug: "health-beauty", icon: Heart },
  { label: "Home & Office", slug: "home-office", icon: House },
  { label: "Appliances", slug: "appliances", icon: Monitor },
  { label: "Electronics", slug: "electronics", icon: Tv },
  { label: "Computing", slug: "computing", icon: LayoutGrid },
  { label: "Fashion", slug: "fashion", icon: Shirt },
  { label: "Sporting Goods", slug: "sporting-goods", icon: Dumbbell },
  { label: "Baby Products", slug: "baby-products", icon: Baby },
  { label: "Gaming", slug: "gaming", icon: Gamepad2 },
];

export function categoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function productCategoryToSlug(category: ProductCategory): string {
  switch (category) {
    case "Tech":
      return "phones-tablets";
    case "Home":
      return "home-office";
    case "Fashion":
      return "fashion";
    case "Beauty":
      return "health-beauty";
    case "Sports":
      return "sporting-goods";
  }
}
