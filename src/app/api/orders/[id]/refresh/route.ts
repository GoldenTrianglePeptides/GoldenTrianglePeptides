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

// Don't pull from NOWPayments more than once per this window per order, even if
// the order page polls faster — keeps API usage sane.
const SYNC_THROTTLE_MS = 15_000;

const PENDING = new Set(["awaiting_payment", "partial"]);

/**
 * Owner-triggered auto-sync: while a customer is looking at a pending order, the
 * order page pings this to reconcile it against NOWPayments in near-real-time,
 * so it settles on its own without the admin clicking Sync or waiting for the
 * daily cron. Throttled per order; a no-op when payment querying isn't
 * configured (NOWPAYMENTS_EMAIL/PASSWORD). Returns the current status.
 */
export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request" }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || (order.userId !== user.id && !user.isAdmin)) {
    // Don't reveal whether the order exists to non-owners.
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Only pending orders can change; nothing to do otherwise.
  if (!PENDING.has(order.status) || !nowpayments.canQueryPayments()) {
    return NextResponse.json({ status: order.status, synced: false });
  }

  // Throttle: skip the NOWPayments call if we checked very recently.
  const since = order.lastSyncedAt?.getTime() ?? 0;
  if (Date.now() - since < SYNC_THROTTLE_MS) {
    return NextResponse.json({ status: order.status, synced: false });
  }

  // Claim this sync window up front so concurrent polls don't all call out.
  await prisma.order.update({
    where: { id: order.id },
    data: { lastSyncedAt: new Date() },
  });

  try {
    const result = await reconcileOrder(order, siteUrl());
    return NextResponse.json({ status: result.status, synced: true });
  } catch (err) {
    reportError("order.autoSync", err, { orderId: order.id });
    return NextResponse.json({ status: order.status, synced: false });
  }
}
