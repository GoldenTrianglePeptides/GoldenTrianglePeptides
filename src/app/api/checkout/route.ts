import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
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

const SHIPPING_FLAT_CENTS = 1000; // $10 flat-rate shipping

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

  // Load the real products from the DB so prices can't be tampered with client-side.
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });

  // Validate every product exists / is in stock, then build trusted line items.
  const lineItems: {
    productId: string;
    name: string;
    priceCents: number;
    quantity: number;
  }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json(
        { error: "One or more items are no longer available" },
        { status: 400 },
      );
    }
    if (!product.inStock) {
      return NextResponse.json(
        { error: `${product.name} is out of stock` },
        { status: 400 },
      );
    }
    lineItems.push({
      productId: product.id,
      name: product.name,
      priceCents: product.priceCents,
      quantity: item.quantity,
    });
  }

  const subtotal = lineItems.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0,
  );
  const total = subtotal + SHIPPING_FLAT_CENTS;

  // Payment step.
  // Out of the box this records the order as paid (demo mode) so the full
  // purchase flow works end-to-end. To take real payments, integrate a
  // processor (e.g. Stripe) here and only create the order after the charge
  // succeeds.
  const paymentRef = `DEMO-${Date.now().toString(36).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "paid",
      totalCents: total,
      shippingName: shipping.name,
      shippingEmail: shipping.email,
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      shippingState: shipping.state,
      shippingZip: shipping.zip,
      paymentRef,
      items: {
        create: lineItems,
      },
    },
  });

  return NextResponse.json({ orderId: order.id });
}
