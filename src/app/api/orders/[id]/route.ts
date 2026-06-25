import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isDeletable } from "@/lib/orderStatus";
import { isSameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Delete one of the customer's own orders from their history. The owner (or an
 * admin) may delete an order that is cancelled, failed, or expired. Paid and
 * still-pending orders can't be deleted here. Items cascade-delete via schema.
 */
export async function DELETE(
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

  if (!isDeletable(order.status)) {
    return NextResponse.json(
      {
        error:
          "Only cancelled, failed, or expired orders can be removed. Contact support for help with this order.",
      },
      { status: 400 },
    );
  }

  await prisma.order.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
