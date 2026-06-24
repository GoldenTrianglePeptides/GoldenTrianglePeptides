"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/login?next=/admin/products");
  return user;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string) {
  const root = base || "product";
  let slug = root;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

function refreshStorefront() {
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

const ProductInput = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  cas: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  price: z.coerce.number().min(0),
  sizeMg: z.coerce.number().int().min(0),
  purity: z.string().trim().min(1),
  description: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1),
  featured: z.boolean(),
  inStock: z.boolean(),
});

export async function toggleStock(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({
    where: { id },
    select: { inStock: true },
  });
  if (product) {
    await prisma.product.update({
      where: { id },
      data: { inStock: !product.inStock },
    });
  }
  refreshStorefront();
}

export async function toggleFeatured(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({
    where: { id },
    select: { featured: true },
  });
  if (product) {
    await prisma.product.update({
      where: { id },
      data: { featured: !product.featured },
    });
  }
  refreshStorefront();
}

export async function updatePrice(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const price = Number(formData.get("price"));
  if (id && Number.isFinite(price) && price >= 0) {
    await prisma.product.update({
      where: { id },
      data: { priceCents: Math.round(price * 100) },
    });
  }
  refreshStorefront();
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const inUse = await prisma.orderItem.count({ where: { productId: id } });
  if (inUse > 0) {
    redirect(
      `/admin/products?error=${encodeURIComponent(
        "That product appears in past orders, so it can't be deleted. Mark it Out of stock instead.",
      )}`,
    );
  }
  await prisma.product.delete({ where: { id } });
  refreshStorefront();
  redirect(`/admin/products?saved=${encodeURIComponent("Product deleted")}`);
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const parsed = ProductInput.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    cas: formData.get("cas") ?? undefined,
    price: formData.get("price"),
    sizeMg: formData.get("sizeMg"),
    purity: formData.get("purity"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    featured: formData.get("featured") === "on",
    inStock: formData.get("inStock") === "on",
  });

  if (!parsed.success) {
    const target = id
      ? `/admin/products/${id}/edit`
      : "/admin/products/new";
    redirect(
      `${target}?error=${encodeURIComponent(
        "Please fill in all required fields (name, category, price, purity, description).",
      )}`,
    );
  }

  const d = parsed.data;
  const data = {
    name: d.name,
    category: d.category,
    cas: d.cas,
    priceCents: Math.round(d.price * 100),
    sizeMg: d.sizeMg,
    purity: d.purity,
    description: d.description,
    imageUrl: d.imageUrl,
    featured: d.featured,
    inStock: d.inStock,
  };

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    const slug = await uniqueSlug(slugify(d.name));
    const created = await prisma.product.create({ data: { ...data, slug } });
    // Auto-create the first variant from the form values so every product
    // ships with at least one buyable size out of the gate.
    await prisma.productVariant.create({
      data: {
        productId: created.id,
        label: d.sizeMg > 0 ? `${d.sizeMg} mg` : "Default",
        sizeMg: d.sizeMg,
        priceCents: Math.round(d.price * 100),
        sortOrder: 0,
      },
    });
    refreshStorefront();
    redirect(`/admin/products/${created.id}/edit?saved=${encodeURIComponent("Product created — add more sizes below")}`);
  }

  refreshStorefront();
  redirect(`/admin/products?saved=${encodeURIComponent("Product saved")}`);
}

// ---------- Variant actions ----------

const VariantInput = z.object({
  label: z.string().trim().min(1),
  sizeMg: z.coerce.number().int().min(0),
  price: z.coerce.number().min(0),
  // Blank = untracked (unlimited). A number = tracked stock count.
  stock: z
    .string()
    .trim()
    .optional()
    .transform((v) => {
      if (!v) return null;
      const n = Math.floor(Number(v));
      return Number.isFinite(n) && n >= 0 ? n : null;
    }),
});

export async function addVariant(productId: string, formData: FormData) {
  await requireAdmin();
  const parsed = VariantInput.safeParse({
    label: formData.get("label"),
    sizeMg: formData.get("sizeMg"),
    price: formData.get("price"),
    stock: formData.get("stock") ?? undefined,
  });
  if (!parsed.success) {
    redirect(
      `/admin/products/${productId}/edit?error=${encodeURIComponent(
        "Variant needs a label, size, and price.",
      )}`,
    );
  }
  const d = parsed.data;
  const max = await prisma.productVariant.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });
  await prisma.productVariant.create({
    data: {
      productId,
      label: d.label,
      sizeMg: d.sizeMg,
      priceCents: Math.round(d.price * 100),
      stockQty: d.stock,
      // A size added with 0 stock starts out of stock.
      inStock: d.stock !== 0,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  refreshStorefront();
  redirect(
    `/admin/products/${productId}/edit?saved=${encodeURIComponent("Size added")}`,
  );
}

export async function updateVariant(variantId: string, formData: FormData) {
  await requireAdmin();
  const v = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { productId: true },
  });
  if (!v) return;
  const parsed = VariantInput.safeParse({
    label: formData.get("label"),
    sizeMg: formData.get("sizeMg"),
    price: formData.get("price"),
    stock: formData.get("stock") ?? undefined,
  });
  if (!parsed.success) {
    redirect(
      `/admin/products/${v.productId}/edit?error=${encodeURIComponent(
        "Each size needs a label, mg, and price.",
      )}`,
    );
  }
  const d = parsed.data;
  await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      label: d.label,
      sizeMg: d.sizeMg,
      priceCents: Math.round(d.price * 100),
      stockQty: d.stock,
      // When stock is tracked, availability follows the count; untracked
      // stock leaves the in/out-of-stock toggle as the admin set it.
      ...(d.stock !== null ? { inStock: d.stock > 0 } : {}),
    },
  });
  refreshStorefront();
  redirect(
    `/admin/products/${v.productId}/edit?saved=${encodeURIComponent("Size updated")}`,
  );
}

export async function toggleVariantStock(variantId: string) {
  await requireAdmin();
  const v = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { inStock: true },
  });
  if (v) {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { inStock: !v.inStock },
    });
  }
  refreshStorefront();
}

export async function deleteVariant(variantId: string) {
  await requireAdmin();
  const v = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { productId: true, _count: { select: { orderItems: true } } },
  });
  if (!v) return;
  if (v._count.orderItems > 0) {
    redirect(
      `/admin/products/${v.productId}/edit?error=${encodeURIComponent(
        "That size appears in past orders, so it can't be deleted. Mark it out of stock instead.",
      )}`,
    );
  }
  await prisma.productVariant.delete({ where: { id: variantId } });
  refreshStorefront();
  redirect(
    `/admin/products/${v.productId}/edit?saved=${encodeURIComponent("Size removed")}`,
  );
}
