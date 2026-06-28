import { prisma } from "@/lib/db";
import { reportError } from "@/lib/observability";

/** Thrown when a tracked variant can't cover the requested quantity. */
export class InsufficientStockError extends Error {
  constructor(public readonly itemName: string) {
    super(`Insufficient stock for ${itemName}`);
    this.name = "InsufficientStockError";
  }
}

type ReservableItem = {
  variantId: string | null;
  quantity: number;
  name: string;
};

/**
 * Atomically reserve (decrement) tracked stock for an order's items in a single
 * transaction. Untracked variants (`stockQty === null`) and legacy non-variant
 * items are treated as unlimited and skipped. If any tracked variant can't cover
 * the requested quantity the whole transaction rolls back and an
 * InsufficientStockError is thrown — so two concurrent checkouts can never both
 * sell the last unit. A variant that hits zero is flipped out of stock.
 *
 * Call this BEFORE creating the order, then persist `stockReserved: true` on the
 * order so the matching release knows the reservation happened.
 */
export async function reserveStock(items: ReservableItem[]): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      if (!item.variantId) continue; // legacy product, no tracked quantity
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stockQty: true },
      });
      if (!variant || variant.stockQty === null) continue; // untracked → unlimited

      // Conditional decrement: only succeeds if enough is still on hand.
      const { count } = await tx.productVariant.updateMany({
        where: { id: item.variantId, stockQty: { gte: item.quantity } },
        data: { stockQty: { decrement: item.quantity } },
      });
      if (count === 0) throw new InsufficientStockError(item.name);

      const after = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stockQty: true },
      });
      if (after?.stockQty === 0) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { inStock: false },
        });
      }
    }
  });
}

/**
 * Release stock previously reserved for an order, idempotently. The release is
 * claimed atomically via the order's flags: it only runs when the order both
 * reserved stock (`stockReserved`) and hasn't released yet (`stockReleased`),
 * so a duplicate cancel/expire can't restock twice and orders created before
 * reservations existed are left untouched. Restores each tracked variant and
 * brings it back in stock. Never throws — failures are reported, not surfaced.
 */
export async function releaseOrderStock(orderId: string): Promise<void> {
  const { count } = await prisma.order.updateMany({
    where: { id: orderId, stockReserved: true, stockReleased: false },
    data: { stockReleased: true },
  });
  if (count === 0) return; // nothing reserved, or already released

  try {
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      if (!item.variantId) continue;
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stockQty: true },
      });
      if (!variant || variant.stockQty === null) continue; // untracked
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stockQty: { increment: item.quantity }, inStock: true },
      });
    }
  } catch (err) {
    reportError("inventory.release", err, { orderId });
  }
}

/**
 * Re-take stock for an order whose reservation was previously released, used
 * when a cancelled/expired/failed order is revived to paid ("money wins"). The
 * reclaim is claimed atomically via the stockReleased flag (true -> false) so a
 * concurrent settle can't double-decrement. If a variant can no longer cover
 * the quantity (it was sold to someone else after release), stock floors at 0
 * and the shortfall is reported for admin attention rather than blocking the
 * already-paid order. No-op when the order's stock wasn't released.
 */
export async function reclaimReleasedStock(orderId: string): Promise<void> {
  const { count } = await prisma.order.updateMany({
    where: { id: orderId, stockReleased: true },
    data: { stockReleased: false },
  });
  if (count === 0) return; // wasn't released (normal paid order), or already reclaimed

  try {
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      if (!item.variantId) continue;
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stockQty: true },
      });
      if (!variant || variant.stockQty === null) continue; // untracked
      if (variant.stockQty < item.quantity) {
        reportError(
          "inventory.reclaim.shortfall",
          new Error("Revived paid order exceeds available stock"),
          { orderId, variantId: item.variantId, need: item.quantity, have: variant.stockQty },
        );
      }
      const remaining = Math.max(0, variant.stockQty - item.quantity);
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          stockQty: remaining,
          ...(remaining === 0 ? { inStock: false } : {}),
        },
      });
    }
  } catch (err) {
    reportError("inventory.reclaim", err, { orderId });
  }
}
