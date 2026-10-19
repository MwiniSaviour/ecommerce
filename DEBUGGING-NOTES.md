# Debugging Notes

Hard-won debugging lessons from building this app on Android/Termux with
Next.js 16 (`--webpack`) + React canary 278794d7. Concise, evidence-first.

## 1. App-wide hydration stall (dev only) — `allowedDevOrigins`

**Symptom:** every route rendered SSR HTML but never hydrated; `await
initialServerResponse` in `next/dist/client/app-index.js` never resumed.
Also: layout code that read `localStorage` kept firing in its
server-snapshot state ~20s in.

**Root cause chain:**
1. Browser was on `127.0.0.1:3001`; `next.config.ts` `allowedDevOrigins`
   listed only the LAN IP → Next dev **blocked the HMR WebSocket**
   (`Blocked cross-origin request to /_next/hmr`, in dev.log).
2. Next instruments RSC fetches with a debug channel over that WebSocket
   and only `close()`es the response after **both** streams end
   (`streamDoneCount === 2` gate in
   `react-server-dom-webpack-client.browser.development.js`).
3. Debug stream never ended → `close()` never ran → root flight model
   never fulfilled → no hydration anywhere.

**Fix:** `allowedDevOrigins: ["10.138.117.210", "localhost", "127.0.0.1"]`
in `next.config.ts`, then restart dev server. Verified: HMR WS opens,
`isr-res` fires, hydration completes.

**Lesson:** a "hanging fetch during hydration" in Next dev can be a
dev-origins/WebSocket problem, not a React bug. Instrument the flight
client's close-gate and the socket lifecycle (listen for `/_next/hmr`
readyState 3 = closed) before touching app code.

## 2. Redirect during hydration — `useSyncExternalStore` race

**Symptom:** signed-in sellers briefly saw the "Sign in required" guard,
or got bounced to `/seller/sign-in` and lost <100ms after the page was
supposedly interactive.

**Root cause:** `SellerLayout`'s redirect effect ran while hydration
still served the *server snapshot* of `useSellerSession()` (`null`),
before React's subscription re-read delivered the client snapshot
(~100ms later). Effect saw `session === null` → navigated away.

**Fix:** the effect now confirms the signed-out state with a direct
`readStorageRaw(SELLER_AUTH_KEY)` read before redirecting
(`src/app/seller/layout.tsx`). Never trust snapshot-based selectors in
effects that fire during/just-after hydration.

## 3. `npm exec next` eats `-p 3001`

`npm exec next dev --webpack -p 3001` fails ("Invalid project directory
provided …/3001") — npm parses `-p 3001` itself. Launch dev with:

```
node node_modules/next/dist/bin/next dev --webpack -p 3001
```

(and ideally an explicit dev.log redirect, since Android may kill
long-running background processes between sessions.)

## 4. `npx tsc` resolves to a bogus stub

`npx tsc --noEmit` installs and runs a fake `tsc@2.0.4` npm package. Use
`./node_modules/.bin/tsc --noEmit`.

## 5. "Guard is stuck" false alarm — dev on-demand recompile

After editing several files, a cold page load showed the guard for up to
~26s with no session read, then rendered fine. Cause: webpack on-demand
recompilation of changed chunks, not an app bug. Always re-run a probe
once before blaming code that allegedly "hangs".

## Harness notes (no code impact)

- Headless Chromium on Termux (`chromium-browser --headless=new
  --remote-debugging-port=9333 --no-sandbox --disable-dev-shm-usage`)
  is the CDP workhorse; drive it with throwaway fetch/Ws interception
  via `chrome.debugger`-style probes, never by editing `node_modules`
  (confirm `node_modules` flight client stays unpatched when done).
- Probe artifacts (`dev.log`, `public/__a2debug.html`,
  `public/__a2seed.html`, `$PREFIX/tmp/opencode/kora-vfy/…`) are
  session-local and intentionally not committed.

## Dev server silent death (Oct 2026)
- `next dev` died between sessions with no entry in dev.log; curl returned 000 and no PID via /proc scan.
- Fix: per-session restart `nohup node node_modules/next/dist/bin/next dev --webpack -p 3001 >> dev.log 2>&1 & disown`; always assume the server is down before verifying output.

## Termux Android build spike — SUCCESS (Oct 2026, Task 5)

**Outcome: native aarch64 Android builds work on-device.** Local build is now
primary; the GitHub Actions debug-apk workflow (`.github/workflows/android-debug.yml`)
stays as fallback for clean-room verification.

### One-time toolchain setup

1. `pkg install openjdk-21` → `java -version` reports 21.0.12. (`pkg install
   gradle` was also run; irrelevant in practice — the wrapper drives Gradle 8.14.3.)
2. Stage aarch64 Android build tools (no official x86_64 works here, no Docker):
   `lzhiyong/android-sdk-tools` release tag `35.0.2` unzipped into
   `$PREFIX/tmp/opencode/android-sdk-tools/` (replace this each session if
   Termux purges `$PREFIX/tmp`):

   ```
   $PREFIX/tmp/opencode/android-sdk-tools/
     licenses/          # only files needed: android-sdk-license + preview
     platforms/android-36/
     build-tools/35.0.0/   # AGP auto-installs the x86_64 jars; we only need:
                           # aapt2, aapt, aidl, zipalign, dexdump, split-select
                           # (aarch64, from the repo's release 35.0.2) + d8/apksigner jars
     platform-tools/
     others/veridex/
   ```

   License files are newline-terminated SHA-1 hashes (public Google values):
   `licenses/android-sdk-license` contains
   `8933bad161af4178b1185d1a37fbf41ea5269c55`,
   `d56f5187479451eabf01fb78af6dfcb131a6481e`,
   `24333f8a63b6825ea9c5514f83c2829b004d1fee`;
   `licenses/android-sdk-preview-license` contains
   `84831b9409646a918e30573bab4c9c91346d8abd`. Without these AGP refuses to
   accept (and cannot download) the x86_64 toolkits it expects.
3. Licenses drop-in → run the wrapper; errors then point at each missing piece.
   Iterating locally beat trying to fake a full `sdkmanager` first.

### The one gotcha: aapt2 override location

- `android.aapt2FromMavenOverride=/…/aapt2` **must go in
  `~/.gradle/gradle.properties` (user-level, untracked)** — putting it in
  `android/local.properties` is *ignored* (property read from user props only)
  and the aapt2 daemon still tries the x86_64 Maven binary.

Verified end to end: `cd android && ./gradlew assembleDebug --console=plain`
→ `BUILD SUCCESSFUL in 4m52s` (side-off, cold start; subsequent builds are
cached and fast). `android/app/build/outputs/apk/debug/app-debug.apk` produced,
7.6 MB, and `npx cap sync android` (per Task 4) stays the sync step before it.

### Pending after Task 8 (versioned api seam)

`src/lib/api/` (Task 8, 2026-10-18 plan) introduces `productsApi`, `cartApi`,
`ordersApi`, `authApi` bound to the **http adapter** (every method throws
"http adapter not implemented — backend phase"). The local bindings stay
exported as `productsApiLocal` / `cartApiLocal` / `ordersApiLocal` /
`authApiLocal`. NO existing callers have migrated yet — that is deliberate
and deferred to the backend phase; the app still uses the seeded
localStorage modules directly. Sync work needed when a backend exists:
1. Migrate login/dashboard/product pages and cart logic to `@/lib/api`
   productsApi/cartApi members. NOTE product finders return `undefined`
   (not null) when a product is missing, so truthiness checks work as-is.
2. After the migration, delete the now-duplicated key literals
   `kora-market-seller-auth-v1` (kept only in `src/lib/seller-auth.ts`)
   and `kora-market-driver-profile-v1` (kept only in
   `src/lib/driver-tasks.ts`); `kora-market-cart-v1` and
   `kora-market-orders-v1` still have deliberate mirrors in
   `src/lib/api/local.ts` (commented there) plus their original
   `storefront-provider.tsx` / `checkout-view.tsx` owners.
3. Confirm double-effect guards on order placement (cart items keep
   separate keys from seller-dashboard orders, so double taps cannot
   collide) still hold if backend logic replaces any of these paths.

### Task 9 smoke-test build + delivery record (2026-10-19)

Built from `ad26fb3` (`feat: versioned api seam (local adapter + http stub)`
+ docs checkbox), cold-cache pipeline:

1. Kill leftover dev server on 3001 (dev.log is gitignored anyway).
2. `NODE_OPTIONS=--max-old-space-size=3000 next build --webpack` — all routes
   prerendered, `/driver/job` (dynamic) served at request time, rest static.
3. `npx cap sync android` — `copy 612ms` + `update 583ms`, 1 plugin found.
4. `android/gradlew assembleDebug` — `BUILD SUCCESSFUL in 41s`
   (cached after the 4m52s cold run in Task 4).

- APK: `android/app/build/outputs/apk/debug/app-debug.apk`, 7,639,562 B.
- SHA-256: `7309f7fa5b5c27e8af1a806a7a22e15917ff99870e4f26473ba46abf2a3a2473`.
- Delivered for sideload: `~/storage/shared/KoraMarket-debug.apk`
  (same SHA-256 verified after copy; owner taps it with the file manager
  and grants the unknown-sources prompt — no adb pairing needed).

CI note: `gh run list` shows no run for `48f7eb1`/`ad26fb3` — by design.
`android-debug.yml` has a `paths:` filter on `android/**`, lockfiles,
`capacitor.config.ts`, and itself; this push touched only `src/lib/**`
+ docs, which the Android workflow intentionally skips. Last consecutive
green: `d53f390f86…` (run 39190150187, `BUILD SUCCESSFUL`, 2m27s), and
that run covers the same android tree this APK came from.

#### Smoke-test matrix (fill in after on-device run)

1. Cold first-run: no blank screen / no white flash pre-login.
2. `/driver/tasks` → pick job → `/driver/job?id=<real-id>` shows fields,
   back returns to `/driver/tasks`.
3. Cart flow: add-to-cart → checkout → success; cart badge count correct.
4. Seller flow: sign-in with seeded ±/demo creds → dashboard → product
   list; logout clears `kora-market-seller-auth-v1` cleanly.
5. Hardware back button: back exits layer-by-layer (no double-back exit
   on root screen last) — Task 7 listener behavior.
6. All screens sized for this window height; no horizontal scrolling
   anywhere.

Results: (pending owner device run)

#### Install-failure troubleshooting record (2026-10-19)

First sideload attempt reported "app not installed". Investigation:

- Ruled out version/ABI: device is Android 13 (API 33) arm64-v8a,
  ≥ minSdk 24; no conflicting kora/scal package installed.
- Ruled out corrupted copy: SHA-256 of the delivered file matched the
  build bit-for-bit.
- Ruled out unsigned APK: `apksigner verify` (build-tools 35 lib jar,
  run as `java -jar lib/apksigner.jar verify --print-certs --verbose`)
  — v2 scheme **true**, debug cert
  `973793a5354c304be7…097`, 1 signer. (v1 shows false because the SDK
  sign step auto-skips it at minSdk ≥ 24 — expected, not an error.)
- Built a v1v2-fallback signed copy and left it at
  `~/storage/shared/KoraMarket-debug-v1v2.apk`
  (7,715,148 B, SHA-256
  `d5294758e94d13136919085f0445b6f839f7159a073f54fe48d43132cde4120c`,
  v2+v3 verified) as a defensive option for quirky OEM installers.
- Installed `android-tools` 37.0.0p1-1 for a wireless-debugging adb
  fallback; `adb` initially failed with a missing abseil symbol
  (`_ZN4absl…LogMessageFatal…` → `abseil-cpp` package mismatch).
  Fix: `apt-get download abseil-cpp && dpkg -i abseil-cpp_20260526.0`
  — reinstall restored the library and `adb` runs (v1.0.41 /
  37.0.0p1-android-tools). `adb` NOT needed for delivery; pairing
  deferred for future debugging sessions.
- Outcome: **install succeeded on owner retry** — root cause not
  definitively isolated (FM read race or v2-only-signing quirk are the
  remaining suspects; the v1v2 file may be the one that landed).

#### Task 9 smoke-test results (2026-10-19)

Results: (pending owner device run)
