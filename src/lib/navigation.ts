export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export const homeLink: NavLink = { label: "Home", href: "/", description: "Deals and fresh finds" };

export const searchLink: NavLink = { label: "Search", href: "/search", description: "Find products fast" };

export const cartLink: NavLink = { label: "Cart", href: "/cart", description: "Review your cart" };

export const accountLink: NavLink = { label: "My account", href: "/account", description: "Orders and details" };

export const helpGroup: NavLink[] = [
  { label: "Delivery information", href: "/help/delivery", description: "Timelines and pick-up points" },
  { label: "Returns & refunds", href: "/help/returns", description: "How returns work" },
  { label: "Payment options", href: "/help/payment", description: "Mobile Money, card and more" },
  { label: "Contact us", href: "/help/contact", description: "We are here to help" },
];

export const aboutGroup: NavLink[] = [
  { label: "My account", href: "/account" },
  { label: "Saved items", href: "/account/saved" },
  { label: "Flash Sales", href: "/deals" },
  { label: "Sell with us", href: "/help/contact" },
];
