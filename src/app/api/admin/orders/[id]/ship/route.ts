import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendShippingNotification } from "@/lib/email";
import { SHIPPING_CARRIERS } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  trackingNumber: z.string().trim().max(100).optional().or(z.literal("")),
  carrier: z.enum(SHIPPING_CARRIERS).optional(),
  // When false, mark shipped without emailing (e.g. fixing a typo silently).
  notify: z.boolean().optional().default(true),
});

function resolveOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

/**
 * Admin-only: mark an order shipped (storing tracking info) and optionally
 * email the customer a shipping notification.
 */
export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

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

  const { id } = await ctx.params;
  const trackingNumber = parsed.data.trackingNumber?.trim() || null;
  const carrier = parsed.data.carrier ?? null;
  const notify = parsed.data.notify ?? true;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Guard against shipping something that was never paid for.
  const shippable = ["paid", "processing", "shipped"].includes(order.status);
  if (!shippable) {
    return NextResponse.json(
      { error: `Can't ship an order that is "${order.status}".` },
      { status: 400 },
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: "shipped",
      trackingNumber,
      trackingCarrier: carrier,
      shippedAt: order.shippedAt ?? new Date(),
    },
  });

  if (notify) {
    await sendShippingNotification({
      to: updated.shippingEmail,
      customerName: updated.shippingName,
      orderNumber: updated.id.slice(-8).toUpperCase(),
      trackingNumber: updated.trackingNumber,
      carrier: updated.trackingCarrier,
      orderUrl: `${resolveOrigin(request)}/order/${updated.id}`,
    });
  }

  return NextResponse.json({ ok: true });
}
