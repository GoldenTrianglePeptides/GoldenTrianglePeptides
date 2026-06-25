import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isSameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Admin-only: hard-delete an order (and its line items, via the schema's
 * cascade). Used by the trash button on the admin dashboard.
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
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { id } = await ctx.params;

  try {
    await prisma.order.delete({ where: { id } });
  } catch (err) {
    // P2025 = record not found: already deleted, so a duplicate click is fine.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json({ ok: true });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
