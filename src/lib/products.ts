export type ProductCategory = "Tech" | "Home" | "Fashion" | "Beauty" | "Sports";

export type CategoryFilter = "All" | ProductCategory;

export type ProductSeller = {
  name: string;
  officialStore?: boolean;
};

export type ProductDelivery = {
  express?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  brand: string;
  price: number;
  compareAt?: number;
  rating: number;
  stock: number;
  image: string;
  badges: string[];
  seller?: ProductSeller;
  delivery?: ProductDelivery;
};

export const products: Product[] = [
  {
    id: "studio-headphones",
    slug: "studio-headphones",
    name: "Wireless Studio Headphones",
    description: "Over-ear wireless headphones with a padded headband, cushioned earcups and a listening range of 30 hours per charge",
    category: "Tech",
    brand: "SoundEdge",
    price: 749,
    compareAt: 990,
    rating: 4.6,
    stock: 24,
    image: "/images/headphones.jpg",
    badges: [],
    seller: { name: "SoundEdge Ghana", officialStore: true },
    delivery: { express: true },
  },
  {
    id: "everyday-smartphone",
    slug: "everyday-smartphone",
    name: "Everyday Smartphone 128GB",
    description: "Compact 6.1-inch smartphone with 128GB storage, dual rear cameras and an all-day battery for calls, photos and apps",
    category: "Tech",
    brand: "GadgetHub",
    price: 2490,
    compareAt: 2900,
    rating: 4.4,
    stock: 12,
    image: "/images/phone.jpg",
    badges: [],
    seller: { name: "GadgetHub Accra", officialStore: true },
    delivery: { express: true },
  },
  {
    id: "work-weekend-laptop",
    slug: "work-weekend-laptop",
    name: "Work & Weekend Laptop 14\"",
    description: "Light 14-inch laptop with a full keyboard, everyday processor and enough ports for a desk setup or a study session",
    category: "Tech",
    brand: "GadgetHub",
    price: 4850,
    compareAt: 5300,
    rating: 4.3,
    stock: 7,
    image: "/images/laptop.jpg",
    badges: [],
    seller: { name: "GadgetHub Accra", officialStore: true },
  },
  {
    id: "lightweight-runners",
    slug: "lightweight-runners",
    name: "Lightweight Running Shoes",
    description: "Breathable mesh running shoes with a cushioned midsole, built for morning jogs and rope skipping",
    category: "Sports",
    brand: "Stride",
    price: 420,
    rating: 4.2,
    stock: 38,
    image: "/images/sneakers.jpg",
    badges: [],
    seller: { name: "Stride Sports" },
  },
  {
    id: "city-tote",
    slug: "city-tote",
    name: "Woven City Tote Bag",
    description: "Roomy woven tote with an inner pocket and magnetic close, wide enough for a laptop, lunch and everything between",
    category: "Fashion",
    brand: "Adjoa Collection",
    price: 199,
    compareAt: 249,
    rating: 4.5,
    stock: 15,
    image: "/images/bag.jpg",
    badges: [],
    seller: { name: "Adjoa Collections" },
    delivery: { express: true },
  },
  {
    id: "glow-skincare-duo",
    slug: "glow-skincare-duo",
    name: "Glow Skincare Duo",
    description: "Cleanser and lightweight moisturiser from the same line, made for a simple morning and evening routine",
    category: "Beauty",
    brand: "Radiant",
    price: 260,
    compareAt: 320,
    rating: 4.8,
    stock: 42,
    image: "/images/skincare.jpg",
    badges: [],
    seller: { name: "Radiant Lab" },
  },
  {
    id: "classic-watch",
    slug: "classic-watch",
    name: "Classic Quartz Watch",
    description: "Slim quartz watch with a stainless mesh strap and a 30-minute hour marker, water resistant to 30 metres",
    category: "Fashion",
    brand: "Timeless",
    price: 389,
    rating: 4.1,
    stock: 9,
    image: "/images/watch.jpg",
    badges: [],
    seller: { name: "Timeless GH" },
  },
  {
    id: "countertop-coffee-maker",
    slug: "countertop-coffee-maker",
    name: "Countertop Coffee Maker",
    description: "Compact coffee maker with a reusable filter and drip tray, sized to sit beside a toaster on a kitchen counter",
    category: "Home",
    brand: "KitchenPro",
    price: 549,
    compareAt: 680,
    rating: 4.4,
    stock: 21,
    image: "/images/blender.jpg",
    badges: [],
    seller: { name: "KitchenPro" },
    delivery: { express: true },
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function discountedProducts(): Product[] {
  return products.filter(
    (product) =>
      product.compareAt !== undefined &&
      product.compareAt >= product.price * 1.05,
  );
}
