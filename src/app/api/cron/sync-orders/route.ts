import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import * as nowpayments from "@/lib/nowpayments";
import { siteUrl } from "@/lib/site";
import { reconcileOrder } from "@/lib/reconcile";
import { releaseOrderStock } from "@/lib/inventory";
import { reportError } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Reconciling several orders (incl. receipt emails) can take a moment.
export const maxDuration = 60;

/**
 * Cron sweep that self-heals orders the IPN webhook never settled.
 *
 * Looks at recent orders still awaiting payment (or partial), fetches the
 * account's payments once, and reconciles each against its real NOWPayments
 * status — settling any that actually paid (receipt + stock), exactly like the
 * webhook would have.
 *
 * Vercel cron calls this with `Authorization: Bearer $CRON_SECRET`. Set
 * `CRON_SECRET` in Vercel env vars to enable; manual hits without the bearer are
 * rejected. Requires NOWPAYMENTS_EMAIL/PASSWORD (see canQueryPayments).
 *
 * NOTE: Vercel's Hobby plan only allows crons that run at most ONCE PER DAY. A
 * sub-daily schedule (e.g. "0 * * * *") makes the whole deployment FAIL — it
 * does not get silently downgraded. Keep the schedule in vercel.json daily on
 * Hobby (it's "0 14 * * *"); only switch to hourly after upgrading to Pro.
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

  if (!nowpayments.canQueryPayments()) {
    // Not an error worth retrying — just nothing to do until creds are set.
    return Response.json({
      ok: false,
      reason: "Payment sync not configured (NOWPAYMENTS_EMAIL/PASSWORD).",
    });
  }

  // Only recent, still-open orders can flip to paid; bound the work.
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["awaiting_payment", "partial"] },
      createdAt: { gte: cutoff },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (orders.length === 0) {
    return Response.json({ ok: true, checked: 0, updated: 0 });
  }

  // One auth + one list call for the whole sweep, matched locally per order.
  let payments;
  try {
    payments = await nowpayments.fetchPaymentsSince(cutoff);
  } catch (err) {
    reportError("cron.syncOrders.list", err);
    return Response.json({ ok: false, reason: "NOWPayments lookup failed." });
  }

  // Abandoned-checkout TTL: an order still awaiting payment this long after
  // creation is treated as expired so its reserved stock is returned. This is
  // the backstop for when NOWPayments never sends an "expired" webhook.
  const abandonedBefore = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const origin = siteUrl();
  let updated = 0;
  let expired = 0;
  for (const order of orders) {
    const payment = nowpayments.pickLatestPaymentForOrder(payments, order.id);
    try {
      const result = await reconcileOrder(order, origin, payment);
      if (result.changed) updated += 1;

      // If it's still unpaid and old, expire it and release the reserved stock.
      if (
        result.status === "awaiting_payment" &&
        order.createdAt < abandonedBefore
      ) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "expired" },
        });
        await releaseOrderStock(order.id);
        expired += 1;
      }
    } catch (err) {
      reportError("cron.syncOrders", err, { orderId: order.id });
    }
  }

  return Response.json({ ok: true, checked: orders.length, updated, expired });
}
