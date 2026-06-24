import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createPasswordResetToken,
  RESET_TOKEN_TTL_MINUTES,
} from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

function resolveOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

/**
 * Request a password reset. Always returns 200 with the same message regardless
 * of whether the email matches an account — this prevents attackers from using
 * this endpoint to enumerate registered emails.
 */
export async function POST(request: Request) {
  // Throttle reset requests per IP to prevent email-spamming a victim.
  const rl = rateLimit(`forgot:${clientIp(request)}`, 5, 30 * 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Generic success response sent in every code path below.
  const ok = NextResponse.json({ ok: true });

  if (!user) return ok;

  try {
    const rawToken = await createPasswordResetToken(user.id);
    const resetUrl = `${resolveOrigin(request)}/reset-password/${rawToken}`;
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
    });
  } catch (err) {
    // Log but don't reveal the failure to the client — same response either way.
    console.error("[forgot-password] Failed to issue reset:", err);
  }

  return ok;
}
