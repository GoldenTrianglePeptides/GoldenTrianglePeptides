import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { sendAbandonedPaymentReminder } from "@/lib/email";
import { siteUrl } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Hourly cron that nudges customers whose checkout went unpaid.
 *
 * Selects orders that are:
 *  - status = "awaiting_payment"
 *  - older than 1 hour (give them time to actually pay first)
 *  - younger than 24 hours (don't pester someone who clearly abandoned)
 *  - no reminder sent yet (single nudge per order)
 *
 * Vercel cron calls this with `Authorization: Bearer $CRON_SECRET`. Set
 * `CRON_SECRET` in Vercel env vars to enable. Manual hits without the bearer
 * are rejected, so an attacker can't trigger reminders on demand.
 */
export async function GET() {
  return run();
}
export async function POST() {
  return run();
}

async function run(): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.warn("[cron] CRON_SECRET not set — refusing to run.");
    return new Response("Cron not configured", { status: 503 });
  }
  const headerList = await headers();
  const auth = headerList.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = Date.now();
  const oneHourAgo = new Date(now - 60 * 60_000);
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60_000);

  const candidates = await prisma.order.findMany({
    where: {
      status: "awaiting_payment",
      reminderSentAt: null,
      createdAt: { lt: oneHourAgo, gt: twentyFourHoursAgo },
    },
    select: {
      id: true,
      shippingEmail: true,
      shippingName: true,
      totalCents: true,
    },
    take: 100,
  });

  const base = siteUrl();
  let sent = 0;
  for (const o of candidates) {
    try {
      await sendAbandonedPaymentReminder({
        to: o.shippingEmail,
        customerName: o.shippingName,
        orderNumber: o.id.slice(-8).toUpperCase(),
        totalCents: o.totalCents,
        orderUrl: `${base}/order/${o.id}`,
      });
      await prisma.order.update({
        where: { id: o.id },
        data: { reminderSentAt: new Date() },
      });
      sent += 1;
    } catch (err) {
      console.error(`[cron] reminder failed for order ${o.id}:`, err);
    }
  }

  return Response.json({ ok: true, considered: candidates.length, sent });
}
