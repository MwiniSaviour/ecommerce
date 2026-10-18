"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { readStorageRaw, subscribeStorageKey, writeStorage } from "@/lib/local-store";

export type AccountSession = { email: string } | null;

function parseAccountSession(raw: string | null): AccountSession {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const session = parsed as Record<string, unknown>;
    return typeof session.email === "string" && session.email.length > 0 ? { email: session.email } : null;
  } catch {
    return null;
  }
}

export function useAccountSession(): AccountSession {
  const raw = useSyncExternalStore(
    (callback) => subscribeStorageKey("kora-market-auth-v1", callback),
    () => readStorageRaw("kora-market-auth-v1"),
    () => null,
  );
  return useMemo(() => parseAccountSession(raw), [raw]);
}

export function setSession(session: AccountSession) {
  writeStorage("kora-market-auth-v1", session === null ? null : JSON.stringify(session));
}

type AuthPanelProps = {
  onSessionChange?: (session: AccountSession) => void;
};

export function SignInPanel({ onSessionChange }: AuthPanelProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const session = useAccountSession();

  function updateSession(next: AccountSession) {
    setSession(next);
    onSessionChange?.(next);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (pending) return;
    setPending(true);
    setError("");
    window.setTimeout(() => {
      const email = String(data.get("email") ?? "").trim();
      if (email.length === 0) {
        setError("Enter the email you shop with so we can reach you.");
        setPending(false);
        return;
      }
      updateSession({ email });
      setPending(false);
      form.reset();
    }, 800);
  }

  function handleSignOut() {
    updateSession(null);
  }

  if (session) {
    return (
      <div data-testid="account-signed-in" className="mx-auto max-w-sm rounded-[2px] border border-border bg-paper p-5">
        <p className="text-[12px] font-medium text-muted">Signed in as</p>
        <p data-testid="account-email" className="mt-0.5 text-[14px] font-bold text-ink">{session.email}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 min-h-10 w-full rounded-[4px] border border-border bg-transparent px-4 text-[13px] font-bold text-ink transition hover:border-brand hover:text-brand"
        >
          Sign out
        </button>
        <span data-testid="account-ready-state" className="contents">ready</span>
      </div>
    );
  }

  return (
    <div data-testid="account-sign-in" className="mx-auto max-w-sm rounded-[2px] border border-border bg-paper p-5">
      <div className="mb-4 flex gap-1 rounded-[99px] bg-sand p-1">
        {(["signin", "signup"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            aria-pressed={mode === option}
            className={`min-h-8 flex-1 rounded-[99px] px-3 text-[12px] font-medium transition ${
              mode === option ? "bg-brand text-white" : "text-ink hover:text-brand"
            }`}
          >
            {option === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        {mode === "signup" && (
          <div className="mb-3">
            <label htmlFor="account-name" className="mb-1 block text-[12px] font-medium text-ink">
              Full name
            </label>
            <input
              id="account-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full rounded-[4px] border border-border bg-sand px-3 py-2 text-[13px] text-ink placeholder:text-muted"
              placeholder="Ama Mensah"
            />
          </div>
        )}
        <div className="mb-3">
          <label htmlFor="account-email" className="mb-1 block text-[12px] font-medium text-ink">
            Email address
          </label>
          <input
            id="account-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-[4px] border border-border bg-sand px-3 py-2 text-[13px] text-ink placeholder:text-muted"
            placeholder="you@example.com"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="account-password" className="mb-1 block text-[12px] font-medium text-ink">
            Password
          </label>
          <input
            id="account-password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full rounded-[4px] border border-border bg-sand px-3 py-2 text-[13px] text-ink placeholder:text-muted"
            placeholder="At least 6 characters"
          />
        </div>
        {error && <p className="mb-3 text-[12px] font-medium text-[#e61601]">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="min-h-10 w-full rounded-[4px] bg-brand px-4 text-[13px] font-bold text-white transition hover:bg-brand-deep disabled:opacity-60"
        >
          {pending ? "Just a second…" : mode === "signin" ? "Sign in to my account" : "Create my Kora account"}
        </button>
      </form>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        This demo store keeps your session on this device only, so details never leave this browser.
      </p>
    </div>
  );
}
