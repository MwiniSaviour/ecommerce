# Kora Market Backend (2026-10-19)

Goal: replace the localStorage-only data layer with a real PostgreSQL + Paystack
backend that a Capacitor build talks to over REST, without breaking the local
adapter (demo/offline mode) or the already-shipped UI.

Decisions carried from the architecture thread (conversation wins over any
earlier option notes): standalone TypeScript service, Hono on Node, Drizzle +
node-postgres, scrypt password hashing, JWT auth. Pure-JS dependencies only —
native add-ons (Prisma engines, bcrypt, argon2) do not build on
Termux/bionic/arm64.

## Scope

In scope:
- Server-side catalog, orders, payments, seller workspace, driver workspace.
- Paystack transaction init + `charge.success` webhook + verify endpoint.
- `src/lib/api/http.ts` REST adapter; migrate callers per DEBUGGING-NOTES.
- Seed data incl. demo seller `aries@koravendorhub.com` / `KoraDemo2026` and the
  current static catalog; local lineage kept for the local adapter.
- Deployment scaffolds (Dockerfile, render.yaml) + owner deployment guide.
- `.env`-driven config; dev Postgres is local Termux Postgres 18.6.

Out of scope (v1): reviews/ratings, seller payouts beyond computed commission,
multi-image product uploads (images remain remote URLs), real Push
notifications, payment method other than Paystack.

## Runtime stack

- Node 26 (already on host). No build step needed beyond `tsc`-style TS via tsx.
- `hono` + `@hono/node-server` (HTTP)
- `drizzle-orm` + `pg` (ORM, TCP-style conn string)
- `hono/jwt` JWT HS256; `crypto.scryptSync` password hashing; `zod` validation
- Paystack via `fetch`; webhook HMAC-SHA512 over **raw body** (`x-paystack-signature`)
- Dev: `tsx watch`; Prod: `tsx build`/tsc + plain node

## Process model (host constraints)

- Memory-safe: route handlers output bounded JSON; no streaming uploads; image
  hosting stays on product image URLs (no local file storage).
- Backend dev server on localhost:4001 (Next dev stays dev, Android build stays
  static out/). Never use 3000/3001 (Next) to avoid confusion.

## Service layout

- `backend/` (separate package.json so `next build` never picks it up)
  - `src/server.ts` entry — env load, app assemble, static+api on :4001? Only API
  - `src/db/schema.ts` tables + enums
  - `src/db/index.ts` pool + drizzle
  - `src/paystack/` init(tx ctx), verify, webhook verify + fulfilment
  - `src/routes/`
    - `v1/auth.ts` register/login/refresh/me (JWT; role: customer|seller|driver)
    - `v1/products.ts` list/get/create/update (seller CRUD guarded)
    - `v1/checkout.ts` draft order + price recompute (server truth; client
      prices ignored), `POST /orders` returns Paystack authorization or record
      + computes commission at priceOrder time (0.25 seller rate like local)
    - `v1/orders.ts` customer list/get/statuses
    - `v1/seller.ts` orders queue (accept/ready-to-ship/ship/return/cancel -> new
      seller_status lifecycle), seller products, seller ledger
    - `v1/driver.ts` profile upsert, availability, task list/accept/transitions
    - `v1/webhook.ts` Paystack webhook (idempotent by event id + reference)
  - `src/auth/` scrypt hash/verify, JWT issue/verify, role guards
  - `src/seed/` demo seller, demo driver, catalog from `src/lib/products.ts`
    (mirrored server-side as product seed JSON; server lineage is its own truth)
  - `migrations/` drizzle-kit SQL snapshots
- `src/lib/api/http.ts` — REST adapter; endpoints under `/v1/...` via env
  `KORA_API_URL`; identical signatures to `local.ts`; localStorage keys
  (`kora-market-cart-v1`, `kora-market-orders-v1`, etc.) remain client caches.
- `src/lib/api/index.ts` — adds `KORA_API_URL` env honor (`KORA_BACKEND_URL`
  fallback) + optional "both" mixed mode for gradual migration.

## Paystack contract (from docs)

- Server initializes transaction (`POST /transaction/initialize` with
  `amount` in kobo). Only server sees secret key.
- Client receives `authorization_url` + `reference`; opens authorization URL
  (Capacitor: external browser via `window.open` + return + poll verify).
- On return: `GET /transaction/verify/:reference` on backend to confirm state.
- Webhook `charge.success`: verify `x-paystack-signature` = HMAC-SHA512(rawBody,
  secret), 200 immediately, then update order/paid + write order_history row
  (idempotent).

## Migration checklist (DEBUGGING-NOTES lines ~137-165)

1. `seller-auth` pages -> `@/lib/api` (isSellerSignedIn uses remote session via
   JWT in storage; keep `kora-market-seller-auth-v1` as cache of profile only)
2. `seller-orders`/`seller-products` pages -> API
3. `cart`/`checkout`/`order` pages -> API; client remains cache-only; server
   recomputes line prices + fees;StoredOrder mirrored locally for offline view
4. Delete duplicate literals `kora-market-seller-auth-v1` and
   `kora-market-driver-profile-v1` (use `@/lib/api` imports only)
5. `driver` pages -> API; driver availability + task queue server-side
6. Keep double-effect guards on order placement; keep category/product finders
   returning `undefined` (never `null`)

## Verification

- Server: `npm run seed` then curl auth/products/orders smoke
- App: `npx next build --webpack` clean; web flow with `KORA_CAP_LIVE` +
  `KORA_API_URL=http://<LAN>:4001`; Android debug APK re-test of pay flow with
  test card 4084..0953 (Paystack test card) pending owner test keys
- Review fan-out: piped to file-based result collection (security, api-contract,
  testing, data-migration) as separate bash runs on this host; merge, blockers
  fixed inline
