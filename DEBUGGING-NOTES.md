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
