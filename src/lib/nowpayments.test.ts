import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  verifyIpnSignature,
  mapPaymentStatusToOrderStatus,
  pickLatestPaymentForOrder,
  type NowPaymentsPayment,
} from "./nowpayments";

const SECRET = "test-ipn-secret";

// Mirror the module's signing: HMAC-SHA512 over deeply key-sorted JSON.
function sign(payload: Record<string, unknown>): string {
  const sortDeep = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(sortDeep);
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      return Object.keys(o)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = sortDeep(o[k]);
          return acc;
        }, {});
    }
    return v;
  };
  return crypto
    .createHmac("sha512", SECRET)
    .update(JSON.stringify(sortDeep(payload)))
    .digest("hex");
}

describe("verifyIpnSignature", () => {
  beforeEach(() => {
    process.env.NOWPAYMENTS_IPN_SECRET = SECRET;
  });

  it("accepts a correctly signed payload regardless of key order", () => {
    const body = JSON.stringify({ b: 2, a: 1, payment_status: "finished" });
    const sig = sign({ a: 1, b: 2, payment_status: "finished" });
    expect(verifyIpnSignature(body, sig)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const sig = sign({ order_id: "x", price_amount: 10 });
    const tampered = JSON.stringify({ order_id: "x", price_amount: 9999 });
    expect(verifyIpnSignature(tampered, sig)).toBe(false);
  });

  it("rejects a missing signature", () => {
    expect(verifyIpnSignature("{}", null)).toBe(false);
  });

  it("rejects when the secret is unset", () => {
    delete process.env.NOWPAYMENTS_IPN_SECRET;
    const sig = sign({ a: 1 });
    expect(verifyIpnSignature(JSON.stringify({ a: 1 }), sig)).toBe(false);
  });
});

describe("mapPaymentStatusToOrderStatus", () => {
  it.each([
    ["finished", "paid"],
    ["partially_paid", "partial"],
    ["failed", "failed"],
    ["refunded", "failed"],
    ["expired", "expired"],
    ["waiting", "awaiting_payment"],
    ["confirming", "awaiting_payment"],
    ["confirmed", "awaiting_payment"],
    ["sending", "awaiting_payment"],
    ["something_new", "awaiting_payment"],
  ])("maps %s -> %s", (input, expected) => {
    expect(mapPaymentStatusToOrderStatus(input)).toBe(expected);
  });
});

describe("pickLatestPaymentForOrder", () => {
  const payments: NowPaymentsPayment[] = [
    { order_id: "a", payment_status: "waiting" },
    { order_id: "b", payment_status: "waiting" },
    { order_id: "a", payment_status: "finished" },
  ];

  it("returns null when no payment matches the order", () => {
    expect(pickLatestPaymentForOrder(payments, "zzz")).toBeNull();
  });

  it("prefers a finished payment when the order has several attempts", () => {
    expect(pickLatestPaymentForOrder(payments, "a")?.payment_status).toBe(
      "finished",
    );
  });

  it("falls back to the first match when none finished", () => {
    expect(pickLatestPaymentForOrder(payments, "b")?.payment_status).toBe(
      "waiting",
    );
  });
});
