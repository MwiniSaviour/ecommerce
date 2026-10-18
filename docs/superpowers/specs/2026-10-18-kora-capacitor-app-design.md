# Kora Market → Capacitor Android App (pre-backend phase)

## Intent and the why

Kora Market is currently a Next.js 16 web app (Ghanaian storefront, seller/driver
portals, all data in localStorage via demo credentials). The goal state is an
industry-standard ecommerce mobile app accepted by the Play Store, which
requires a real backend. We are not shipping anything to the Play Store yet.

This phase's job: convert the existing web codebase into a working Capacitor
Android app **without spending work that the backend phase would discard**,
plus the mobile-native shell quality users expect (icon, splash, bottom nav,
back button, safe areas). The data layer gets cut at a clean seam so the
backend phase is an adapter swap, not a rewrite.

## Goals (this phase)

1. Gradle builds an installable debug APK from this repo that runs the full
   kora-market app on a device/emulator.
2. Static web build (`next build` with `output: "export"`) is the single
   source for the APK's `public/` assets; the web store and the app keep
   sharing one codebase.
3. The mobile experience is genuinely mobile: bottom tab bar (already exists,
   polish it), app icon, splash screen, Android hardware back-button handling,
   safe-area insets, no horizontal overflow, thumb-reachable CTAs on the key
   flows (home → PDP → cart → checkout).
4. A versioned API seam exists (`src/lib/api/`): typed interfaces for
   products, cart, orders, auth. The current localStorage implementation is
   the "local" adapter; a `http` adapter stub documents the backend contract
   for the next phase. Incremental: existing modules (seller-*, products,
   local-store) stay where they are until a given flow needs the seam; new
   code goes through it.
5. Signed-release path exists on paper (see Constraints) even though we do
   not produce a release build or ship this phase.

## Non-goals (this phase)

- No backend, no network calls, no remote config.
- No Play Store upload, no release signing artifacts, no Play billing.
- No push notifications, geolocation, or other device capabilities that
  require the backend phase to be meaningful (Capacitor is installed so they
  can be added with a plugin line later).
- No iOS build (no macOS host available).
- No redesign of the desktop web layout.

## Anti-goals (what would make this a failure even if it works)

- A webview pointed at a hosted URL (Play Store rejects webview-only shells;
  connectivity-dependent UX).
- Rewriting the UI natively (React Native/Flutter) — destroys the "device
  + web store are twins" position and discards existing work.
- Anchoring auth in scattered raw `localStorage` string reads (must converge
  on the auth adapter before backend, or backend migration becomes a bug farm).
- Bloat: shipping Capacitor plugins for capabilities we don't use yet.

## Constraints

- **Build host:** This dev box is Android/Termux (aarch64, ~7.7 GB RAM, no
  Docker, no official Android SDK). Standard Android build-tools are x86_64
  binaries, so a local toolchain needs community aarch64 builds (e.g.
  lzhiyong/android-sdk-tools) plus JDK 21 (Capacitor 7's AGP/Gradle
  require 21; Termux supplies both) and Gradle — this is a spike with
  an unknown success probability.
- **Fallback that must exist in the design:** Android APK builds via GitHub
  Actions (`ubuntu` runner, real SDK, actions/setup-java + gradle build) on
  push. GitHub is already the remote (MwiniSaviour/ecommerce). Device-side
  Gradle is a convenience, not a dependency of the architecture.
- **Static export blockers found in recon (must be fixed):**
  - `src/app/driver/job/[id]/{page,pickup,dropoff}.tsx` are
    `force-dynamic` — incompatible with `output: "export"`. Jobs are created
    at runtime from localStorage, so these params cannot be pre-generated.
    Convert these routes to search-param pages (`/driver/job?id=…`) whose
    client components read the id via `searchParams`; all `force-static`
    pages keep their route shape.
  - `next/image` needs `images.unoptimized = true` in `next.config.ts`.
  - `src/app/search/page.tsx` is a server component awaiting `searchParams`
    (server-side filtering) — fails export; convert to a client page reading
    `useSearchParams` and filtering client-side.
  - `src/app/seller/orders/[id]/page.tsx` uses `useParams` in a dynamic
    segment with no `generateStaticParams` — same class as driver job pages;
    same search-param conversion.
  - Extending the search-param pattern to these two routes is a builder-call
    extension of the documented pattern (settled).
- **Discovery pass:** no static export has ever been run for this repo. The
  first `next build` export is budgeted as a triage pass — the blocker list
  above is what recon found, not assumed exhaustive; anything else that
  surfaces (error.tsx edge cases, metadata oddities) gets the same
  client-side treatment on the spot before route-fix scope locks.
- **Memory:** `next build` and gradle both run at the memory ceiling; builds
  may need `NODE_OPTIONS=--max-old-space-size` tuning and one-at-a-time
  execution.
- **Verification device:** no emulator is possible on this aarch64 host; the
  smoke-test target is a physical Android device (sideload the debug APK via
  unknown-sources install). Cheap-first: this very device can host its own
  APK if owner permits unknown sources. [Call, 2026-10-18: this device is
  the smoke-test target; owner may re-target later without plan changes.]
- **Demo data reality:** all state (catalog, seller products/orders, driver
  jobs, auth) is localStorage-seeded. The app must degrade gracefully when
  storage is cold (first-run seeding already exists via store seeding — keep).

## Decided (how-it-gets-made, with the calls)

- **Capacitor 7 + @capacitor/cli + @capacitor/android**, config at repo root
  (`capacitor.config.ts`) with `appId` `com.koramarket.app`, `appName`
  "Kora Market", `webDir: "out"` where `out/` is the static export.
  [Call, 2026-10-18: owner did not respond to naming questions; adopted as
  recorded call. `appId` is expensive to change after the first Android
  commit — the owner is asked once more at the cap-add gate; if they decline
  to answer, the call stands.]
- **Live-reload during development:** `capacitor.config.ts` reads an env flag
  (`KORA_CAP_LIVE=<host>:3001`) to enable `server.url` against the `next dev`
  server, so web iteration doesn't require a rebuild per change. Default off
  (bundled `out/`).
- **minSdk 23, targetSdk 35, compileSdk 35** (Capacitor 7 defaults; ships
  Android 15-compatible).
- **Back button:** Capacitor's `backButton` event → history back; if
  history empty → candy for confirm-frees; no double-tap exit toast first
  pass.
- **Safe areas:** `viewport-fit=cover` + Tailwind `env(safe-area-inset-*)`
  padding on chrome components (`site-header`, `mobile-bottom-nav`,
  `driver-shell`, seller shell).
- **Splash + icon:** icons/splash generated initially with plain assets as a
  text mark; refining later is OK.
- **Static-export fix:** `next.config.ts` gets `output: "export"`,
  `images.unoptimized: true`, `trailingSlash` left default; the three driver
  `[id]` pages become search-param routes.
- **API seam shape:** `src/lib/api/types.ts` (domain types), `src/lib/api/index.ts`
  exporting `productsApi`, `cartApi`, `ordersApi`, `authApi`; implementations
  `src/lib/api/local.ts` (wraps existing modules) and `src/lib/api/http.ts`
  (unimplemented stub with the same signature, throws with a clear message —
  to be wired in the backend phase). Session/auth storage keys
  (`kora-market-seller-auth-v1`, `kora-market-driver-profile-v1`) move behind
  `authApi` only for new code; existing readers keep working until migrated.
- **Build tooling:** two-track. Track A spike: Termux-local JDK17 + Gradle +
  aarch64 build-tools. Track B (architectural safety net): GitHub Actions
  debug-APK workflow on push to main. Whichever proves itself first becomes
  the primary; the other remains CI-only.
- **Versioning:** `package.json` version is the source of truth, injected to
  `versionCode`/`versionName` by Capacitor automatically.

## What's left to the builder

- The Termux toolchain spike and its outcome report.
- Exact Worklow YAML and caching strategy for GitHub Actions.
- Component-level polish decisions within the constraints above (which
  paddings, which transitions — keep it restrained).
- Testing: manual device smoke-test matrix (first run, cold storage, back
  button, cart/checkout flow, seller + driver portals) — no automated
  e2e harness this phase.
- Deciding rollback behavior if the Termux spike fails (CI becomes mandatory
  path; document build-by-commit workflow in DEBUGGING-NOTES.md).
