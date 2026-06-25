import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import * as nowpayments from "@/lib/nowpayments";
import { siteUrl } from "@/lib/site";
import { isSameOrigin } from "@/lib/http";
import { reconcileOrder } from "@/lib/reconcile";
import { reportError } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Don't re-pull an order from NOWPayments more often than this.
const SYNC_THROTTLE_MS = 15_000;

/**
 * Admin-triggered batch auto-sync: reconciles all recent pending orders that are
 * due for a check, using ONE NOWPayments payments list for the whole batch.
 * Pinged by the admin dashboard while it's open so the pending list settles
 * itself. Throttled per order via Order.lastSyncedAt; no-op when payment
 * querying isn't configured.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request" }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!nowpayments.canQueryPayments()) {
    return NextResponse.json({ ok: false, updated: 0, reason: "not configured" });
  }

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dueBefore = new Date(Date.now() - SYNC_THROTTLE_MS);

  // Only orders due for a check (never synced, or not within the throttle window).
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["awaiting_payment", "partial"] },
      createdAt: { gte: cutoff },
      OR: [{ lastSyncedAt: null }, { lastSyncedAt: { lt: dueBefore } }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (orders.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  // Claim them so concurrent admin tabs/polls don't all call out at once.
  await prisma.order.updateMany({
    where: { id: { in: orders.map((o) => o.id) } },
    data: { lastSyncedAt: new Date() },
  });

  let payments;
  try {
    payments = await nowpayments.fetchPaymentsSince(cutoff);
  } catch (err) {
    reportError("admin.syncPending.list", err);
    return NextResponse.json({ ok: false, updated: 0 });
  }

  const origin = siteUrl();
  let updated = 0;
  for (const order of orders) {
    const payment = nowpayments.pickLatestPaymentForOrder(payments, order.id);
    try {
      const result = await reconcileOrder(order, origin, payment);
      if (result.changed) updated += 1;
    } catch (err) {
      reportError("admin.syncPending", err, { orderId: order.id });
    }
  }

  return NextResponse.json({ ok: true, updated });
}
