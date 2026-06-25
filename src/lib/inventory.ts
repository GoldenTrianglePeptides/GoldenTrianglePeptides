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
