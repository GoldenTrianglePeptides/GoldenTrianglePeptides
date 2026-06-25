import crypto from "node:crypto";

// NOWPayments integration.
//
// NOWPayments is a non-custodial crypto payment processor: each payment is
// automatically forwarded to the merchant's own wallet address (configured in
// the NOWPayments dashboard under Payment Settings -> Outcome Wallet), so funds
// never sit with us. We only create a hosted invoice and listen for the IPN
// (Instant Payment Notification) webhook that tells us when a payment lands.
//
// Required environment variables (set these in Vercel -> Project -> Settings ->
// Environment Variables):
//   NOWPAYMENTS_API_KEY     - from Dashboard -> Settings -> API keys
//   NOWPAYMENTS_IPN_SECRET  - from Dashboard -> Settings -> IPN/Instant Payment
//   NEXT_PUBLIC_SITE_URL    - your public site origin, e.g.
//                             https://goldentrianglepeptide.com (used to build
//                             the success/cancel/callback URLs)
//
// Optional, only for the admin "sync payment status" backstop (pulls the real
// status from NOWPayments when the IPN webhook didn't arrive). The list-payments
// endpoint requires a JWT, which needs your dashboard login:
//   NOWPAYMENTS_EMAIL       - your NOWPayments account email
//   NOWPAYMENTS_PASSWORD    - your NOWPayments account password

const API_BASE = "https://api.nowpayments.io/v1";

/** True when the store is configured to take live crypto payments. */
export function isConfigured(): boolean {
  return Boolean(process.env.NOWPAYMENTS_API_KEY);
}

/** True when incoming IPN webhooks can be cryptographically verified. */
export function canVerifyIpn(): boolean {
  return Boolean(process.env.NOWPAYMENTS_IPN_SECRET);
}

/**
 * True when we can pull payment status from NOWPayments on demand. The
 * list-payments endpoint needs a JWT (dashboard login), so this requires the
 * email/password env vars in addition to the API key.
 */
export function canQueryPayments(): boolean {
  return Boolean(
    process.env.NOWPAYMENTS_API_KEY &&
      process.env.NOWPAYMENTS_EMAIL &&
      process.env.NOWPAYMENTS_PASSWORD,
  );
}

type CreateInvoiceParams = {
  orderId: string;
  /** Amount in whole US dollars (e.g. 129.99). */
  priceUsd: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
  ipnCallbackUrl: string;
};

type CreateInvoiceResult = {
  invoiceId: string;
  invoiceUrl: string;
};

/**
 * Create a hosted NOWPayments invoice. The customer is redirected to
 * `invoiceUrl`, where they choose a coin and pay. Returns the invoice id and
 * hosted URL. Throws on any non-OK response so the caller can fail the order.
 */
export async function createInvoice(
  params: CreateInvoiceParams,
): Promise<CreateInvoiceResult> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error("NOWPAYMENTS_API_KEY is not set");
  }

  const res = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: params.priceUsd,
      price_currency: "usd",
      order_id: params.orderId,
      order_description: params.description,
      ipn_callback_url: params.ipnCallbackUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      is_fee_paid_by_user: true,
    }),
    // Never let a hung processor request hang the checkout indefinitely.
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `NOWPayments invoice creation failed (${res.status}): ${detail}`,
    );
  }

  const data = (await res.json()) as { id?: string; invoice_url?: string };
  if (!data.id || !data.invoice_url) {
    throw new Error("NOWPayments returned an unexpected invoice response");
  }

  return { invoiceId: data.id, invoiceUrl: data.invoice_url };
}

/**
 * Authenticate with email/password to get a short-lived (≈5 min) JWT. Required
 * by the list-payments endpoint; the API key alone isn't enough there.
 */
async function getAuthToken(): Promise<string> {
  const email = process.env.NOWPAYMENTS_EMAIL;
  const password = process.env.NOWPAYMENTS_PASSWORD;
  if (!email || !password) {
    throw new Error("NOWPAYMENTS_EMAIL / NOWPAYMENTS_PASSWORD are not set");
  }

  const res = await fetch(`${API_BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`NOWPayments auth failed (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("NOWPayments auth returned no token");
  return data.token;
}

/** A NOWPayments payment record (only the fields we use). */
export type NowPaymentsPayment = {
  payment_id?: number | string;
  invoice_id?: number | string | null;
  order_id?: string | null;
  payment_status?: string;
  price_amount?: number;
  pay_amount?: number;
  outcome_amount?: number;
};

/**
 * Find the latest NOWPayments payment for one of our orders, matched by the
 * `order_id` we set when creating the invoice. This is the backstop for when the
 * IPN webhook never arrived. Returns null if no payment exists for the order
 * yet. Requires `canQueryPayments()` to be true.
 *
 * `since` narrows the server-side date window (NOWPayments expects YYYY-MM-DD);
 * pass a little before the order was created.
 */
export async function fetchLatestPaymentForOrder(
  orderId: string,
  opts?: { since?: Date },
): Promise<NowPaymentsPayment | null> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error("NOWPAYMENTS_API_KEY is not set");

  const token = await getAuthToken();

  const params = new URLSearchParams({
    limit: "500",
    page: "0",
    sortBy: "created_at",
    orderBy: "desc",
  });
  if (opts?.since) {
    params.set("dateFrom", opts.since.toISOString().slice(0, 10));
  }

  const res = await fetch(`${API_BASE}/payment/?${params.toString()}`, {
    headers: {
      "x-api-key": apiKey,
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `NOWPayments list payments failed (${res.status}): ${detail}`,
    );
  }

  const data = (await res.json()) as { data?: NowPaymentsPayment[] };
  const matches = (data.data ?? []).filter((p) => p.order_id === orderId);
  if (matches.length === 0) return null;

  // The list is sorted newest-first, but prefer a finished payment if the order
  // was paid across more than one attempt.
  return matches.find((p) => p.payment_status === "finished") ?? matches[0];
}

/**
 * Recursively sort object keys so the JSON we sign matches exactly what
 * NOWPayments signed. This mirrors NOWPayments' documented IPN verification.
 */
function sortObjectDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectDeep);
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObjectDeep(obj[key]);
        return acc;
      }, {});
  }
  return value;
}

/**
 * Verify an IPN webhook payload against the `x-nowpayments-sig` header.
 * `rawBody` MUST be the exact request body string (do not re-stringify a parsed
 * object before calling — parse a copy). Returns false if the secret is missing
 * or the signature does not match.
 */
export function verifyIpnSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret || !signature) return false;

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return false;
  }

  const expected = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(sortObjectDeep(parsed)))
    .digest("hex");

  // Constant-time comparison to avoid leaking timing information.
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Map a raw NOWPayments payment status to our internal order status.
 * See https://documenter.getpostman.com/view/7907941/S1a32n38 for the lifecycle:
 * waiting -> confirming -> confirmed -> sending -> finished.
 */
export function mapPaymentStatusToOrderStatus(
  paymentStatus: string,
): "paid" | "awaiting_payment" | "partial" | "failed" | "expired" {
  switch (paymentStatus) {
    case "finished":
      return "paid";
    case "partially_paid":
      return "partial";
    case "failed":
    case "refunded":
      return "failed";
    case "expired":
      return "expired";
    // waiting, confirming, confirmed, sending -> still in flight
    default:
      return "awaiting_payment";
  }
}
