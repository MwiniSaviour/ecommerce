export type ProductCategory = "Tech" | "Home" | "Fashion" | "Beauty" | "Sports";
export type CategoryFilter = "All" | ProductCategory;

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  image: string;
  alt: string;
  badge?: string;
  badgeTone?: "coral" | "green" | "dark";
};

export const products: Product[] = [
  {
    id: "studio-headphones",
    name: "Studio wireless headphones",
    brand: "Sound, made simple",
    category: "Tech",
    price: 749,
    compareAt: 980,
    rating: 4.8,
    reviewCount: 128,
    image: "/images/headphones.jpg",
    alt: "Black over-ear headphones on a bright yellow background",
    badge: "BESTSELLER",
    badgeTone: "coral",
  },
  {
    id: "everyday-smartphone",
    name: "Everyday 5G smartphone · 128 GB",
    brand: "Your day, upgraded",
    category: "Tech",
    price: 2999,
    compareAt: 3499,
    rating: 4.7,
    reviewCount: 84,
    image: "/images/phone.jpg",
    alt: "Smartphone resting on a bright desk beside a laptop",
    badge: "SAVE GH₵500",
    badgeTone: "green",
  },
  {
    id: "work-weekend-laptop",
    name: "Work + weekend laptop · 14 inch",
    brand: "Ready when you are",
    category: "Tech",
    price: 5699,
    compareAt: 6299,
    rating: 4.6,
    reviewCount: 42,
    image: "/images/laptop.jpg",
    alt: "Slim laptop open on a tidy wooden desk",
    badge: "STAFF PICK",
    badgeTone: "dark",
  },
  {
    id: "lightweight-runners",
    name: "Lightweight everyday runners",
    brand: "Move in your own way",
    category: "Sports",
    price: 429,
    compareAt: 559,
    rating: 4.9,
    reviewCount: 63,
    image: "/images/sneakers.jpg",
    alt: "Red running shoe photographed against a dark backdrop",
    badge: "TRENDING",
    badgeTone: "coral",
  },
  {
    id: "city-tote",
    name: "The city tote · soft leather look",
    brand: "A little room for more",
    category: "Fashion",
    price: 299,
    compareAt: 399,
    rating: 4.7,
    reviewCount: 31,
    image: "/images/bag.jpg",
    alt: "Structured brown everyday handbag against a neutral background",
    badge: "NEW IN",
    badgeTone: "green",
  },
  {
    id: "glow-skincare-duo",
    name: "Glow ritual skincare duo",
    brand: "A softer start to the day",
    category: "Beauty",
    price: 219,
    compareAt: 280,
    rating: 4.8,
    reviewCount: 57,
    image: "/images/skincare.jpg",
    alt: "Minimal skincare products in white packaging on a warm neutral surface",
    badge: "GOOD GLOW",
    badgeTone: "coral",
  },
  {
    id: "classic-watch",
    name: "Classic mesh steel watch",
    brand: "Made for every hour",
    category: "Fashion",
    price: 620,
    compareAt: 770,
    rating: 4.6,
    reviewCount: 22,
    image: "/images/watch.jpg",
    alt: "Minimal wristwatch with a brushed silver strap on a pale surface",
    badge: "EASY GIFT",
    badgeTone: "dark",
  },
  {
    id: "countertop-coffee-maker",
    name: "Countertop coffee maker",
    brand: "Little luxuries, daily",
    category: "Home",
    price: 720,
    compareAt: 850,
    rating: 4.5,
    reviewCount: 19,
    image: "/images/blender.jpg",
    alt: "Compact coffee maker and grinder on a bright kitchen counter",
    badge: "HOME FAVOURITE",
    badgeTone: "green",
  },
];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}
