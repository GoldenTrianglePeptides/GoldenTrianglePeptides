import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const SESSION_COOKIE = "gtp_session";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

// In production, set AUTH_SECRET to a long random string.
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    "dev-insecure-secret-change-me-in-production-please-0123456789",
);

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub;
    if (!userId || typeof userId !== "string") return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };
  } catch {
    return null;
  }
}
