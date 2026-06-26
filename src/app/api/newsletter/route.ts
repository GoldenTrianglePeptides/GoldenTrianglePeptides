import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isSameOrigin } from "@/lib/http";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";
import { newWelcomeCode, WELCOME_DISCOUNT_PERCENT } from "@/lib/discount";
import { sendWelcomeDiscount } from "@/lib/email";
import { siteUrl } from "@/lib/site";
import { reportError } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

/**
 * Newsletter signup. Creates (or finds) a subscriber, ensures they have a
 * one-time first-order discount code, and emails it. Always responds the same
 * way so it can't be used to probe which emails are subscribed.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request" }, { status: 403 });
  }

  const rl = rateLimit(`newsletter:${clientIp(request)}`, 5, 10 * 60_000);
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

  try {
    // Create the subscriber if new; reuse the existing code otherwise.
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    const subscriber =
      existing ??
      (await prisma.subscriber.create({
        data: { email, discountCode: newWelcomeCode() },
      }));

    // Only email the code if it hasn't been used yet.
    if (!subscriber.discountUsed) {
      await sendWelcomeDiscount({
        to: email,
        code: subscriber.discountCode,
        percent: WELCOME_DISCOUNT_PERCENT,
        shopUrl: `${siteUrl()}/products`,
      });
    }
  } catch (err) {
    reportError("newsletter.signup", err);
    // Fall through to a generic success — don't leak internal errors.
  }

  return NextResponse.json({ ok: true });
}
