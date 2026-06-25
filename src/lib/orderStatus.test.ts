import { describe, expect, it } from "vitest";
import {
  isSettledPaid,
  isDeletable,
  PAID_STATUSES,
  DELETABLE_STATUSES,
  SHIPPABLE_STATUSES,
} from "./orderStatus";

describe("isSettledPaid", () => {
  it("is true for paid/fulfilling statuses", () => {
    for (const s of ["paid", "processing", "shipped", "delivered"]) {
      expect(isSettledPaid(s)).toBe(true);
    }
  });
  it("is false for pending/dead statuses", () => {
    for (const s of ["awaiting_payment", "partial", "cancelled", "failed", "expired"]) {
      expect(isSettledPaid(s)).toBe(false);
    }
  });
});

describe("isDeletable", () => {
  it("is true only for dead, never-paid statuses", () => {
    for (const s of ["cancelled", "failed", "expired"]) {
      expect(isDeletable(s)).toBe(true);
    }
    for (const s of ["awaiting_payment", "partial", "paid", "shipped"]) {
      expect(isDeletable(s)).toBe(false);
    }
  });
});

describe("status set invariants", () => {
  it("a settled-paid status is never deletable or pending", () => {
    for (const s of PAID_STATUSES) {
      expect(DELETABLE_STATUSES.includes(s)).toBe(false);
    }
  });
  it("every shippable status is settled-paid", () => {
    for (const s of SHIPPABLE_STATUSES) {
      expect(isSettledPaid(s)).toBe(true);
    }
  });
});
