import { sign, verify } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { getDb } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const TOKEN_TTL_SECONDS = 12 * 60 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

type AccessPayload = { sub: string; role: string; typ: "access" | "refresh"; exp: number };

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET must be set (at least 16 chars)");
  }
  return s;
}

export async function issueTokens(userId: string, role: string) {
  const now = Math.floor(Date.now() / 1000);
  const token = await sign({ sub: userId, role, typ: "access", exp: now + TOKEN_TTL_SECONDS } as AccessPayload, secret(), "HS256");
  const refreshToken = await sign({ sub: userId, role, typ: "refresh", exp: now + REFRESH_TTL_SECONDS } as AccessPayload, secret(), "HS256");
  return { token, refreshToken, expiresIn: TOKEN_TTL_SECONDS };
}

export type AuthUser = typeof users.$inferSelect;

const authMiddleware = createMiddleware<{ Variables: { authUser: AuthUser } }>(
  async (context, next) => {
    const header = context.req.header("Authorization");
    if (!header || !header.startsWith("Bearer ")) {
      return context.json({ error: "Not authenticated" }, 401);
    }
    let payload: AccessPayload;
    try {
      payload = (await verify(header.slice("Bearer ".length), secret(), "HS256")) as AccessPayload;
    } catch {
      return context.json({ error: "Invalid or expired token" }, 401);
    }
    if (payload.typ !== "access") {
      return context.json({ error: "Not an access token" }, 401);
    }
    const db = getDb();
    const found = await db.select().from(users).where(eq(users.id, payload.sub));
    if (found.length === 0) {
      return context.json({ error: "User no longer exists" }, 401);
    }
    context.set("authUser", found[0]);
    return next();
  },
);

export const requireAuth = authMiddleware;

// Bearer token is honoured when present and valid; anonymous requests pass
// through (authUser stays unset). Used by guest checkout.
export const optionalAuth = createMiddleware<{ Variables: { authUser: AuthUser } }>(
  async (context, next) => {
    const header = context.req.header("Authorization");
    if (!header || !header.startsWith("Bearer ")) return next();
    try {
      const payload = (await verify(header.slice("Bearer ".length), secret(), "HS256")) as AccessPayload;
      if (payload.typ !== "access") return next();
      const found = await getDb().select().from(users).where(eq(users.id, payload.sub)).limit(1);
      if (found.length > 0) context.set("authUser", found[0]);
    } catch {
      // invalid/expired token on an optional route stays anonymous
    }
    return next();
  },
);

export function requireRole(role: string) {
  return createMiddleware<{ Variables: { authUser: AuthUser } }>(async (context, next) => {
    const user = context.get("authUser");
    if (!user) return context.json({ error: "Not authenticated" }, 401);
    if (user.role !== role) {
      return context.json({ error: `Requires ${role} account` }, 403);
    }
    return next();
  });
}
