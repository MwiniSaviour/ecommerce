"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { products, type CategoryFilter } from "@/lib/products";
import { useStorefront } from "@/components/storefront-provider";

const navItems: { label: string; category: CategoryFilter }[] = [
  { label: "Shop all", category: "All" },
  { label: "Phones & tech", category: "Tech" },
  { label: "Home & living", category: "Home" },
  { label: "Fashion", category: "Fashion" },
  { label: "Beauty", category: "Beauty" },
  { label: "Sports & outdoors", category: "Sports" },
];

function scrollToSection(id: string) {
  window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 0);
}

export function SiteHeader() {
  const {
    cartCount,
    setCartOpen,
    wishlistIds,
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    savedOnly,
    setSavedOnly,
    showToast,
  } = useStorefront();
  const draft = searchTerm;
  const [searchFocused, setSearchFocused] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const suggestions = draft.trim()
    ? products
        .filter((product) => product.name.toLowerCase().includes(draft.trim().toLowerCase()))
        .slice(0, 4)
    : [];

  function applySearch(term: string) {
    const normalized = term.trim();
    setSearchTerm(normalized);
    setActiveCategory("All");
    setSavedOnly(false);
    setSearchFocused(false);
    scrollToSection("products");
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applySearch(draft);
  }

  function selectCategory(category: CategoryFilter) {
    setActiveCategory(category);
    setSearchTerm("");
    setSavedOnly(false);
    scrollToSection(category === "All" ? "products" : "categories");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-cream/95 shadow-[0_4px_24px_rgba(24,51,43,0.035)] backdrop-blur-xl">
      <div className="bg-forest text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2 px-4 py-2 text-[10px] font-semibold tracking-[0.12em] sm:justify-between sm:px-6 sm:text-[11px] xl:px-8">
          <p className="flex items-center gap-2 text-white/90">
            <Sparkles aria-hidden="true" size={13} className="text-leaf" />
            <span>YOUR FIRST DELIVERY IS ON US</span>
            <span className="hidden text-white/45 sm:inline">·</span>
            <span className="hidden text-white/75 sm:inline">on orders over GH₵ 350</span>
          </p>
          <button
            type="button"
            className="hidden items-center gap-1.5 text-white/80 transition hover:text-white sm:flex"
            onClick={() => showToast("Delivering across Ghana — set your town at checkout")}
          >
            <MapPin aria-hidden="true" size={13} />
            <span>Delivering to</span>
            <span className="font-bold text-white">Accra</span>
            <ChevronDown aria-hidden="true" size={13} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 xl:px-8">
        <div className="flex flex-wrap items-center gap-3 py-3 md:flex-nowrap md:gap-8 md:py-4">
          <Link href="/" className="order-1 flex shrink-0 items-center gap-2.5" aria-label="Kora Market home">
            <span className="flex size-10 items-center justify-center rounded-[15px] bg-brand text-white shadow-[0_5px_12px_rgba(233,120,88,0.22)] sm:size-11">
              <Sparkles aria-hidden="true" size={21} strokeWidth={2.2} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[25px] font-black tracking-[-0.08em] text-ink sm:text-[28px]">
                kora<span className="text-brand">.</span>
              </span>
              <span className="mt-1 hidden text-[8px] font-bold tracking-[0.18em] text-muted sm:block">
                GOOD FINDS, WELL FOUND
              </span>
            </span>
          </Link>

          <form
            className="relative order-3 w-full md:order-2 md:mx-auto md:max-w-[620px] md:flex-1"
            role="search"
            onSubmit={submitSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
          >
            <label htmlFor="store-search" className="sr-only">
              Search products and categories
            </label>
            <div className="flex h-[46px] items-center rounded-full border border-border bg-white transition focus-within:border-forest/35 focus-within:ring-4 focus-within:ring-forest/[0.06] sm:h-[50px]">
              <Search aria-hidden="true" size={18} className="ml-4 shrink-0 text-muted" />
              <input
                id="store-search"
                type="search"
                value={draft}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="What are you looking for today?"
                autoComplete="off"
                className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-[13px] text-ink outline-none placeholder:text-muted/75 focus:outline-none focus:ring-0 sm:text-sm"
              />
              {draft && (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="mr-1 flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-ink"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSearchTerm("");
                  }}
                >
                  <X aria-hidden="true" size={15} />
                </button>
              )}
              <button
                type="submit"
                aria-label="Search"
                className="mr-1.5 flex h-9 items-center gap-2 rounded-full bg-forest px-4 text-[12px] font-bold text-white transition hover:bg-forest-light sm:h-10 sm:px-5 sm:text-[13px]"
              >
                <span className="hidden sm:inline">Search</span>
                <ArrowRight aria-hidden="true" size={16} />
              </button>
            </div>
            <span className="sr-only" aria-live="polite">
              {searchFocused && draft.trim() ? `${suggestions.length} product suggestions available.` : ""}
            </span>

            {searchFocused && (
              <div
                id="search-suggestions"
                className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[22px] border border-border bg-white p-3 shadow-[0_20px_55px_rgba(24,51,43,0.14)]"
              >
                {draft.trim() ? (
                  <>
                    <div className="flex items-center justify-between px-2 pb-2 pt-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{suggestions.length ? "Products" : "Search Kora"}</p>
                      <span className="text-[10px] text-muted">Press enter to see results</span>
                    </div>
                    {suggestions.length ? (
                      suggestions.map((product) => (
                        <button
                          type="button"
                          key={product.id}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => applySearch(product.name)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-cream"
                        >
                          <span>
                            <span className="block text-sm font-semibold text-ink">{product.name}</span>
                            <span className="mt-0.5 block text-xs text-muted">{product.brand}</span>
                          </span>
                          <ChevronRight aria-hidden="true" size={16} className="text-muted" />
                        </button>
                      ))
                    ) : (
                      <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-ink transition hover:bg-cream"
                      >
                        <Search aria-hidden="true" size={16} className="text-muted" />
                        Search for “{draft.trim()}”
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">A few good places to start</p>
                    <div className="flex flex-wrap gap-2 p-1">
                      {["wireless headphones", "lightweight everyday", "coffee maker"].map((query) => (
                        <button
                          type="button"
                          key={query}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => applySearch(query)}
                          className="rounded-full border border-border px-3 py-2 text-xs font-medium text-ink transition hover:border-forest/30 hover:bg-cream"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </form>

          <div className="order-2 ml-auto flex shrink-0 items-center gap-1.5 md:order-3 md:ml-0 md:gap-2">
            <div className="relative hidden sm:block">
              <button
                type="button"
                aria-expanded={accountOpen}
                aria-haspopup="dialog"
                onClick={() => setAccountOpen((open) => !open)}
                className="group flex h-11 items-center gap-2 rounded-full px-3 text-left transition hover:bg-white"
              >
                <UserRound aria-hidden="true" size={20} strokeWidth={1.8} className="text-ink" />
                <span className="flex flex-col leading-tight">
                  <span className="text-[11px] text-muted">Welcome</span>
                  <span className="text-[12px] font-bold text-ink">Sign in</span>
                </span>
                <ChevronDown aria-hidden="true" size={14} className="text-muted transition group-hover:text-ink" />
              </button>
              {accountOpen && (
                <div role="dialog" aria-label="Your Kora account" className="absolute right-0 top-[calc(100%+12px)] z-50 w-[290px] rounded-[22px] border border-border bg-white p-5 shadow-[0_20px_55px_rgba(24,51,43,0.15)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[23px] leading-tight text-ink">Welcome to Kora.</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted">Sign in to keep your favourite finds close.</p>
                    </div>
                    <button type="button" aria-label="Close account menu" onClick={() => setAccountOpen(false)} className="-mr-1 -mt-1 flex size-8 items-center justify-center rounded-full text-muted hover:bg-cream"><X aria-hidden="true" size={16} /></button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      showToast("Account sign-in will be ready when Kora connects to its backend");
                    }}
                    className="mt-4 flex w-full items-center justify-center rounded-full bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-deep"
                  >
                    Sign in / create account
                  </button>
                  <div className="mt-4 grid grid-cols-2 divide-x divide-border border-t border-border pt-3 text-xs text-muted">
                    <button type="button" onClick={() => { setAccountOpen(false); showToast("Your orders will appear here after checkout is connected"); }} className="py-1 text-left transition hover:text-ink">Track an order</button>
                    <button type="button" onClick={() => { setAccountOpen(false); setSavedOnly(true); scrollToSection("products"); }} className="py-1 text-right transition hover:text-ink">Saved finds</button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label={`Saved items${wishlistIds.length ? `, ${wishlistIds.length} saved` : ""}`}
              aria-pressed={savedOnly}
              onClick={() => {
                setSavedOnly((value) => !value);
                setActiveCategory("All");
                scrollToSection("products");
              }}
              className={`relative hidden h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold transition hover:bg-white md:flex ${savedOnly ? "text-brand" : "text-ink"}`}
            >
              <Heart aria-hidden="true" size={19} strokeWidth={1.8} fill={savedOnly ? "currentColor" : "none"} />
              <span>Saved</span>
              {wishlistIds.length > 0 && <span className="absolute right-1 top-1 size-[7px] rounded-full bg-brand ring-2 ring-cream" />}
            </button>

            <button
              type="button"
              aria-label={`Open shopping bag${cartCount ? `, ${cartCount} items` : ""}`}
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 items-center gap-2 rounded-full px-2.5 text-ink transition hover:bg-white sm:px-3"
            >
              <ShoppingBag aria-hidden="true" size={20} strokeWidth={1.8} />
              <span className="hidden text-sm font-semibold md:inline">Bag</span>
              <span className="flex min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        <nav aria-label="Main navigation" className="hidden border-t border-border/70 md:block">
          <div className="flex h-[44px] items-center gap-7">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => selectCategory(item.category)}
                aria-current={activeCategory === item.category && !savedOnly ? "page" : undefined}
                className={`relative flex h-full items-center text-[12px] font-semibold transition hover:text-brand ${activeCategory === item.category && !savedOnly ? "text-forest" : "text-muted"}`}
              >
                {item.label}
                {activeCategory === item.category && !savedOnly && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-brand" />}
              </button>
            ))}
            <Link href="#home-edit" className="ml-auto flex items-center gap-1.5 text-[12px] font-semibold text-brand transition hover:text-brand-deep">
              The home edit <ArrowRight aria-hidden="true" size={14} />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const { setCartOpen, setSavedOnly, setActiveCategory } = useStorefront();

  function goTo(id: string) {
    scrollToSection(id);
  }

  return (
    <nav aria-label="Quick navigation" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-paper/95 px-2 pt-2 shadow-[0_-8px_30px_rgba(24,51,43,0.08)] backdrop-blur-xl md:hidden">
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold text-forest">
        <Sparkles aria-hidden="true" size={19} strokeWidth={1.8} />
        Home
      </button>
      <button type="button" onClick={() => goTo("categories")} className="flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold text-muted transition hover:text-ink">
        <Search aria-hidden="true" size={19} strokeWidth={1.8} />
        Browse
      </button>
      <button type="button" onClick={() => { setSavedOnly(true); setActiveCategory("All"); goTo("products"); }} className="flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold text-muted transition hover:text-ink">
        <Heart aria-hidden="true" size={19} strokeWidth={1.8} />
        Saved
      </button>
      <button type="button" onClick={() => setCartOpen(true)} className="flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold text-muted transition hover:text-ink">
        <ShoppingBag aria-hidden="true" size={19} strokeWidth={1.8} />
        Bag
      </button>
    </nav>
  );
}
