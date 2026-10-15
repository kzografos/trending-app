import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 2; // 2 hours

export interface SessionUser {
  email: string;
  name: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set (see .env.example)");
  }
  return new TextEncoder().encode(secret);
}

/** Signs a JWT for the user and stores it in an httpOnly cookie */
export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({ name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // JavaScript in the page can't read it (protects against XSS)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax", // not sent on cross-site POSTs (protects against CSRF)
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/** Returns the signed-in user, or null. Never throws. */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return { email: payload.sub, name: payload.name };
  } catch {
    return null; // expired, tampered with, or signed with another secret
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
