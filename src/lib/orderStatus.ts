// Single source of truth for order lifecycle statuses. Previously these sets
// were copy-pasted across the webhook, admin, account, order, ship, and delete
// code paths — any drift silently mis-bucketed orders (e.g. revenue totals).
// Import from here instead of re-declaring arrays.

export const ORDER_STATUSES = [
  "awaiting_payment",
  "partial",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
  "expired",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Money received / being fulfilled. A settled order must never move backward.
// Typed as readonly string[] so `.includes(someString)` is ergonomic at call
// sites (the `as const` literal-tuple typing fights that).
export const SETTLED_PAID_STATUSES: readonly string[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
];

// Statuses that count as a real, completed sale (admin dashboard + revenue).
export const PAID_STATUSES = SETTLED_PAID_STATUSES;

// Dead, never-paid states. A customer may delete these from their history.
export const DELETABLE_STATUSES: readonly string[] = [
  "cancelled",
  "failed",
  "expired",
];

// Terminal non-paid states (shown as failed/cancelled in the UI).
export const FAILED_STATUSES: readonly string[] = [
  "failed",
  "expired",
  "cancelled",
];

// Statuses an admin may mark as shipped (already paid for).
export const SHIPPABLE_STATUSES: readonly string[] = [
  "paid",
  "processing",
  "shipped",
];

// Statuses that hold reserved inventory: stock is reserved at checkout and
// released when an order reaches a dead state. (awaiting_payment + partial hold
// a reservation that hasn't been settled or released yet; the settled-paid
// states keep the stock for good.)
export const STOCK_HOLDING_STATUSES: readonly string[] = [
  "awaiting_payment",
  "partial",
  "paid",
  "processing",
  "shipped",
  "delivered",
];

export function isSettledPaid(status: string): boolean {
  return SETTLED_PAID_STATUSES.includes(status);
}

export function isDeletable(status: string): boolean {
  return DELETABLE_STATUSES.includes(status);
}

// Flat-rate shipping in cents. Kept here so checkout and the receipt can't
// silently disagree about the shipping line.
export const SHIPPING_FLAT_CENTS = 1000;
