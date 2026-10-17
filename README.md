# Kora Market — storefront UI

A clean, Ghana-first marketplace storefront built with the Next.js App Router, TypeScript and Tailwind CSS. Kora is an original visual direction inspired by broad marketplace patterns, not a Jumia clone. The interface favours a calm editorial feel, fewer competing promotions, clear category paths and helpful local delivery/payment context.

> This repository is a UI prototype. Product names, prices, ratings, offers, stock and delivery details are sample content. Checkout, account actions and newsletter sign-up are interactive previews only; no payment, account or fulfilment service is connected.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
npm audit
```

## What’s here

- Responsive storefront home page with an editorial hero, Ghana-specific shopping cues, category discovery, featured products, a home edit and a newsletter footer.
- Search suggestions and client-side product filtering by category or keyword.
- Product quick views, saved items and an accessible shopping-bag drawer with quantity controls and a sample checkout step.
- Bag and saved-item state persisted to local storage and synchronized across tabs; the first server render remains storage-independent.
- Locally hosted image assets so the page does not need an image CDN at runtime. See [`ASSET-SOURCES.md`](./ASSET-SOURCES.md).
- Server-rendered page shell and product data, with client components limited to interactive controls and state.

## Structure

```text
src/
  app/                 App Router layout, home page and global design tokens
  components/           Header, discovery, product cards, cart, footer and UI state
  lib/                  Sample catalogue and display-format helpers
public/images/          Locally stored mock imagery
```

## Design and engineering notes

The current Jumia Ghana storefront makes the breadth of a marketplace visible through campaigns, category entry points, product grids, delivery options and local payment information. Kora keeps those useful jobs, but gives them a clearer hierarchy and more breathing room.

Jumia’s engineering blog has written about the constraints of mobile data/device performance, the risk of loading too much code in a single-page experience, and being thoughtful about caching changing data such as prices and stock. Those lessons informed the approach here: a statically rendered Next.js shell, modest client-side state, local image assets, and no heavy animation or remote font dependency.

- [Jumia Tech: A journey to Progressive Web Apps](https://tech.jumia.com/a-journey-to-progressive-web-apps/)
- [Jumia Tech: 10 Basic Tips to Build a WebAPI for Mobile Apps](https://tech.jumia.com/10-basic-tips-to-build-a-webapi-for-mobile-apps/)
- [Jumia Ghana storefront](https://www.jumia.com.gh/)

## Next production steps

The UI is prepared to connect to real systems, but these concerns intentionally sit outside this UI-only scope: a catalogue/search API, inventory and price validation, identity, seller and review data, address validation, delivery quotes, payment-provider integration, order creation, analytics/consent, and operational/error states. Before launch, replace all sample claims and values with validated business policy and backend data.
