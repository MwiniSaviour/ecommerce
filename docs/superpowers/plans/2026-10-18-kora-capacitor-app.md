# Kora Market → Capacitor Android App — Implementation Plan

Design doc: `docs/superpowers/specs/2026-10-18-kora-capacitor-app-design.md` (2026-10-18).
Read it before executing: intent, anti-goals, and recorded calls live there.

## Definitions & Conventions

- **Repo root** = `/data/data/com.termux/files/home/project/ecommerce`. All commands run from there.
- **`/tmp` is read-only** on this host. Any temp file goes under the repo or
  `$PREFIX/tmp/opencode/`.
- **Dev server**: may be dead between sessions. Restart with:
  ```bash
  nohup node node_modules/next/dist/bin/next dev --webpack -p 3001 \
    >> dev.log 2>&1 & disown &
  ```
  Verify with `grep -q "<ip>:3001.*d"? True` → simply `curl -s -o /dev/null -w "%{http_code}" localhost:3001`.
  Find PIDs via `ps -A -o pid,args | grep "next dev"`; `ps` shows nothing — scan `/proc/[0-9]*/cmdline` if needed.
- **Typecheck** = `./node_modules/.bin/tsc --noEmit` (fast, always run first).
- **Commits**: one per task, conventional style, using
  `git -c user.name="MwiniSaviour" -c user.email="saviourlorreh@hotmail.com"`.
  `dev.log` is gitignored — never commit it.
- **Android build toolchain** (JDK 21, aarch64 build-tools, Gradle) is
  deliberately deferred to Task 5; Tasks 1–4 are pure code/config work.
- **Capacitor names (recorded call, 2026-10-18)**: `appId`
  `com.koramarket.app`, `appName` "Kora Market", `webDir` "out",
  minSdk 23, target/compileSdk 35. The owner gets one explicit heads-up at
  the Task 3 gate before `cap add android` first commits these names;
  if they decline to answer, the call stands.
- **Versioning**: `package.json` `version` stays 0.1.0 this phase; Capacitor
  injects `versionCode`/`versionName` from it automatically.

## Files (deliverables this plan creates/changes)

- Delete: `src/app/driver/job/[id]/page.tsx`, `src/app/driver/job/[id]/pickup/page.tsx`, `src/app/driver/job/[id]/dropoff/page.tsx`
- Create: `src/app/driver/job/page.tsx`, `src/app/driver/job/pickup/page.tsx`, `src/app/driver/job/dropoff/page.tsx`
- Create: `src/components/search-view.tsx` ("use client")
- Modify: `src/app/search/page.tsx` (server wrapper + Suspense)
- Create: `src/app/seller/orders/detail/page.tsx`, `src/app/seller/orders/detail/order-view.tsx` ("use client")
- Delete: `src/app/seller/orders/[id]/page.tsx`
- Modify: `src/components/driver/{job-view,pickup-view,dropoff-view,home-view,tasks-view}.tsx`
- Modify: `src/app/seller/orders/page.tsx`, `src/app/seller/dashboard/page.tsx`
- Modify: `next.config.ts` (`output: "export"`, `images.unoptimized: true`)
- Create: `capacitor.config.ts`, `android/` (generated, committed)
- Create: `.github/workflows/android-debug.yml`
- Create: `assets/icon.png` (1024×1024), `assets/splash.png` (2732×2732; one bright variant)
- Create: `src/components/capacitor-back-button.tsx` + wire in `src/app/layout.tsx`
- Modify: `src/components/site-header.tsx` (top safe-area inset), `src/app/layout.tsx` viewport
- Create: `src/lib/api/{types,local,http,index}.ts`
- Modify: `DEBUGGING-NOTES.md` (spike outcome, build workflow notes)

## Task 1 — Convert remaining server-rendered routes to export-safe shapes

Static export failed on four route groups. These are the only ones recon found,
but conversion is mechanical and pre-build. **Extensions of the documented
search-param pattern are builder-authorized** (per design doc Constraints).

### 1a. Driver job routes → search-param pages

Views already read task data from driver store by `id`; make each view fetch
its own id client-side instead of receiving it as a prop.

**In `src/components/driver/job-view.tsx`** (skip if it already imports
`useSearchParams`): replace the `id` prop flow.

```tsx
"use client";
import { useSearchParams } from "next/navigation";
// JobView signature: export function JobView() {  — drop `id` parameter
const searchParams = useSearchParams();
const id = searchParams.get("id") ?? "";
```

Same change in `src/components/driver/pickup-view.tsx` and
`src/components/driver/dropoff-view.tsx` (each had an `id` prop).

**Replace the three `[id]` page files with:**

```tsx
// src/app/driver/job/page.tsx (and pickup/page.tsx, dropoff/page.tsx)
import { Suspense } from "react";
import { JobView } from "@/components/driver/job-view";

export const metadata = {
  title: "Kora Fleet — Task",
  description: "Delivery task detail: pickup, dropoff, and proof of delivery.",
};

export default function DriverJobPage() {
  return (
    <Suspense fallback={null}>
      <JobView />
    </Suspense>
  );
}
```

(pickup uses `title: "Kora Fleet — Pickup"`, dropoff uses `title: "Kora Fleet — Dropoff"`.)

**Link updates** (route shape: `/driver/job/{pickup,dropoff}?id=…`):
- `src/components/driver/home-view.tsx` lines ~59, ~151: `/driver/job/${x}` → `/driver/job?id=${x}`
- `src/components/driver/tasks-view.tsx` line ~12: → `/driver/job?id=${task.id}`
- `src/components/driver/job-view.tsx` lines ~169, ~181: → `/driver/job/pickup?id=${task.id}`, `/driver/job/dropoff?id=${task.id}`
- `src/components/driver/pickup-view.tsx` lines ~52, ~71, ~83 → `/driver/job?id=${task.id}`
- `src/components/driver/dropoff-view.tsx` lines ~42, ~59, ~93, ~243 → `/driver/job?id=${task.id}`

### 1b. Seller order detail → search-param page

- Move the whole existing page body to
  `src/app/seller/orders/detail/order-view.tsx` with the `"use client"`
  directive kept and `useParams` swapped for `useSearchParams`
  (`const params = useSearchParams<{ id: string }>()` → `useSearchParams`, `params.get("id")`).
- New `src/app/seller/orders/detail/page.tsx`: static `metadata` titled
  "Aries & Co. — Order detail" wrapped around `<Suspense fallback={null}><OrderView /></Suspense>`.
- Links to update: `src/app/seller/orders/page.tsx:253` and
  `src/app/seller/dashboard/page.tsx:202` → `` `/seller/orders/detail?id=${order.id}` ``.

### 1c. Search page → client component with Suspense

- Create `src/components/search-view.tsx` marked `"use client"`, containing
  the current page body (uses `useSearchParams()` to read `q` as a plain
  string; keeps `searchProducts` helper, `CatalogSearchSync`, etc.).
- Rewrite `src/app/search/page.tsx` as a server page with static `metadata`
  (`title: "Search — Kora Market"`) that renders the client view in `<Suspense>`.
- `next/link` imports in the view stay as-is (`Link` works in client components).

### Verify (task test cycle)

1. `./node_modules/.bin/tsc --noEmit` → 0 errors.
2. Restart dev server (see above) and check three CDP loads (use the headless
   Chromium recon script, or plain checks):
   - `http://localhost:3001/search` → renders trending-search block, no console page-error.
   - `http://localhost:3001/driver/job?id=SOME-MISSING-ID` → JobView's missing-task state, no blank page error.
   - `http://localhost:3001/seller/orders/detail?id=0000` → "Order not found" block, no crash.
   - One real flow while server is up: `/driver/tasks` → tap a task link → lands on `/driver/job?id=<real-id>`, renders.

- [ ] Commit: `refactor: make dynamic detail routes export-safe (search-param pages)`

## Task 2 — Static export config + first export build (discovery pass)

**This is the triage pass.** The blocker list from Task 1 is what recon found,
not assumed exhaustive. Anything new that surfaces gets the same client-side
treatment on the spot **before this task closes** — never after.

- `next.config.ts`: add

  ```ts
  output: "export",
  images: { unoptimized: true, formats: ["image/avif", "image/webp"] },
  ```

  (uncommitted `allowedDevOrigins` line folds into this commit naturally.)

### Verify

1. `./node_modules/.bin/tsc --noEmit`
2. `node node_modules/next/dist/bin/next build --webpack 2>&1 | tail -40`
   - Success = exit 0 AND `out/` directory exists with `index.html`
     (check `ls out/index.html out/cart.html out/driver/job.html 2>/dev/null`).
   - If memory pressure: `NODE_OPTIONS=--max-old-space-size=3000` on the same line.
   - **If new blockers appear**: fix them now (same shape as Task 1 fixes,
     builder-authorized extension of the search-param pattern) and re-run to
     a green build. Record anything surprising in `DEBUGGING-NOTES.md`.
3. `git add out` — NO. `out/` must be **gitignored**: add `out/` to
   `.gitignore` (delete the directory after the green build; it's a build
   artifact). `android/` will get it re-served by `cap sync` from wherever
   Capacitor points.

- [ ] Commit: `build: enable static export (output: export, unoptimized images)`

## Task 3 — Capacitor 7 wiring (gate: appId heads-up)

**Before `cap add android`**: surface the recorded call to the owner —
`appId com.koramarket.app` is essentially permanent after the first Android
commit. If they give a different name, substitute it everywhere below.

- `npm install @capacitor/core @capacitor/cli @capacitor/android`
  (accepts a few minutes; Termux result for `@capacitor/android` is a JS CLI
  only — the electron-sized native payloads live in the Android project the
  tool generates locally).
- Create `capacitor.config.ts` at repo root:

  ```ts
  import type { CapacitorConfig } from "@capacitor/cli";

  const config: CapacitorConfig = {
    appId: "com.koramarket.app",
    appName: "Kora Market",
    webDir: "out",
    android: {
      allowMixedContent: false,
      webContentsDebuggingEnabled: true, // removable once stable on-device
    },
  };

  // Live-reload during development: KORA_CAP_LIVE=<devhost>:3001
  if (process.env.KORA_CAP_LIVE) {
    config.server = config.server ?? {};
    config.server.url = `http://${process.env.KORA_CAP_LIVE}`;
    config.server.cleartext = true;
  }

  export default config;
  ```

- `npx cap add android` → creates `android/` project with the Gradle wrapper.
  (First `cap add` triggers `cap sync`, bundling the current `out/`.)
- Sanity: `android/app/src/main/java/com/koramarket/app` package dir exists.

### Verify

- `ls android/app/build.gradle android/gradlew` all exist.
- `npx cap sync android` exits 0 (double-run is fine; idempotent).
- `.gitignore` gets `android/app/src/main/assets/public` excluded
  (synced web payload is a build artifact) and `android/app/src/debug` fine;
  commit the `android/` project itself.

- [ ] Commit: `feat: add Capacitor Android project (com.koramarket.app)`

## Task 4 — GitHub Actions debug-APK workflow (Track B safety net)

This is the architectural fallback for the fact that building a native
Android binary on aarch64 Termux is not guaranteed. Get it green before the
Termux spike decision.

`.github/workflows/android-debug.yml`:

```yaml
name: Android debug APK
on:
  push:
    branches: [main]
    paths: ["android/**", "package.json", "package-lock.json", "capacitor.config.ts", ".github/workflows/android-debug.yml"]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 21 }
      - run: npm ci
      - run: node node_modules/next/dist/bin/next build --webpack
      - run: npx cap sync android
      - run: cd android && ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with: { name: kora-market-debug-apk, path: android/app/build/outputs/apk/debug/app-debug.apk }
```

### Verify

- `push` to `main`, open the Actions tab, confirm it goes green and the
  artifact is downloadable. If it needs fixing, iterate on the workflow file.

- [ ] Commit: `ci: android debug-apk workflow on push to main`

## Task 5 — Termux toolchain spike (Track A, bounded)

**Bound**: max ~1 focused session. Attempt, record outcome honestly, stop.

1. `pkg install openjdk-21 && java -version` → expect 21.x. If unavailable,
   stop here (recorded outcome Termux-hostile; CI is the path).
2. Community aarch64 Android build tools (`lzhiyong/android-sdk-tools`
   releases: `aapt`, `apksigner`, `d8`, `zipalign`, `dx`) unzipped under
   `$PREFIX/tmp/opencode/android-sdk-tools/`, put on PATH.
3. `pkg install gradle` (Termux Gradle) — verify `gradle --version`.
4. `cd android && ./gradlew assembleDebug` — the wrapper pulls AGP/Gradle.
   Expect failures around x86_64-native toolchain pieces; try `gradle
   assembleDebug` with the Termux gradle if the wrapper refuses.
5. Record the outcome (worked / specific breakpoint) in `DEBUGGING-NOTES.md.
   If it works, add the local build steps to that note and make local build
   primary; otherwise delete leftover toolchain bits and rely on Task 4.

- [x] Commit: whatever the outcome note says (`docs: termux android spike outcome`)
  — outcome: SUCCESS, local build primary (see `DEBUGGING-NOTES.md`)

## Task 6 — App icon + splash

- `assets/icon.png` (1024×1024) and `assets/splash.png` (2732×2732) — text
  mark "Kora" on the forest-green brand background per the design doc; a
  plain rasterized text mark is fine (refining later OK).
- `npm install --save-dev @capacitor/assets` then
  `npx @capacitor/assets generate --android`.
- Sanity-check the generated density buckets exist under
  `android/app/src/main/res/mipmap-*` and `drawable-*`.

- [x] Commit: `feat: kora market app icon and splash`

## Task 7 — Native-shell polish (back button + safe-area + viewport)

1. `npm install @capacitor/app` (only plugin used for real capability).
2. Create `src/components/capacitor-back-button.tsx` ("use client"):

   ```tsx
   "use client";
   import { useEffect } from "react";
   import { Capacitor } from "@capacitor/core";
   import { App } from "@capacitor/app";

   export function CapacitorBackButton() {
     useEffect(() => {
       if (!Capacitor.isNativePlatform()) return;
       const register = App.addListener("backButton", () => {
         if (window.history.length > 1) window.history.back();
         else App.exitApp();
       });
       return () => { register.then((h) => h.remove()); };
     }, []);
     return null;
   }
   ```

3. Root layout: `<CapacitorBackButton />` next to `<ToastNotice />`.
4. `src/app/layout.tsx` viewport: add `viewportFit: "cover"`.
5. `src/components/site-header.tsx`: needs `pt-[env(safe-area-inset-top)]`
   matching the bottom nav's existing `pb-[env(safe-area-inset-bottom)]`.

### Verify

1. `tsc --noEmit` green.
2. Dev server up; `curl localhost:3001` gets 200, then headless Chromium /
   CDP check at `width 390, height 844, deviceScaleFactor 1`:
   - home page: `document.documentElement.scrollWidth <= 390` (no horizontal overflow);
   - mobile-bottom-nav visible, header doesn't shift layout,
   - `/driver/tasks` and `/seller/products` still render their dedicated shells.

- [ ] Commit: `feat: capacitor back button + safe-area/viewport polish`

## Task 8 — Versioned API seam (`src/lib/api/`)

Local-only adapter wrapping the existing modules, plus an unimplemented http
stub to document the backend contract. **No existing callers migrate** — new
code adopts the seam; existing modules keep working until they need it.

- `src/lib/api/types.ts` — domain interface types re-exported or defined
  locally (products, cart line, order, auth session). Keep original types in
  place (`products.ts` etc.); the seam re-uses them rather than duplicating.
- `src/lib/api/local.ts` — `productsApi`, `cartApi`, `ordersApi`, `authApi`
  implemented as thin wrappers over existing modules. `authApi` centralizes
  the two auth storage keys today (`kora-market-seller-auth-v1`,
  `kora-market-driver-profile-v1`) so new code reads session state only
  through `authApi`.
- `src/lib/api/http.ts` — same four objects, same signatures, every method
  `throw new Error("http adapter not implemented — backend phase")`.
- `src/lib/api/index.ts` — exports the four `http`-bound objects **and** the
  `local` objects, so the backend phase is a one-line swap at the call sites.

### Verify

- `tsc --noEmit` green; `grep -r "kora-market-seller-auth-v1\|kora-market-driver-profile-v1" src --include=*.ts*` →
  all hits are in `local.ts` (plus wherever the original consumers still
  live — note them in DEBUGGING-NOTES.md as pending migration, they are NOT
  this phase's work).

- [ ] Commit: `feat: versioned api seam (local adapter + http stub)`

## Task 9 — Smoke test on device + close-out

1. Download the debug APK from the Task 4 Actions artifact (or local if
   Task 5 succeeded).
2. Owner (this device) sideloads via unknown sources, records the result
   matrix in `DEBUGGING-NOTES.md`:
   - cold first-run: no blank screen (store seeding works),
   - `/driver/tasks` → `/driver/job?id=<real>` round trip,
   - cart → checkout → success flow,
   - seller sign-in → dashboard → product list,
   - hardware back button: exits layer-by-layer, no freeze,
   - no horizontal scroll on the tested pages.
3. Push remaining work; confirm CI green after last commit.

- [ ] Final push + document any follow-ups in DEBUGGING-NOTES.md
