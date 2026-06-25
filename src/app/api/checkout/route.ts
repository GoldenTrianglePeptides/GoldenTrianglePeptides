import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import * as nowpayments from "@/lib/nowpayments";
import { SHIPPING_FLAT_CENTS } from "@/lib/orderStatus";

/**
 * Resolve the public origin used to build payment redirect/callback URLs.
 * Prefer NEXT_PUBLIC_SITE_URL (set in production) and fall back to the origin
 * the request arrived on so local development still works for the redirect URLs.
 */
function resolveOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

const schema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Your cart is empty"),
  shipping: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().toLowerCase().email("Valid email required"),
    address: z.string().trim().min(1, "Address is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    zip: z.string().trim().min(3, "ZIP/postal code is required"),
  }),
});


export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to place an order" },
      { status: 401 },
    );
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

  const { items, shipping } = parsed.data;

  // Load the real variants from the DB so labels and prices can't be tampered
  // with client-side. Legacy carts may pass a productId in the variantId slot
  // (when a product has no variants yet); we fall back to that case.
  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  // For any id that wasn't a variant, try treating it as a legacy productId.
  const missingIds = variantIds.filter(
    (id) => !variants.some((v) => v.id === id),
  );
  const legacyProducts = missingIds.length
    ? await prisma.product.findMany({ where: { id: { in: missingIds } } })
    : [];

  const lineItems: {
    productId: string;
    variantId: string | null;
    name: string;
    priceCents: number;
    quantity: number;
  }[] = [];

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (variant) {
      if (!variant.product.inStock || !variant.inStock) {
        return NextResponse.json(
          {
            error: `${variant.product.name} (${variant.label}) is out of stock`,
          },
          { status: 400 },
        );
      }
      // Enforce tracked inventory so we never sell more than we have.
      if (variant.stockQty !== null && variant.stockQty < item.quantity) {
        return NextResponse.json(
          {
            error: `${variant.product.name} (${variant.label}) — only ${variant.stockQty} left in stock`,
          },
          { status: 400 },
        );
      }
      lineItems.push({
        productId: variant.productId,
        variantId: variant.id,
        name: `${variant.product.name} — ${variant.label}`,
        priceCents: variant.priceCents,
        quantity: item.quantity,
      });
      continue;
    }
    // Legacy fallback: id matches a product with no variants.
    const product = legacyProducts.find((p) => p.id === item.variantId);
    if (product) {
      if (!product.inStock) {
        return NextResponse.json(
          { error: `${product.name} is out of stock` },
          { status: 400 },
        );
      }
      lineItems.push({
        productId: product.id,
        variantId: null,
        name: product.name,
        priceCents: product.priceCents,
        quantity: item.quantity,
      });
      continue;
    }
    return NextResponse.json(
      { error: "One or more items are no longer available" },
      { status: 400 },
    );
  }

  const subtotal = lineItems.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0,
  );
  const total = subtotal + SHIPPING_FLAT_CENTS;

  // --- Payment ---
  // Crypto-only checkout. We create the order as "awaiting_payment", open a
  // hosted NOWPayments invoice, and let the IPN webhook flip it to "paid"
  // once the blockchain confirms it. If the processor isn't configured (e.g.
  // a misconfigured deploy), we refuse to take the order rather than silently
  // recording an unpaid one.
  if (!nowpayments.isConfigured()) {
    console.error(
      "Checkout attempted but NOWPAYMENTS_API_KEY is not set. " +
        "Add the crypto payment env vars in Vercel and redeploy.",
    );
    return NextResponse.json(
      {
        error:
          "Payments are temporarily unavailable. Please try again shortly.",
      },
      { status: 503 },
    );
  }

  const orderDescription = `Golden Triangle Peptides order (${
    lineItems.length
  } item${lineItems.length === 1 ? "" : "s"})`;

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "awaiting_payment",
      totalCents: total,
      shippingName: shipping.name,
      shippingEmail: shipping.email,
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      shippingState: shipping.state,
      shippingZip: shipping.zip,
      paymentProvider: "nowpayments",
      items: { create: lineItems },
    },
  });

  const origin = resolveOrigin(request);
  try {
    const invoice = await nowpayments.createInvoice({
      orderId: order.id,
      priceUsd: total / 100,
      description: orderDescription,
      successUrl: `${origin}/order/${order.id}?paid=1`,
      cancelUrl: `${origin}/order/${order.id}`,
      ipnCallbackUrl: `${origin}/api/webhooks/nowpayments`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentRef: invoice.invoiceId,
        paymentUrl: invoice.invoiceUrl,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      invoiceUrl: invoice.invoiceUrl,
    });
  } catch (err) {
    // Couldn't open an invoice — mark the order failed and surface an error.
    console.error("NOWPayments invoice creation failed:", err);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "failed" },
    });
    return NextResponse.json(
      { error: "Could not start the crypto payment. Please try again." },
      { status: 502 },
    );
  }
}
