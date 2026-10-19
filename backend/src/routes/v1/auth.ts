import { Hono } from "hono";
import { z } from "zod";
import { verify as verifyJwt } from "hono/jwt";
import { getDb } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { issueTokens, requireAuth, type AuthUser } from "../../auth/jwt.js";
import { hashPassword, verifyPassword } from "../../auth/passwords.js";
import { userToClient } from "../../serialize.js";

export const authRoutes = new Hono<{ Variables: { authUser: AuthUser } }>();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(["customer", "seller", "driver"]),
  business: z.string().min(1).optional(),
});

type RefreshPayload = { sub: string; typ: "access" | "refresh"; exp: number };

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return secret;
}

authRoutes.post("/register", async (context) => {
  const parsed = registerSchema.safeParse(await context.req.json());
  if (!parsed.success) return context.json({ error: "Invalid request" }, 400);
  const { email, password, name, role, business } = parsed.data;
  if (role === "seller" && !business) {
    return context.json({ error: "Seller accounts need a business name" }, 400);
  }
  const db = getDb();
  const normalized = email.toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, normalized));
  if (existing.length > 0) {
    return context.json({ error: "Email already registered" }, 409);
  }
  const inserted = await db
    .insert(users)
    .values({
      role,
      email: normalized,
      passwordHash: hashPassword(password),
      name,
      ...(business ? { business } : {}),
    })
    .returning();
  const tokens = await issueTokens(inserted[0].id, inserted[0].role);
  return context.json({ ...tokens, user: userToClient(inserted[0]) }, 201);
});

authRoutes.post("/login", async (context) => {
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .safeParse(await context.req.json());
  if (!parsed.success) return context.json({ error: "Invalid request" }, 400);
  const db = getDb();
  const found = await db.select().from(users).where(eq(users.email, parsed.data.email.toLowerCase()));
  const user = found[0];
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return context.json({ error: "Invalid email or password" }, 401);
  }
  const tokens = await issueTokens(user.id, user.role);
  return context.json({ ...tokens, user: userToClient(user) });
});

authRoutes.post("/refresh", async (context) => {
  const parsed = z.object({ refreshToken: z.string().min(1) }).safeParse(await context.req.json());
  if (!parsed.success) return context.json({ error: "Invalid request" }, 400);
  let payload: RefreshPayload;
  try {
    payload = (await verifyJwt(parsed.data.refreshToken, jwtSecret(), "HS256")) as RefreshPayload;
  } catch {
    return context.json({ error: "Invalid or expired refresh token" }, 401);
  }
  if (payload.typ !== "refresh") return context.json({ error: "Not a refresh token" }, 401);
  const db = getDb();
  const found = await db.select().from(users).where(eq(users.id, payload.sub));
  if (found.length === 0) return context.json({ error: "User no longer exists" }, 401);
  const tokens = await issueTokens(found[0].id, found[0].role);
  return context.json(tokens);
});

authRoutes.get("/me", requireAuth, (context) => context.json(userToClient(context.get("authUser"))));
